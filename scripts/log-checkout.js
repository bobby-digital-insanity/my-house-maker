#!/usr/bin/env node

/**
 * Node.js script to log checkout total price to console
 * This script is called from the Supabase Edge Function when a checkout occurs
 */

const totalPrice = process.argv[2];

if (!totalPrice) {
  console.error('Error: Total price argument is required');
  console.error('Usage: node scripts/log-checkout.js <totalPrice>');
  process.exit(1);
}

// Format the price for display
const formattedPrice = parseFloat(totalPrice).toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD'
});

// Log to server console with timestamp
const timestamp = new Date().toISOString();
console.log(`[${timestamp}] Checkout completed - Total Price: ${formattedPrice} ($${totalPrice})`);

process.exit(0);

