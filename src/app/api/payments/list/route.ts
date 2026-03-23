import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

/**
 * GET /api/payments/list
 * Lists payments for current user (or all if admin)
 * Requires: Authorization Bearer token
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not initialized. Check environment variables.' },
        { status: 500 }
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

    const isAdmin = adminDoc.exists;

    // Get payments from Firestore
    let query: any = adminDb!.collection('payments');

    // Non-admins only see their own payments
    if (!isAdmin) {
      query = query.where('email', '==', decodedToken.email || '');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const payments = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      payments,
      isAdmin,
    });
  } catch (error: any) {
    console.error('[Payment List Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payments' },
      { status: 500 }
    );
  }
}
