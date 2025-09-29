import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { verifyPaymentSignature, fetchPaymentDetails } from '@/lib/razorpay';
import { sendErrorEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      transactionId 
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification data is incomplete' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

    await connectDB();

    // Update transaction with payment details
    if (transactionId) {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId: session.user.id,
      });

      if (transaction) {
        transaction.payment = {
          method: 'razorpay',
          status: paymentDetails.status === 'captured' ? 'completed' : 'failed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          transactionId: paymentDetails.id,
          gateway: 'razorpay',
        };
        await transaction.save();
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentDetails.id,
        status: paymentDetails.status,
        amount: paymentDetails.amount / 100, // Convert from paise
        currency: paymentDetails.currency,
        method: paymentDetails.method,
        captured: paymentDetails.captured,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    await sendErrorEmail({ route: '/api/payments/verify', method: 'POST', error });
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
