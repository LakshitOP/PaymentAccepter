# 🚀 Vercel Deployment & Firebase Production Guide

## Complete Deployment Checklist

This guide fixes Firebase unauthorized domain errors and ensures the app works in production.

---

## 🔥 Firebase Configuration for Production

### Step 1: Add Vercel Domain to Firebase

Every Firebase project has a whitelist of authorized domains. Your Vercel URL must be added.

**How to add:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project → **Settings** (gear icon, bottom left)
3. Scroll down → Find **Authorized domains**
4. Click **Add domain**
5. Enter your Vercel URL (e.g., `payment-receiver.vercel.app`)
6. Click **Add**

**Wait 5-10 minutes** for it to propagate

### Step 2: Verify Firebase Configuration Variables

Check that all these variables are in **Vercel Settings**:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin SDK
FIREBASE_ADMIN_SDK_KEY
```

**How to add in Vercel:**

1. Vercel.com → Your project → **Settings** tab
2. **Environment Variables** (left sidebar)
3. Add each variable → Select environments (Production/Preview/Development)
4. **Save and Redeploy**

### Step 3: CORS Configuration

Firebase automatically handles CORS, but ensure:

1. Your domain is in **Authorized domains** (done above)
2. Firestore rules allow public read operations (if needed)
3. No browser extension is blocking requests

---

## ✅ Deployment Steps (First Time)

### 1. Push to Git

```bash
cd "Payment reciver website"
git add .
git commit -m "Add manual UPI payment verification system"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to [Vercel.com](https://vercel.com/)
2. Click **Add New...** → **Project**
3. Import GitHub repository
4. Select your branch (main)
5. Configure environment variables (see Step 2 above)
6. Click **Deploy**

**Option B: Using Vercel CLI**

```bash
npm install -g vercel
vercel
# Follow the prompts
```

### 3. Configure Production Environment Variables

In Vercel Dashboard:

1. Project → **Settings** → **Environment Variables**
2. For each variable:
   - Name: (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - Value: (paste from your `.env.local`)
   - Select **Production**, **Preview**, **Development**
   - Click **Add**

**After adding all variables:**
- Go to **Deployments** tab
- Click the latest deployment
- Click **Redeploy** (top right)
- Wait for it to complete

### 4. Test Deployment

After 2-3 minutes, visit your production URL:

```
https://your-project.vercel.app
```

Test this flow:
1. ✅ Landing page loads
2. ✅ User login works
3. ✅ Show payment QR code
4. ✅ Click "I Have Paid"
5. ✅ Redirect to pending page
6. ✅ Admin can see payment
7. ✅ Admin can approve
8. ✅ User sees success page

---

## 🔧 Fixing Common Production Errors

### Error 1: "Firebase: Error (auth/invalid-domain-for-type)"

**Cause:** Domain not in Firebase authorized list

**Solution:**

1. Firebase Console → Settings → Authorized domains
2. Add `your-project.vercel.app`
3. Wait 10 minutes
4. Redeploy in Vercel

```bash
vercel --prod  # Force production deployment
```

### Error 2: "Network request failed" or "CORS blocked"

**Cause:** CORS policy or domain mismatch

**Solution:**

1. Check browser console (F12 → Console tab)
2. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set correctly
3. Ensure Firebase domain is authorized
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try incognito mode

### Error 3: "Firebase SDK not initialized"

**Cause:** Environment variables not loaded

**Solution:**

1. Vercel → Deployment → Check if all env vars are showing
2. Go to build logs (Vercel → Deployments → click deployment → Functions tab)
3. Look for environment variable errors
4. Re-add missing variables and redeploy

### Error 4: "Admin privileges required" on admin dashboard

**Cause:** Admin email not in Firestore

**Solution:**

1. Firestore Console → collections → `admins`
2. Add document with ID = admin email
3. Add field: `role: "admin"`
4. Clear browser cache
5. Try login again

### Error 5: Payments not saving

**Cause:** Firestore rules or permissions issue

**Solution:**

1. Check Firestore Rules (see MANUAL_UPI_SYSTEM_SETUP.md)
2. Check that `payments` collection exists
3. Verify user is authenticated (check Auth in Firebase Console)
4. Check browser console for specific errors

---

## 📊 Environment Variables - Complete List

Create a `.env.local` template (this goes in your **Vercel Settings**):

```bash
# Firebase Client Configuration
# Get these from: Firebase Console → Settings → Your apps → Web app config

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# Firebase Admin SDK Private Key
# Get this from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
# ⚠️ KEEP THIS SUPER SECRET - Never commit to Git!
# Must be on ONE LINE (all JSON on single line): {"type":"service_account",...}

FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n[ACTUAL_KEY_CONTENT]\n-----END RSA PRIVATE KEY-----\n",...}
```

### How to Get These Variables:

**Firebase Client Config:**
1. Firebase Console → Settings (gear icon)
2. Click on your web app under "Your apps"
3. Copy the config object that looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     ...
   };
   ```

**Firebase Admin SDK Key:**
1. Firebase Console → Project Settings
2. Service Accounts tab
3. Click "Generate New Private Key"
4. Download JSON file
5. Convert entire JSON to ONE LINE
6. Paste as **FIREBASE_ADMIN_SDK_KEY**

---

## 🔄 Continuous Deployment (Auto-Deployment)

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes locally
git add .
git commit -m "Update payment system"
git push origin main

# Automatically deploys to Vercel!
# Check status at: Vercel.com → Deployments
```

---

## 🛡️ Security in Production

### DO ✅

- ✅ Use environment variables for all secrets
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Rotate Firebase keys quarterly
- ✅ Enable Admin Decision Logs in Firebase
- ✅ Use strong passwords for admin accounts

### DON'T ❌

- ❌ Commit `.env.local` to Git
- ❌ Share Firebase keys via Slack/Email
- ❌ Use test keys in production
- ❌ Give admin access to untrusted people
- ❌ Disable Firestore security rules

---

## 📈 Monitoring in Production

### Check Real-Time Payments:

1. Firebase Console → Firestore
2. payments collection → See all submissions
3. Click on payment → View details

### Check Errors:

```bash
vercel logs  # View deployment logs
```

### Check User Issues:

1. Firebase Console → Authentication
2. View user list + login history
3. Google Analytics (if enabled)

---

## 🚀 Optimization Tips

### Reduce Deployment Time:

1. Add to `.gitignore`:
   ```
   .next/
   node_modules/
   .env
   ```

2. Vercel builds are cached - only changed files get rebuilt
3. Use Vercel's preview deployments for testing

### Faster Load Times:

1. Vercel CDN automatically optimizes images
2. Next.js automatic code splitting
3. Firebase is optimized for global access

---

## 🆘 Emergency Rollback

If something breaks in production:

```bash
# Revert to previous commit
git revert HEAD
git push

# Or go to Vercel.com → Deployments → Click previous deployment → "Redeploy"
```

---

## 📞 Debugging Production Issues

When something doesn't work:

1. **Check Browser Console** (F12 → Console)
   - Look for red errors
   - Note exact error message

2. **Check Vercel Logs**
   ```bash
   vercel logs
   ```

3. **Check Firebase Console**
   - Authentication: user exists?
   - Firestore: collections have data?
   - Security Rules: user has permissions?

4. **Check Environment Variables**
   - Vercel → Settings → Environment Variables
   - All variables present and correct?

5. **Network Tab** (F12 → Network)
   - Look for failed requests (red)
   - Check response details

---

## ✨ Production Checklist

- [ ] Firebase domain added to authorized list
- [ ] All environment variables in Vercel
- [ ] Admin email in Firestore admins collection
- [ ] Firebase security rules configured
- [ ] Database collections created (payments, admins, config)
- [ ] At least one admin user created in Firebase Auth
- [ ] User login tested in production
- [ ] Payment submission tested
- [ ] Admin approval tested
- [ ] Payment success page verified
- [ ] Payment history working
- [ ] Admin dashboard loading payments in real-time
- [ ] No console errors (F12)
- [ ] Browser cache cleared after deployment

---

## 🎉 You're Ready!

Your Payment Receiver website is now deployed to production!

Share the URL with users:
```
https://your-project.vercel.app
```

Admin access at:
```
https://your-project.vercel.app/admin/login
```

Enjoy! 🎊
