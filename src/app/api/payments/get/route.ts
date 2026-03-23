import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

/**
 * GET /api/payments/get?id=paymentId
 * Retrieves a single payment by ID
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

    // Extract payment ID from query params
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing query parameter: id' },
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

    // Get payment from Firestore
    const paymentDoc = await adminDb!.collection('payments').doc(paymentId).get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();

    // Security: Users can only see their own payments, admins can see all
    const isAdmin = await adminDb!
      .collection('admins')
      .doc(decodedToken.email || '')
      .get()
      .then((doc) => doc.exists);

    if (!isAdmin && paymentData?.email !== decodedToken.email) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentDoc.id,
        ...paymentData,
      },
    });
  } catch (error: any) {
    console.error('[Payment Get Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve payment' },
      { status: 500 }
    );
  }
}
