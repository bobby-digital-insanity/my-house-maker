#!/usr/bin/env node

/**
 * Express server with PostgreSQL database integration
 * Handles authentication, cart operations, and checkout logging
 */

import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables FIRST, before importing anything that needs them
dotenv.config();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Dynamic import for db.js AFTER dotenv.config() runs
let pool;
import('./src/lib/db.js').then(module => {
  pool = module.default;
}).catch(err => {
  console.error('Failed to load database module:', err);
  process.exit(1);
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
