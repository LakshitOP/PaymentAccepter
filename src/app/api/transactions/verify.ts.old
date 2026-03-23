import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, status } = body;

    if (!transactionId || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID or status' },
        { status: 400 }
      );
    }

    // Update transaction
    await adminDb
      .collection('transactions')
      .doc(transactionId)
      .update({
        status,
        adminVerifiedBy: decodedToken.uid,
        verifiedAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`,
    });
  } catch (error: any) {
    console.error('Verify transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify transaction' },
      { status: 500 }
    );
  }
}
