# Setup Validation Checklist

Use this checklist to ensure your manual UPI payment system is properly configured.

## ✅ Step 1: Verify Local Environment

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v9+

# Install dependencies
npm install

# Run build to verify compilation
npm run build
```

**Expected Result:** Build completes successfully with 0 errors and message "compiled successfully"

---

## ✅ Step 2: Verify Firebase Configuration

### Check .env.local file exists:
```bash
# Should exist at project root
ls -la .env.local

# Should contain these variables (check for values, not just keys):
# - NEXT_PUBLIC_FIREBASE_API_KEY
# - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID
# - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# - FIREBASE_ADMIN_SDK_KEY
```

### Verify Firebase Console:
1. Go to https://console.firebase.google.com
2. Select project: **testcase-f67c9**
3. Go to Firestore Database
4. Check if collections exist:
   - [ ] `payments` collection exists
   - [ ] `admins` collection exists
   - [ ] `config` collection with `payment` document exists

---

## ✅ Step 3: Create Required Firestore Collections

If collections don't exist, create them:

### Collection 1: `payments`
- Click "Create Collection" → Enter `payments`
- Auto-generate document IDs (default)
- Leave sample data empty initially

### Collection 2: `admins`
- Click "Create Collection" → Enter `admins`
- Create first document:
  - Document ID: Your Firebase auth email (must match exactly)
  - Fields:
    - `role` (string): `admin`
    - `email` (string): your-email@example.com

### Collection 3: `config`
- Click "Create Collection" → Enter `config`
- Create first document:
  - Document ID: `payment`
  - Fields:
    - `amount` (number): `20` (or your desired amount)

---

## ✅ Step 4: Deploy Firestore Security Rules

1. In Firebase Console → Firestore Database → Rules tab
2. Replace ALL existing content with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Payments
    match /payments/{paymentId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.email == request.auth.token.email ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email))
      );
      allow update: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    // Admins
    match /admins/{email} {
      allow read, write: if request.auth.token.email == email ||
        exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
    // Config
    match /config/{document=**} {
      allow read: if true;
      allow write: if exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
  }
}
```

3. Click "Publish" and verify: ✅ Rules Updated

---

## ✅ Step 5: Set Up Firebase Auth Users

### Create User Account (if not exists)
1. Firebase Console → Authentication
2. Click "Create User" or use Sign Up flow
3. Create test user:
   - Email: `testuser@example.com`
   - Password: `Test@123456`

### Create Admin Account
1. Create another user:
   - Email: Your admin email (must match your `admins` collection document ID)
   - Password: `Admin@123456`

2. **CRITICAL:** Add this email to Firestore
   - Go to Firestore → `admins` collection
   - Create document with email as ID
   - Add field: `role` = `admin`

---

## ✅ Step 6: Test Locally

```bash
# Start development server
npm run dev

# Server should start at http://localhost:3000
```

### Test User Flow:
1. Go to http://localhost:3000/user/login
2. Login with test user credentials
3. Click "I Have Paid - Submit for Verification"
4. Verify redirected to `/user/payment-pending`
5. Check Firestore: New document in `payments` collection

### Test Admin Flow:
1. Go to http://localhost:3000/admin/login
2. Login with admin credentials
3. Should see Payment Management Dashboard
4. See submitted payment in pending list
5. Click Approve → Status changes to "approved"
6. Check Firestore: Payment status updated

---

## ✅ Step 7: Deployment to Vercel

### Pre-Deployment Checks:
1. [ ] All code pushed to Git
2. [ ] Build succeeds locally: `npm run build`
3. [ ] No TypeScript errors: `npx tsc --noEmit`
4. [ ] Firestore collections created
5. [ ] Security rules deployed
6. [ ] Admin account created

### Deploy:
```bash
# Ensure all changes are committed
git add .
git commit -m "Manual UPI payment system - ready for deployment"
git push origin main

# Go to Vercel Dashboard
# Import repository and deploy
```

### Post-Deployment:
1. In Firebase Console: Authentication → Settings
2. Go to "Authorized domains" tab
3. Add your Vercel domain: `your-domain.vercel.app`
4. Wait 5-10 minutes for changes to propagate
5. Test deployed app

---

## 🧪 Verification Tests

Run these tests to verify everything works:

### Test 1: Firebase Connection
Check browser console (F12) for Firebase initialization messages. Should see no errors.

### Test 2: User Payment Submission
- Login as user
- Submit payment
- Check Firestore: Payment should appear in `payments` collection with `status: pending`

### Test 3: Admin Approval
- Login as admin
- See payment in dashboard
- Click Approve
- Check Firestore: Status should change to `approved`
- User should be auto-redirected to success page

### Test 4: Real-time Updates
- Keep user logged in on payment-pending page
- Use admin to approve payment
- Page should auto-redirect in real-time (no refresh needed)

---

## ❌ Troubleshooting

### Issue: "Firebase not configured"
**Fix:** Check `.env.local` has all NEXT_PUBLIC_FIREBASE_* variables filled

### Issue: "Unauthorized" on admin dashboard
**Fix:** 
1. Verify your email is in Firestore `admins` collection
2. Verify `role` field = `admin` (exactly)
3. Re-login to refresh token

### Issue: "Permission denied" errors in console
**Fix:** Check Firestore security rules are deployed correctly (go to Rules tab)

### Issue: Build fails with "useSearchParams() should be wrapped in Suspense"
**Fix:** Already fixed in code. Run: `npm run build`

### Issue: "Cannot reach Vercel app" after deployment
**Fix:** 
1. Check Vercel domain is added to Firebase authorized domains
2. Wait 10 minutes for propagation
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 📋 Final Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed: `npm install`
- [ ] Build succeeds: `npm run build`
- [ ] `.env.local` configured with Firebase credentials
- [ ] Firestore `payments` collection created
- [ ] Firestore `admins` collection created with your email
- [ ] Firestore `config/payment` document created with amount
- [ ] Security rules deployed to Firestore
- [ ] Test user created in Firebase Auth
- [ ] Admin user created in Firebase Auth
- [ ] Admin email added to Firestore `admins` collection
- [ ] Dev server starts: `npm run dev`
- [ ] User login works
- [ ] User payment submission works
- [ ] Admin login works
- [ ] Admin can see submitted payments
- [ ] Admin can approve payments
- [ ] Real-time updates working
- [ ] Ready for Vercel deployment

---

## ✅ You're Ready!

Once all items are checked, your system is fully functional and ready for production deployment on Vercel.

For detailed setup instructions, see:
- Quick Setup: `QUICK_START_MANUAL_UPI.md`
- Complete Guide: `MANUAL_UPI_SYSTEM_SETUP.md`
- Deployment: `VERCEL_DEPLOYMENT_GUIDE.md`
