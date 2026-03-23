# Quick Start Guide 🚀

## Project Successfully Created!

Your Payment Receiver website with UPI integration is ready for development!

### ✅ What's Been Done

1. **Project Setup**
   - ✓ Next.js 14 with TypeScript configured
   - ✓ Tailwind CSS styling integrated
   - ✓ Project structure created (app, lib, components, api)
   - ✓ Build system tested and verified

2. **Pages Created**
   - ✓ Landing page (`/`) - Route users to Player/Admin
   - ✓ User login (`/user/login`) - Google OAuth login
   - ✓ User dashboard (`/user/dashboard`) - Payment interface
   - ✓ Admin login (`/admin/login`) - Email/password auth
   - ✓ Admin dashboard (`/admin/dashboard`) - Verification panel

3. **Backend APIs**
   - ✓ `/api/payment/create-order` - Create Razorpay order
   - ✓ `/api/payment/verify` - Verify payment signature
   - ✓ `/api/transactions/list` - Fetch transactions
   - ✓ `/api/transactions/verify` - Verify/reject transactions

4. **Components**
   - ✓ Success Animation overlay with UNO message
   - ✓ Firebase initialization with error handling
   - ✓ Razorpay integration setup

### 🔧 Next Steps

#### 1. **Get Firebase Credentials**

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Firestore Database (test mode)
4. Enable Authentication → Google Sign-in method
5. Get your credentials from **Project Settings** → **Your apps**
6. Create a Service Account from **Project Settings** → **Service Accounts**

#### 2. **Get Razorpay Credentials**

1. Sign up at https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Copy Key ID and Key Secret

#### 3. **Set Up Google OAuth**

1. Visit https://console.cloud.google.com/
2. Create OAuth 2.0 credentials (Client ID)
3. Add authorized redirect URIs:
   - `http://localhost:3000`
   - Your production domain

#### 4. **Fill Environment Variables**

Edit `.env.local` and add all credentials:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (paste JSON as single line)
FIREBASE_ADMIN_SDK_KEY={"type":"service_account",...}

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-secret-key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 5. **Create Admin in Firebase**

In Firestore, create a document in the `admins` collection:

```
Collection: admins
Document ID: admin@example.com
Fields:
{
  "email": "admin@example.com",
  "isAdmin": true,
  "createdAt": (current timestamp)
}
```

Then create a Firebase Auth user for this email with a password.

#### 6. **Run Development Server**

```bash
npm run dev
```

Your app will be at `http://localhost:3000`

---

## File Structure

```
Payment reciver website/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── user/
│   │   │   ├── login/            # User Google login
│   │   │   └── dashboard/        # Payment interface
│   │   ├── admin/
│   │   │   ├── login/            # Admin email login
│   │   │   └── dashboard/        # Admin verification
│   │   └── api/
│   │       ├── payment/          # Payment APIs
│   │       └── transactions/     # Transaction APIs
│   ├── lib/
│   │   ├── firebase.ts           # Firebase client
│   │   ├── firebaseAdmin.ts      # Firebase Admin
│   │   ├── razorpay.ts           # Razorpay config
│   │   └── auth.ts               # Auth utilities
│   └── components/
│       └── SuccessAnimation.tsx  # Success modal
├── public/                       # Static assets
├── .env.local                    # Environment variables (SECRET!)
├── README.md                     # Full documentation
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## Testing the App

### 1. User Flow Test

1. Go to `http://localhost:3000`
2. Click "Login as Player"
3. Sign in with Google
4. Click "Pay ₹20"
5. Use Razorpay test card: **4111 1111 1111 1111**
6. See success animation!

### 2. Admin Flow Test

1. Go to `http://localhost:3000`
2. Click "Login as Admin"
3. Use your admin credentials
4. View pending transactions
5. Click "Verify" to approve

---

## Important Notes

⚠️ **Security**
- Never commit `.env.local` to Git
- Keep `FIREBASE_ADMIN_SDK_KEY` and `RAZORPAY_KEY_SECRET` private
- Use test credentials during development
- Verify payment signatures on the server

📝 **Database**
- Firestore collections auto-create when first document is added
- OR manually create: `users`, `transactions`, `admins` collections

🚀 **Deployment to Vercel**
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Update Firebase authorized domains

---

## Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check code quality
```

---

## Support

Refer to the full `README.md` for:
- Detailed setup instructions
- API endpoint documentation
- Database schema details
- Troubleshooting guide
- Future enhancements

---

**Your project is ready! 🎉**

Next step: Fill in environment variables and start the dev server!

```bash
npm run dev
```

Then visit `http://localhost:3000` in your browser.
