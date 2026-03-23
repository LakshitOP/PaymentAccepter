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

    // Get filter from query params
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    let query: any = adminDb.collection('payments').orderBy('createdAt', 'desc');

    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query = adminDb
        .collection('payments')
        .where('status', '==', statusFilter)
        .orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    const payments = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.(),
    }));

    return NextResponse.json({
      success: true,
      payments,
      count: payments.length,
    });
  } catch (error: any) {
    console.error('List payments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list payments' },
      { status: 500 }
    );
  }
}
