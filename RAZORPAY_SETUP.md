# Razorpay Integration Setup

This document explains how to set up Razorpay integration for real-time transactions in the Smart Finance Tracker.

## Prerequisites

1. A Razorpay account (sign up at https://razorpay.com)
2. Razorpay API keys (Key ID and Key Secret)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here
```

## Getting Razorpay API Keys

1. Log in to your Razorpay Dashboard
2. Go to Settings > API Keys
3. Generate API Keys (Test mode for development, Live mode for production)
4. Copy the Key ID and Key Secret

## Webhook Setup

1. In your Razorpay Dashboard, go to Settings > Webhooks
2. Create a new webhook with the URL: `https://yourdomain.com/api/payments/webhook`
3. Select the following events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Copy the webhook secret and add it to your environment variables

## Features Added

### 1. Payment Methods
- Cash
- Card
- UPI
- Net Banking
- Wallet
- Online Payment (Razorpay)

### 2. Real-time Payment Processing
- Create payment orders
- Process payments through Razorpay checkout
- Verify payment signatures
- Handle payment success/failure

### 3. Transaction Integration
- Link payments to transactions
- Store payment details in database
- Display payment method in transaction list
- Support for both manual and online transactions

### 4. Webhook Handling
- Automatic payment verification
- Real-time transaction status updates
- Secure webhook signature verification

## Usage

1. When adding a new transaction, select "Online Payment (Razorpay)" as the payment method
2. Click "Add Transaction & Pay" to open the Razorpay checkout
3. Complete the payment using your preferred method (card, UPI, net banking, etc.)
4. The transaction will be automatically recorded upon successful payment

## Security Features

- Payment signature verification
- Webhook signature validation
- Secure API key handling
- Transaction status tracking

## Testing

For testing purposes, use Razorpay's test mode:
- Test cards: https://razorpay.com/docs/payment-gateway/test-cards/
- Test UPI IDs: https://razorpay.com/docs/payment-gateway/test-upi/

## Production Deployment

1. Switch to Live mode in Razorpay Dashboard
2. Update environment variables with live API keys
3. Update webhook URL to production domain
4. Test thoroughly before going live

## Support

For Razorpay-related issues:
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
