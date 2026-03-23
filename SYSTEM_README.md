# Manual UPI Payment Verification System - Complete Documentation

This is a production-ready Next.js + Firebase application that implements a manual UPI-based payment verification system.

## 🎯 What This System Does

Users can:
1. Log in securely
2. Submit a payment for verification
3. Track payment status in real-time
4. View their payment history
5. Get instant notifications when payments are approved

Admins can:
1. Log in securely
2. View all pending payments
3. Approve or reject payments with optional notes
4. Update global payment amounts
5. See approval history

## 📋 System Components

### Pages (7 total)
- **User Dashboard** (`/user/dashboard`) - Main user interface with payment submission
- **User Login** (`/user/login`) - User authentication
- **Payment Pending** (`/user/payment-pending`) - Real-time status tracking
- **Payment Success** (`/user/payment-success`) - Success confirmation with animation
- **Payment History** (`/user/payment-history`) - View all submissions
- **Admin Dashboard** (`/admin/dashboard`) - Manage payments and settings
- **Admin Login** (`/admin/login`) - Admin authentication

### API Endpoints (4 total)
- `POST /api/payments/create` - Submit a payment
- `POST /api/payments/verify` - Admin approve/reject
- `GET /api/payments/get?id={id}` - Get payment details
- `GET /api/payments/list?status=...` - Admin list payments

### Database Schema (Firestore)
```
payments/ (collection)
├── {paymentId}
│   ├── id: string
│   ├── userId: string
│   ├── email: string
│   ├── name: string
│   ├── amount: number
│   ├── status: 'pending' | 'approved' | 'rejected'
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── notes: string
│   └── approvedBy: string

admins/ (collection)
├── {email}
│   ├── role: 'admin'
│   └── email: string

config/ (collection)
└── payment
    └── amount: number
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Firebase project with Firestore and Authentication

### Quick Start (5 minutes)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials from Firebase Console

3. **Set up Firestore:**
   - Create 3 collections: `payments`, `admins`, `config`
   - Add your email to `admins` collection with `role: admin`
   - Create `config/payment` with `amount: 20`

4. **Deploy security rules:**
   - Copy rules from `MANUAL_UPI_SYSTEM_SETUP.md`
   - Paste in Firebase Console → Firestore → Rules

5. **Create test users:**
   - Firebase Console → Authentication
   - Create test user: `testuser@example.com`
   - Create admin: your email

6. **Start development:**
   ```bash
   npm run dev
   ```

7. **Test the system:**
   - User: http://localhost:3000/user/login
   - Admin: http://localhost:3000/admin/login

For detailed setup, run:
```bash
node setup-assistant.js
```

## 🔐 Security Features

### Authentication
- Firebase Authentication (email/password)
- JWT token verification on API endpoints
- Client-side auth state management

### Authorization
- Role-based access control (admin vs user)
- Firestore security rules enforce permissions
- Users can only see their own payments
- Only admins can update payment status

### Data Protection
- Sensitive data in `FIREBASE_ADMIN_SDK_KEY` not exposed
- Public variables prefixed with `NEXT_PUBLIC_`
- Private variables in `.env.local` (not committed to git)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/payments/          # API endpoints
│   │   ├── create.ts
│   │   ├── verify.ts
│   │   ├── get.ts
│   │   └── list.ts
│   ├── user/                  # User pages
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── payment-pending/
│   │   ├── payment-success/
│   │   └── payment-history/
│   ├── admin/                 # Admin pages
│   │   ├── dashboard/
│   │   └── login/
│   └── layout.tsx
├── components/
│   ├── site-navbar.tsx
│   ├── SuccessAnimation.tsx
│   └── ui/                    # UI components
├── lib/
│   ├── firebase.ts            # Firebase client config
│   ├── firebaseAdmin.ts       # Firebase admin config
│   ├── auth.ts
│   ├── razorpay.ts
│   └── utils.ts
```

## 🔄 User Flow

1. **User logs in** → `/user/login`
2. **Views dashboard** → `/user/dashboard`
3. **Clicks "Submit Payment"** → `/api/payments/create` (creates payment)
4. **Redirected to pending** → `/user/payment-pending` (real-time status)
5. **Admin approves** → Payment status updates
6. **User auto-redirected** → `/user/payment-success` (success animation)
7. **Can view history** → `/user/payment-history` (all submissions)

## 👨‍💼 Admin Flow

1. **Admin logs in** → `/admin/login`
2. **Views dashboard** → `/admin/dashboard`
3. **Sees pending payments** → Real-time list updates
4. **Approves/rejects** → Payment status updates
5. **Can update amount** → Global payment settings
6. **Can see stats** → Pending/approved/rejected counts

## 🌐 Real-Time Updates

Both user and admin pages use Firebase `onSnapshot` listeners for instant updates:
- Payment status changes appear immediately
- Admin approvals trigger user redirects
- No page refresh needed

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Works on all screen sizes
- Smooth animations with Framer Motion

## 🛠️ Development

### Run development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Run TypeScript check:
```bash
npx tsc --noEmit
```

### Validate setup:
```bash
node validate-setup.js
```

## 🚀 Deployment to Vercel

1. **Push code to Git:**
   ```bash
   git add .
   git commit -m "Manual UPI payment system"
   git push origin main
   ```

2. **Go to Vercel dashboard:**
   - Import repository from GitHub
   - Add environment variables matching `.env.local`

3. **Configure Firebase:**
   - Firebase Console → Authentication → Settings
   - Add Vercel domain to "Authorized domains"
   - Wait 5-10 minutes for propagation

4. **Deploy:**
   - Vercel automatically builds and deploys
   - Environment variables are securely stored

## 📚 Documentation

- **QUICK_START_MANUAL_UPI.md** - 5-minute quick setup
- **MANUAL_UPI_SYSTEM_SETUP.md** - Comprehensive setup guide
- **VERCEL_DEPLOYMENT_GUIDE.md** - Production deployment
- **SETUP_VALIDATION.md** - Setup checklist with troubleshooting

## 🆘 Troubleshooting

### "Firebase not configured" error
**Solution:** Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are in `.env.local`

### "Permission denied" errors
**Solution:** Check Firestore security rules are deployed correctly

### Admin dashboard shows "Unauthorized"
**Solution:** Verify your email is in Firestore `admins` collection with `role: admin`

### Payment doesn't appear after submission
**Solution:** Check Firestore `payments` collection has read permissions in security rules

### Real-time updates not working
**Solution:** Confirm `export const dynamic = 'force-dynamic'` at top of page files

## 🔗 Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Firebase** - Authentication & Firestore
- **Firestore** - Real-time database
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Vercel** - Deployment

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section in documentation
2. Run `node setup-assistant.js` for guided setup
3. Run `node validate-setup.js` to verify configuration

---

**System Status:** ✅ Production Ready

Last Updated: 2024
