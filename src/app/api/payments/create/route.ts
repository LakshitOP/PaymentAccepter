import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * POST /api/payments/create
 * Creates a new payment entry in Firestore
 * Requires: Authorization Bearer token, amount, email
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { amount, userId, email, name } = body;

    // Validate input
    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, email' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header. Expected: Bearer <token>' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    let decodedToken;
    try {
      decodedToken = await adminAuth!.verifyIdToken(token);
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify email matches token
    if (decodedToken.email !== email) {
      return NextResponse.json(
        { error: 'Email mismatch with authentication token' },
        { status: 403 }
      );
    }

    // Create payment entry in Firestore
    const paymentRef = adminDb!.collection('payments').doc();
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

    console.log(`[Payment Created] ID: ${paymentRef.id}, Email: ${email}, Amount: ${amount}`);

    return NextResponse.json(
      {
        success: true,
        paymentId: paymentRef.id,
        message: 'Payment submitted for verification',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Payment Creation Error]', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create payment',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
