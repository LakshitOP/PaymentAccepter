import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, status, notes } = body;

    // Validate input
    if (!paymentId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields: paymentId, status (approved|rejected)' },
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
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Check if user is admin
      const adminEmail = decodedToken.email || '';
      const adminDoc = await adminDb.collection('admins').doc(adminEmail).get();
      if (!adminDoc.exists) {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Update payment status
    await adminDb.collection('payments').doc(paymentId).update({
      status,
      notes: notes || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: token,
    });

    return NextResponse.json({
      success: true,
      message: `Payment ${status}`,
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment' },
      { status: 500 }
    );
  }
}
