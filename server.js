#!/usr/bin/env node

/**
 * Simple Express server to handle checkout logging
 * Spawns the Node.js script to log total price to console
 */

import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Single endpoint to log checkout
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

app.listen(PORT, () => {
  console.log(`Checkout logging server running on http://localhost:${PORT}`);
});

