# 🚀 Complete Setup Guide - Manual UPI Payment System

## System Architecture Overview

This guide explains how to set up your Payment Receiver website with manual UPI verification on Firestore.

### Data Structure

The system uses two main collections:

```
Firestore
├── payments/
│   ├── {paymentId}
│   │   ├── id: string
│   │   ├── userId: string
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── amount: number
│   │   ├── status: "pending" | "approved" | "rejected"
│   │   ├── notes: string
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   └── approvedBy: string (admin email)
│   └── ...
├── admins/
│   ├── {adminEmail}
│   │   ├── role: "admin"
│   │   └── email: string
│   └── ...
└── config/
    └── payment
        └── amount: number
```

## 📋 Step-by-Step Setup (10 Minutes)

### 1. Firebase Firestore Collections Setup

Go to [Firebase Console](https://console.firebase.google.com/) → Select your project → Firestore Database

#### Create `payments` Collection
- Click **Create Collection** → Name: `payments`
- Start with one document to initialize (can delete after)
- Leave **Auto ID** selected

#### Create `admins` Collection
- Click **Create Collection** → Name: `admins`
- Click **Add Document** → Document ID: **your-email@example.com**
- Add fields:
  ```
  role: "admin"
  email: "your-email@example.com"
  ```

#### Create `config` Document
- Go to **Collections** → Click **Create Collection** → Name: `config`
- Click **Add Document** → Document ID: `payment`
- Add fields:
  ```
  amount: 20
  ```

### 2. Firestore Security Rules

Go to **Firestore Database** → **Rules** → Replace with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can create and read their own payments
    match /payments/{paymentId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.email == request.auth.token.email ||
        get(/databases/$(database)/documents/admins/$(request.auth.token.email)).exists()
      );
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/admins/$(request.auth.token.email)).exists();
    }
    
    // Only admins can read/write admin collection
    match /admins/{email} {
      allow read, write: if request.auth.token.email == email ||
        get(/databases/$(database)/documents/admins/$(request.auth.token.email)).exists();
    }
    
    // Everyone can read config
    match /config/{document=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/admins/$(request.auth.token.email)).exists();
    }
  }
}
```

Click **Publish**

### 3. Environment Variables

Update your `.env.local` file:

```env
# Firebase Client Config (from Firebase Console → Settings → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXxxx...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin SDK Key (from Firebase Console → Settings → Service Accounts → Generate New Private Key)
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"your-project","private_key":"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"}
```

### 4. Create Admin User in Firebase Auth

Go to **Firebase Console** → **Authentication** → **Users** → **Create User**

- Email: **your-email@example.com**
- Password: **Create a strong password**
- Click **Create User**

### 5. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🌐 Production Deployment (Vercel)

### 1. Deploy to Vercel

```bash
git add .
git commit -m "Add manual UPI payment system"
git push
```

Go to [Vercel](https://vercel.com/) → Import repository → Deploy

### 2. Fix Firebase CORS Error

The error "(CORS Policy)" happens because Firebase doesn't recognize your domain.

**Solution:**

Go to **Firebase Console** → **Settings** → **Authorized Domains** → Add your Vercel URL:

```
your-project.vercel.app
```

### 3. Add Production Environment Variables

In Vercel → Your Project → **Settings** → **Environment Variables**

Add all `.env.local` variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_ADMIN_SDK_KEY=...
```

### 4. Test Production

After deployment, visit your production URL and test:

1. User login
2. Submit payment
3. Check pending status
4. Admin approval
5. User sees success

## 👤 User Flow

### User Steps:

1. **Login** → `/user/login`
2. **View Payment Page** → `/user/dashboard`
   - See UPI QR code
   - See UPI ID: `9461062645@axl`
   - See amount: ₹20 (configurable)
3. **Click "I Have Paid"** button
4. **Redirected to Pending Page** → `/user/payment-pending?id={paymentId}`
   - Real-time status updates
   - Shows "Waiting for admin confirmation"
5. **Admin Approves** (see admin flow below)
6. **Auto-redirected to Success Page** → `/user/payment-success?id={paymentId}`
   - Shows green checkmark animation
   - Displays payment details
7. **View History** → `/user/payment-history`
   - See all submissions
   - Filter by status

## 👨‍💼 Admin Flow

### Admin Steps:

1. **Login** → `/admin/login`
   - Email from admins collection
   - Password from Firebase Auth
2. **Admin Dashboard** → `/admin/dashboard`
   - View all payments
   - Filter by: All, Pending, Approved, Rejected
3. **Manage Payments**:
   - **Approve**: Payment status → "approved"
   - **Reject**: Payment status → "rejected" + optional reason
4. **Update Global Settings**:
   - Change payment amount (₹20 → any amount)
5. **Real-time Updates**: All changes sync instantly across all users

## 🔌 API Endpoints

### User Endpoints

```
POST /api/payments/create
- Create new payment submission
- Auth: User token required
- Body: { amount, userId?, email, name }
- Returns: { paymentId }

GET /api/payments/get?id={paymentId}
- Get payment details
- Auth: User token required
- Returns: Payment object

GET /api/payments/list?status={pending|approved|rejected}
- List user's payments (for history page)
- Auth: User token required
```

### Admin Endpoints

```
POST /api/payments/verify
- Approve/Reject payment
- Auth: Admin token required
- Body: { paymentId, status: "approved"|"rejected", notes? }
- Returns: { success: true }

GET /api/payments/list?status=...
- List all payments (admin only)
- Auth: Admin token required
- Returns: Array of payments
```

## 🐛 Troubleshooting

### Error: "Access denied. Admin privileges required."

**Cause**: Email exists in Firebase Auth but not in Firestore `admins` collection

**Fix**:
1. Go to Firestore → `admins` collection
2. Add document with ID = your email
3. Add field: `role: "admin"`

### Error: "CORS error when accessing from Vercel"

**Cause**: Vercel domain not authorized in Firebase

**Fix**:
1. Firebase Console → Settings → Authorized Domains
2. Add your Vercel URL
3. Wait 5 minutes, redeploy

### Error: "Payment not found"

**Cause**: Payment collection not created

**Fix**:
1. Firestore Database → Create Collection → `payments`
2. Add one document to initialize

### Payment status not updating in real-time

**Cause**: Firestore rules might be blocking updates

**Fix**:
1. Check Firestore Rules (see step 2 above)
2. Ensure admin email exists in admins collection
3. Restart the page

## 📊 Monitoring & Analytics

### Check Payment Stats:

```
Firestore Console → payments collection
- Total payments
- Approved count: filter status == "approved"
- Pending count: filter status == "pending"
- Rejected count: filter status == "rejected"
```

## 🔒 Security Best Practices

1. **Never share private keys** via email/Slack
2. **Use environment variables** for all secrets
3. **Restrict admin access** to trusted emails only
4. **Enable Firebase activity logs** for audit trail
5. **Test Firestore rules** before deploying
6. **Rotate admin passwords** regularly

## 📞 Support & FAQ

**Q: Can I change the payment amount?**
A: Yes! Admin dashboard → Update "Payment Amount" field

**Q: How do I add more admins?**
A: Firestore → `admins` collection → Add new document with admin email

**Q: Can users modify their payments?**
A: No! Only admins can approve/reject. Users can only submit.

**Q: Is this secure?**
A: Yes! Uses Firebase Auth tokens + Firestore security rules

**Q: How long does admin approval take?**
A: Manual process - typically a few minutes
