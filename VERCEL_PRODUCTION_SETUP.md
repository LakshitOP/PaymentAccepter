# 🚀 Vercel Production Deployment Guide

## Critical Issues Fixed

### ✅ API Route Structure
- **Before**: `src/app/api/payments/create.ts` (❌ NOT recognized by Next.js)
- **After**: `src/app/api/payments/create/route.ts` (✅ Correct App Router structure)
- All API endpoints now use proper `route.ts` naming convention

### ✅ Firebase Admin SDK
- Fixed private key parsing with proper newline escaping
- Added validation for required service account fields
- Better error messages for initialization failures

### ✅ Error Handling
- Frontend now checks response content-type before parsing JSON
- Prevents "Unexpected token '<'" errors from HTML 404 responses
- Better error messages for debugging

---

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Git Repository**: Push your code to GitHub/GitLab/Bitbucket
2. **Firebase Project**: Your Firebase project is set up (testcase-f67c9)
3. **Firebase Service Account Key**: Downloaded from Firebase Console
4. **Vercel Account**: Sign up at https://vercel.com

---

## Step 1: Prepare Your Service Account Key

Go to [Firebase Console - Settings - Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk)

1. Click "Generate new private key"
2. A JSON file will download
3. **IMPORTANT**: Convert to single line (required for environment variables)

**Command to convert:**

```bash
# macOS/Linux
cat /path/to/serviceAccountKey.json | tr '\n' ' ' | sed 's/ //g' > key-oneline.json

# Windows PowerShell
$content = Get-Content 'C:\path\to\serviceAccountKey.json' -Raw
$json = $content | ConvertFrom-Json
$json | ConvertTo-Json -Compress | Set-Content 'key-oneline.json'
```

**Result should look like:**
```
{"type":"service_account","project_id":"testcase-f67c9",...}
```

---

## Step 2: Deploy to Vercel

### Option A: Connected Git (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub/GitLab/Bitbucket repository
4. Select Next.js as framework
5. **Before clicking Deploy**, add environment variables (Step 3)

### Option B: Deploy from CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

---

## Step 3: Add Environment Variables

### In Vercel Dashboard:

1. Go to your project settings → **Environment Variables**
2. Add each variable:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCsWucHtoJTpN0DGb-g4W28TN9ja2L_kAE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=testcase-f67c9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=testcase-f67c9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=testcase-f67c9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=693475852540
NEXT_PUBLIC_FIREBASE_APP_ID=1:693475852540:web:dc845ddf4e61c1f1671779
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SUiiwWaMODnhrZ
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app

# CRITICAL: Private key (convert to single line as shown above)
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"testcase-f67c9",...}
RAZORPAY_KEY_SECRET=j4zZJqiB2YCgiNqBfZjqG4Fd
GOOGLE_CLIENT_SECRET=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
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

**Important**: Set all variables to all environments:
- Production ✓
- Preview ✓
- Development ✓

---

## Step 4: Configure Firebase for Production Domain

1. Go to [Firebase Console - Authentication - Authorized Domains](https://console.firebase.google.com/project/_/authentication/settings)
2. Click "Add Domain"
3. Enter your Vercel domain: `your-vercel-domain.vercel.app`
4. Wait ~5-10 minutes for changes to propagate

Also add:
- `localhost:3000` (for local development)
- Your custom domain (if you have one)

---

## Step 5: Firestore Setup (Firebase Console)

1. Go to [Firestore Database](https://console.firebase.google.com/project/_/firestore/data)
2. Create collections:
   - `payments`
   - `admins`
   - `config`

3. Create `config/payment` document:
   - Field: `amount` (Number) = `20`

4. Create admin user in `admins` collection:
   - Document ID: `your-email@example.com`
   - Field: `role` (String) = `admin`

5. Deploy Firestore Rules:
   - Go to Rules tab
   - Replace with rules from `firestore.rules`
   - Click Publish

---

## Step 6: Test in Production

After deployment:

1. **Home Page**: `https://your-domain.vercel.app`
   - Should load without errors
   - Firebase config should load

2. **User Login**: `https://your-domain.vercel.app/user/login`
   - Click "Continue with Google"
   - Should redirect to dashboard

3. **Payment Flow**:
   - User dashboard → Click "Submit Payment"
   - Should redirect to pending page
   - Should see real-time updates

4. **Admin Panel**: `https://your-domain.vercel.app/admin/login`
   - Login with your email and password
   - Should see pending payments
   - Approve/reject should update in real-time

---

## Troubleshooting Production Issues

### API Returns 404

**Check**:
1. ✅ API routes are in correct location: `src/app/api/payments/{create,verify,get,list}/route.ts`
2. ✅ Rebuild: `npm run build` should succeed with 0 errors
3. ✅ Check Vercel deployment logs for build errors

**Solution**:
```bash
# Verify locally
npm run build
npm run dev

# Test API
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":20,"email":"test@example.com"}'
```

### "Unauthorized" Error

**Check**:
1. ✅ Firebase service account key is set correctly in Vercel
2. ✅ Key is in single-line format (no newlines)
3. ✅ Project ID in key matches your Firebase project

**Solution**:
```bash
# Test locally
npm run dev

# Check firebaseAdmin.ts logs
# Should see: "[Firebase Admin] Initialized successfully for project: testcase-f67c9"
```

### Firestore Not Storing Payments

**Check**:
1. ✅ Firestore collections exist: `payments`, `admins`, `config`
2. ✅ Security rules are deployed
3. ✅ User is authenticated (token is valid)

**Solution**:
```bash
# Check Firebase Console
# 1. Go to Firestore → Collections
# 2. Check "payments" collection
# 3. Should see new documents after payment submission
```

### Real-Time Updates Not Working

**Check**:
1. ✅ Firestore listeners are set up in admin dashboard
2. ✅ Security rules allow reads
3. ✅ Browser console has no errors

**Solution**:
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for errors
3. Check Firestore rules - ensure `allow read`

---

## Performance Tips

1. **Enable Compression**: Already enabled in Next.js
2. **Use Edge Functions**: API routes run on Edge (fast!)
3. **Enable Caching**: Static pages are cached (404, index.html)
4. **Monitor Bundle Size**: Run `npm run build` and check output

---

## Security Checklist

✅ **Before going live:**

- [ ] Firebase authorized domains include your Vercel domain
- [ ] Firestore security rules are deployed (check Rules tab)
- [ ] Service account key is kept private (only in Vercel env vars)
- [ ] Admin users are created in `admins` collection
- [ ] CORS is not needed (same origin requests)
- [ ] Environment variables are set for all deployments

---

## Monitoring & Logs

### Vercel Logs
```bash
# Tail logs in real-time (CLI)
vercel logs [your-project]

# Or use dashboard: vercel.com → Project → Deployments → Logs
```

### Firebase Logs
- Go to [Firebase Console - Logs](https://console.firebase.google.com/project/_/logs)
- Filter by service (Firestore, Authentication, etc.)
- Check for errors

---

## Rollback (if needed)

To rollback to a previous deployment:

1. Go to Vercel dashboard → Deployments
2. Find the working deployment
3. Click the three dots → "Set as Production"

---

## Next Steps

After successful deployment:

1. **Test thoroughly** with real payments
2. **Monitor Firebase usage** (check quotas)
3. **Enable Firestore backups** (optional)
4. **Set up error alerts** (Sentry, Rollbar, etc.)
5. **Custom domain setup** (optional)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Common Issues**: See TROUBLESHOOTING.md

