import { NextRequest, NextResponse } from 'next/server';
import razorpayInstance from '@/lib/razorpay';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: 2000, // 20 rupees in paise
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      customer_notify: 1,
      notes: {
        userId,
        email,
        name,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // Store order in Firestore
    await adminDb.collection('transactions').doc(order.id).set({
      userId,
      orderId: order.id,
      amount: 20,
      email,
      name,
      timestamp: new Date(),
      status: 'pending',
      razorpayOrderId: order.id,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
