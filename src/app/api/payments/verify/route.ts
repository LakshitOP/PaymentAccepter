import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * POST /api/payments/verify
 * Updates payment status (admin only)
 * Requires: Authorization Bearer token, paymentId, status
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

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { paymentId, status, notes } = body;

    // Validate input
    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    let decodedToken;
    try {
      decodedToken = await adminAuth!.verifyIdToken(token);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminDoc = await adminDb!
      .collection('admins')
      .doc(decodedToken.email || '')
      .get();

    if (!adminDoc.exists) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Update payment status
    const paymentRef = adminDb!.collection('payments').doc(paymentId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    await paymentRef.update({
      status,
      notes: notes || paymentDoc.data()?.notes || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: decodedToken.email,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[Payment Updated] ID: ${paymentId}, Status: ${status}, Admin: ${decodedToken.email}`);

    return NextResponse.json({
      success: true,
      message: `Payment ${status} successfully`,
    });
  } catch (error: any) {
    console.error('[Payment Verification Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
