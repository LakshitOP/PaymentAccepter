# Payment Receiver Website - UNO No Mercy 🎮

A full-stack web application for collecting payments (₹20) from users via UPI and providing an admin dashboard for verification. Users log in with Google, make payments through Razorpay, and receive a success animation. Admins manage and verify payments.

## Features ✨

- **User Authentication**: Google OAuth login
- **Real UPI Payments**: Razorpay integration for ₹20 payments
- **Success Animation**: Animated modal with "UNO No Mercy" message
- **Admin Dashboard**: Verify and manage all transactions
- **Firestore Database**: Secure, scalable database for transactions
- **Environment Variables**: All sensitive keys stored securely
- **Responsive Design**: Works on mobile and desktop
- **Real-time Status**: Transaction status updates instantly

## Tech Stack 🛠️

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Payments**: Razorpay
- **Authentication**: Firebase Auth + Email/Password
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Prerequisites 📋

Before starting, you need:

1. **Node.js 16+** (https://nodejs.org/)
2. **Firebase Project** (https://console.firebase.google.com/)
3. **Razorpay Account** (https://dashboard.razorpay.com/)
4. **Google OAuth Credentials** (https://console.cloud.google.com/)

## Setup Instructions 🚀

### 1. Clone and Install Dependencies

```bash
cd "Payment reciver website"
npm install
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Follow the wizard
3. Enable **Firestore Database** (Start in test mode)
4. Enable **Authentication**:
   - Enable "Google" as sign-in method
5. Go to **Project Settings** → **Service Accounts**
6. Click "Generate new private key" → Save the JSON file

#### Configure Firestore

1. Go to **Firestore Database**
2. Create these collections:
   - `users`
   - `transactions`
   - `admins`

#### Create Admin Account

In Firestore, add a document to the `admins` collection:

```
Document ID: admin@example.com
Fields:
{
  "email": "admin@example.com",
  "isAdmin": true,
  "createdAt": (current timestamp)
}
```

Then create a Firebase Auth account for this email (you'll set password in next step).

### 3. Razorpay Setup

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Copy your **Key ID** and **Key Secret**
4. For testing, use [Razorpay Test Credentials](https://razorpay.com/docs/payments/payment-gateway/test-credentials/)

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to **OAuth 2.0 Configuration**
4. Create credentials → **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `http://localhost:3000` (dev)
   - `https://yourdomain.com` (production)
6. Copy **Client ID** and **Client Secret**

### 5. Environment Variables

Copy the `.env.local` file and fill in all variables:

```bash
cp .env.local .env.local
```

Edit `.env.local` with your credentials:

```env
# Firebase Configuration (Get from Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxxxxx

# Firebase Admin SDK (Get from Service Account JSON)
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"..."}

# Razorpay (Get from dashboard)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Credentials (for manual setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_password_here
```

**Important**: 
- ⚠️ Never commit `.env.local` to git (it's in `.gitignore`)
- Keep `FIREBASE_ADMIN_SDK_KEY` and `RAZORPAY_KEY_SECRET` secret
- Variables starting with `NEXT_PUBLIC_` are exposed to the client

### 6. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## Usage 📖

### User Flow

1. **Home Page** (`/`) → Choose "Player" or "Admin"
2. **User Login** (`/user/login`) → Click "Sign in with Google"
3. **User Dashboard** (`/user/dashboard`):
   - See UPI QR Code and ID
   - Click "Pay ₹20"
   - Complete Razorpay payment
   - See success animation
   - Transaction marked as "pending" for admin verification

### Admin Flow

1. **Home Page** (`/`) → Click "Admin"
2. **Admin Login** (`/admin/login`) → Enter email and password
3. **Admin Dashboard** (`/admin/dashboard`):
   - View all pending transactions
   - Click "Verify" to approve or "Reject" to decline
   - See stats: Pending, Verified, Total
   - Filter by status

## Testing 🧪

### Test Razorpay Payments

Use these test card details in Razorpay modal:

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name

### Test UPI (PhonePe/Paytm)

In Razorpay modal, select UPI → Enter a test UPI ID:
- `success@razorpay` (for successful payment)
- `failure@razorpay` (for failed payment)

## File Structure 📁

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── user/
│   │   ├── login/page.tsx       # User Google login
│   │   └── dashboard/page.tsx   # Payment interface
│   ├── admin/
│   │   ├── login/page.tsx       # Admin email login
│   │   └── dashboard/page.tsx   # Admin verification
│   └── api/
│       ├── payment/
│       │   ├── create-order.ts  # Create Razorpay order
│       │   └── verify.ts        # Verify payment signature
│       └── transactions/
│           ├── list.ts          # Fetch pending transactions
│           └── verify.ts        # Mark as verified/rejected
├── lib/
│   ├── firebase.ts              # Firebase client init
│   ├── firebaseAdmin.ts         # Firebase Admin SDK
│   ├── razorpay.ts              # Razorpay client
│   └── auth.ts                  # Auth utilities
├── components/
│   └── SuccessAnimation.tsx      # Success modal animation
└── public/                       # Static assets

.env.local                        # Environment variables (DO NOT COMMIT)
tsconfig.json                     # TypeScript config
tailwind.config.js                # Tailwind CSS config
next.config.js                    # Next.js config
```

## Database Schema 🗄️

### users Collection

```javascript
{
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: Timestamp,
  status: "active"
}
```

### transactions Collection

```javascript
{
  userId: "firebase-uid",
  orderId: "razorpay-order-id",
  amount: 20,
  email: "user@gmail.com",
  name: "John Doe",
  status: "pending" | "verified" | "rejected",
  timestamp: Timestamp,
  razorpayPaymentId: "pay_xxx",
  razorpayOrderId: "order_xxx",
  adminVerifiedBy: "admin-uid",
  verifiedAt: Timestamp
}
```

### admins Collection

```javascript
{
  email: "admin@example.com",
  isAdmin: true,
  createdAt: Timestamp
}
```

## Deployment to Vercel 🌐

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/payment-receiver.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [Vercel.com](https://vercel.com/)
2. Click "New Project" → Select your GitHub repo
3. Set environment variables:
   - Copy all variables from `.env.local`
4. Click "Deploy"

### 3. Update Firebase Authorized Domains

1. Go to Firebase → **Authentication** → **Settings**
2. Add your Vercel domain to **Authorized domains**

## Environment Variables Reference 📝

| Variable | Type | Required | Source |
|----------|------|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | ✅ | Firebase Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | ✅ | Firebase Project Settings |
| `FIREBASE_ADMIN_SDK_KEY` | Secret | ✅ | Firebase Service Account |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | ✅ | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Secret | ✅ | Razorpay Dashboard |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Public | ✅ | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Secret | ✅ | Google Cloud Console |

## Troubleshooting 🔧

### "Firebase config error"
→ Check all `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local`

### "Razorpay payment failed"
→ Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is correct

### "Admin login fails"
→ Ensure admin email exists in Firestore `admins` collection with `isAdmin: true`

### "Payment signature invalid"
→ Verify `RAZORPAY_KEY_SECRET` matches your Razorpay account

## API Endpoints 🔗

### User Payment Flow

- **POST** `/api/payment/create-order` → Create Razorpay order
- **POST** `/api/payment/verify` → Verify payment signature

### Admin Operations

- **GET** `/api/transactions/list` → Fetch pending transactions (requires auth)
- **POST** `/api/transactions/verify` → Mark transaction as verified/rejected (requires auth)

## Scripts 📜

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

## Security Checklist ✅

- ✅ API keys in `.env.local` (never committed)
- ✅ Firebase security rules configured
- ✅ Authentication required for admin endpoints
- ✅ Payment signature verification
- ✅ HTTPS in production
- ✅ CORS properly configured

## Future Enhancements 🚀

- [ ] Email notifications for users
- [ ] User transaction history
- [ ] Automatic verification via webhooks
- [ ] Payment refunds
- [ ] Multiple payment methods (Paytm, Google Pay)
- [ ] Admin bulk operations
- [ ] Analytics dashboard
- [ ] Two-factor authentication for admins

## Support & Issues 💬

For issues or questions:
1. Check `.env.local` configuration
2. Verify Firebase/Razorpay credentials
3. Check browser console for errors
4. Review server logs: `npm run dev`

## License 📄

MIT License - Feel free to use this project

---

**Made with ❤️ for UNO No Mercy** 🎮
