import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { sendErrorEmail } from '@/lib/mailer';
import { env } from '@/config/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event);

    await connectDB();

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    await sendErrorEmail({ route: '/api/payments/webhook', method: 'POST', error });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    const transaction = await Transaction.findOne({
      'payment.razorpayPaymentId': payment.id,
    });

    if (transaction) {
      transaction.payment!.status = 'completed';
      transaction.payment!.transactionId = payment.id;
      await transaction.save();
      console.log('Payment captured for transaction:', transaction._id);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    const transaction = await Transaction.findOne({
      'payment.razorpayPaymentId': payment.id,
    });

    if (transaction) {
      transaction.payment!.status = 'failed';
      await transaction.save();
      console.log('Payment failed for transaction:', transaction._id);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order: any) {
  try {
    const transaction = await Transaction.findOne({
      'payment.razorpayOrderId': order.id,
    });

    if (transaction) {
      transaction.payment!.status = 'completed';
      await transaction.save();
      console.log('Order paid for transaction:', transaction._id);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}
