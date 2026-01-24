import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to find .env file in project root (go up from src/lib/)
const envPath = join(__dirname, '../../.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Fallback to default .env location
  dotenv.config();
}

// Debug: Check if password is loaded (remove after fixing)
if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD is not set!');
  console.log('Looking for .env at:', envPath);
  console.log('.env exists:', existsSync(envPath));
  console.log('All DB env vars:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? 'SET (hidden)' : 'NOT SET'
  });
}

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'myhousemaker',
  user: process.env.DB_USER || 'appadmin',
  password: process.env.DB_PASSWORD || (() => {
    throw new Error('DB_PASSWORD environment variable is required but not set');
  })(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
