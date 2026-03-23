import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, userId, email, name } = body;

    // Validate input
    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, email' },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Create payment entry in Firestore
    const paymentRef = adminDb.collection('payments').doc();
    const paymentData = {
      id: paymentRef.id,
      userId: userId || email,
      email,
      name: name || email.split('@')[0],
      amount,
      status: 'pending', // pending, approved, rejected
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: '',
    };

    await paymentRef.set(paymentData);

    return NextResponse.json({
      success: true,
      paymentId: paymentRef.id,
      message: 'Payment submitted for verification',
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
