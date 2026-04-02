#!/usr/bin/env node

/**
 * Express server with PostgreSQL database integration
 * Handles authentication, cart operations, and checkout logging
 */

import express from 'express';
import https from 'https';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables FIRST, before importing anything that needs them
dotenv.config();

// Initialize LaunchDarkly SDK with Observability plugin
import { init } from '@launchdarkly/node-server-sdk';
import { Observability } from '@launchdarkly/observability-node';

const LD_SDK_KEY = process.env.LAUNCHDARKLY_SDK_KEY || 'sdk-885ef12f-bf8c-4a0d-bf70-64654e06cf8b';

let ldClient = null;
try {
  ldClient = init(LD_SDK_KEY, {
    plugins: [
      new Observability(),
    ],
  });
  console.log('✅ LaunchDarkly Observability initialized');
} catch (error) {
  console.error('❌ Failed to initialize LaunchDarkly Observability:', error.message);
  console.warn('   Server will continue without observability');
}

import pool from './src/lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (trigger will auto-create profile)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at',
      [email, passwordHash, fullName || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      session: { access_token: token },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      session: { access_token: token },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session (verify token)
app.get('/api/auth/session', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0],
      session: { access_token: req.headers['authorization'].split(' ')[1] },
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out (client-side, but endpoint for consistency)
app.post('/api/auth/signout', (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

// ==================== CART ENDPOINTS ====================

// Get cart items
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, room_type, style, price, created_at FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { room_type, style, price } = req.body;

    if (!room_type || !style || price === undefined) {
      return res.status(400).json({ error: 'room_type, style, and price are required' });
    }

    const result = await pool.query(
      'INSERT INTO cart_items (user_id, room_type, style, price) VALUES ($1, $2, $3, $4) RETURNING id, user_id, room_type, style, price, created_at',
      [req.user.id, room_type, style, price]
    );

    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove from cart
app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ error: null });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ error: null });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TRACES ENDPOINT ====================

// Test route to verify server is working (no auth required)
app.get('/api/traces/test', (req, res) => {
  res.json({ 
    message: 'Traces endpoint is working', 
    timestamp: new Date().toISOString(),
    routes: ['GET /api/traces/test', 'POST /api/traces/generate']
  });
});

// Generate distributed trace with multiple spans
app.post('/api/traces/generate', authenticateToken, async (req, res) => {
  console.log('[Trace] POST /api/traces/generate called');
  try {
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    console.log(`[Trace] Starting trace generation for user ${req.user.id}, traceId: ${traceId}`);

    // Span 1: Query user data (creates a database span)
    let userResult;
    try {
      userResult = await pool.query(
        'SELECT id, email, full_name FROM users WHERE id = $1',
        [req.user.id]
      );
      console.log(`[Trace] User query completed, found ${userResult.rows.length} user(s)`);
    } catch (dbError) {
      console.error('[Trace] User query failed:', dbError);
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    // Small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 10));

    // Span 2: Query cart items (creates another database span)
    let cartResult;
    try {
      cartResult = await pool.query(
        'SELECT id, room_type, style, price FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
        [req.user.id]
      );
      console.log(`[Trace] Cart query completed, found ${cartResult.rows.length} cart item(s)`);
    } catch (dbError) {
      console.error('[Trace] Cart query failed:', dbError);
      throw new Error(`Cart query failed: ${dbError.message}`);
    }

    // Small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 5));

    // Span 3: Aggregate data (simulates business logic processing)
    const aggregatedData = {
      userId: req.user.id,
      userEmail: userResult.rows[0]?.email || 'unknown',
      cartItemCount: cartResult.rows.length,
      totalCartValue: cartResult.rows.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
      traceId: traceId,
      timestamp: new Date().toISOString(),
    };

    // Span 4: Log trace event (creates another database span if trace_logs table exists)
    // This will be automatically captured by LaunchDarkly observability
    try {
      // Try to insert into trace_logs table if it exists
      await pool.query(
        `INSERT INTO trace_logs (user_id, trace_id, event_type, metadata, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         ON CONFLICT DO NOTHING`,
        [req.user.id, traceId, 'trace_generated', JSON.stringify(aggregatedData)]
      );
      console.log('[Trace] Trace log inserted successfully');
    } catch (dbError) {
      // Table might not exist, that's okay - trace is still captured by observability
      console.log('[Trace] Note: trace_logs table may not exist, but trace is still captured:', dbError.message);
    }

    const duration = Date.now() - startTime;
    console.log(`[Trace] Trace generation completed in ${duration}ms`);

    res.json({
      success: true,
      traceId: traceId,
      message: `Distributed trace generated successfully in ${duration}ms`,
      data: {
        user: userResult.rows[0],
        cartItems: cartResult.rows,
        aggregated: aggregatedData,
        duration: duration,
        spans: [
          { name: 'SELECT users', duration: '~20-50ms', type: 'database' },
          { name: 'SELECT cart_items', duration: '~15-40ms', type: 'database' },
          { name: 'Process & Aggregate', duration: '~5-15ms', type: 'processing' },
          { name: 'INSERT trace_log', duration: '~10-30ms', type: 'database' },
        ],
      },
    });
  } catch (error) {
    console.error('[Trace] Trace generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: errorMessage 
    });
  }
});

// ==================== CHECKOUT ENDPOINT ====================

app.post('/log-checkout', (req, res) => {
  const { totalPrice } = req.body;

  console.log(`[Server] Received checkout request for: $${totalPrice}`);

  if (!totalPrice) {
    return res.status(400).json({ error: 'Total price is required' });
  }

  // Spawn the Node.js script as a child process
  const scriptPath = join(__dirname, 'scripts', 'log-checkout.js');
  const child = spawn('node', [scriptPath, totalPrice.toString()]);

  // Capture and display script output
  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  // Log any errors from the script
  child.stderr.on('data', (data) => {
    console.error(`Script error: ${data}`);
  });

  // Handle script completion
  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`Script exited with code ${code}`);
    }
  });

  // Return immediately (fire and forget)
  res.json({ success: true, message: 'Checkout logged' });
});

// HTTPS configuration
const certPath = process.env.SSL_CERT_PATH;
const keyPath = process.env.SSL_KEY_PATH;
const useHttps = certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath);

if (useHttps) {
  const options = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
  
  https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on https://0.0.0.0:${PORT}`);
  });
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Note: To enable HTTPS, set SSL_CERT_PATH and SSL_KEY_PATH environment variables');
    console.log('Registered routes:');
    console.log('  - GET  /api/traces/test');
    console.log('  - POST /api/traces/generate');
  });
}
