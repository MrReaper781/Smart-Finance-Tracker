import Razorpay from 'razorpay';
import { env } from '@/config/env';

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// Razorpay types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: number;
  captured: boolean;
  description?: string;
  notes?: Record<string, any>;
}

export interface CreateOrderData {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Create a new order
export async function createRazorpayOrder(data: CreateOrderData): Promise<RazorpayOrder> {
  try {
    const order = await razorpay.orders.create({
      amount: data.amount * 100, // Convert to paise
      currency: data.currency || 'INR',
      receipt: data.receipt,
      notes: data.notes,
    });
    
    return order as RazorpayOrder;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Verify payment signature
export function verifyPaymentSignature(data: PaymentVerificationData): boolean {
  const crypto = require('crypto');
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  
  return expectedSignature === razorpay_signature;
}

// Fetch payment details
export async function fetchPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment as RazorpayPayment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

// Fetch order details
export async function fetchOrderDetails(orderId: string): Promise<RazorpayOrder> {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order as RazorpayOrder;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Failed to fetch order details');
  }
}

// Capture payment
export async function capturePayment(paymentId: string, amount: number): Promise<RazorpayPayment> {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount * 100, 'INR');
    return payment as RazorpayPayment;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new Error('Failed to capture payment');
  }
}
