import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature
    const body_string =
      razorpay_order_id + '|' + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body_string)
      .digest('hex');

    const isSignatureValid = expected_signature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Update transaction status
    await adminDb
      .collection('transactions')
      .doc(razorpay_order_id)
      .update({
        status: 'verified',
        razorpayPaymentId: razorpay_payment_id,
        verifiedAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
