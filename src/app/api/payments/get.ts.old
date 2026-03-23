import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
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

    // Get the paymentId from query params
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    // Fetch payment
    const paymentDoc = await adminDb.collection('payments').doc(paymentId).get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = {
      id: paymentDoc.id,
      ...paymentDoc.data(),
      createdAt: paymentDoc.data()?.createdAt?.toDate?.(),
      updatedAt: paymentDoc.data()?.updatedAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error('Fetch payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}
