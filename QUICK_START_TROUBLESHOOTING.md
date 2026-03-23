# 🎯 QUICK START & TROUBLESHOOTING

## Current Status

✅ **All Production Issues Fixed**
- API routes properly structured for Next.js App Router  
- Firebase Admin SDK gracefully initialized
- Error handling improved
- Build succeeds with 0 errors
- Dev server running successfully

---

## Quick Local Testing

### 1. Start Dev Server
```bash
npm run dev
```
Access: http://localhost:3000

### 2. Test Routes

**Home Page**: http://localhost:3000
- Should load without Firebase errors (if .env.local is configured)

**User Login**: http://localhost:3000/user/login
- Google login button should work (with Firebase configured)
- After login → redirects to dashboard

**Admin Dashboard**: http://localhost:3000/admin/dashboard
- Requires admin credentials to access
- Shows payment list with real-time updates

### 3. Test API Routes

**Create Payment** (requires valid Bearer token):
```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "amount": 20,
    "email": "test@example.com",
    "name": "Test User"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "paymentId": "payment-id-here",
  "message": "Payment submitted for verification"
}
```

---

## 5-Minute Vercel Deployment

### Step 1: Get Your Service Account Key
```bash
# Go to Firebase Console → Settings → Service Accounts
# Download the JSON file
```

### Step 2: Convert to Single-Line (CRITICAL)
```bash
# macOS/Linux
cat serviceAccountKey.json | jq -c . > key.txt

# Windows PowerShell
$json = Get-Content 'path/to/serviceAccountKey.json' | ConvertFrom-Json
$json | ConvertTo-Json -Compress
```

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Fix production issues"
git push origin main
```

### Step 4: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import GitHub repo
3. Add environment variables (use converted single-line key)
4. Click Deploy

### Step 5: Configure Firebase
1. Go to Firebase Console → Authentication
2. Add authorized domain: `your-app.vercel.app`
3. Go to Firestore → Create collections: `payments`, `admins`, `config`
4. Go to Firestore → Rules → Deploy security rules from `firestore.rules`

---

## Troubleshooting

### ❌ Dev Server Won't Start

**Error**: `port 3000 already in use`
```bash
# Kill process on port 3000
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Error**: `Cannot find module`
```bash
# Reinstall dependencies
npm install
npm run dev
```

---

### ❌ API Returns 404

**Check 1**: Are routes in correct location?
```bash
# Should exist:
ls src/app/api/payments/create/route.ts
ls src/app/api/payments/verify/route.ts
ls src/app/api/payments/get/route.ts
ls src/app/api/payments/list/route.ts
```

**Check 2**: Did you remove old files?
```bash
# These should NOT exist (they're .old now):
ls src/app/api/payments/create.ts     # Should not exist
ls src/app/api/payments/verify.ts     # Should not exist
```

**Check 3**: Rebuild project
```bash
npm run build
npm run dev
# Try API call again
```

---

### ❌ "Unexpected token '<'" Error

**Cause**: API returning HTML instead of JSON (usually 404 or 500)

**Check 1**: Verify response in browser console
```javascript
// In browser dev tools console
fetch('/api/payments/create', { ... })
  .then(r => r.text())  // Use .text() first to see what you got
  .then(console.log)
```

**Check 2**: Check server logs
```bash
# Watch terminal where "npm run dev" is running
# Look for error messages
```

---

### ❌ Firebase Admin Not Initialized

**In Development**:
- Some Firebase Admin warnings during `npm run build` are expected
- Firebase Admin fully initializes in production with correct `FIREBASE_ADMIN_SDK_KEY`

**Error Message**: `Firebase Admin SDK not initialized`
- Means `FIREBASE_ADMIN_SDK_KEY` is missing or invalid
- Should only see this in dev if key is not set
- Won't happen in production if Vercel env vars are set

---

### ❌ "Invalid or expired token"

**Cause**: Firebase ID token issue

**Check 1**: Is user logged in?
```javascript
// In browser console
firebase.auth.currentUser  // Should show user object
```

**Check 2**: Is token valid?
```javascript
// Get fresh token for API call
const token = await auth.currentUser.getIdToken(true);
console.log(token);  // Should be long string starting with "eyJ"
```

**Check 3**: Is it being sent correctly?
```javascript
const response = await fetch('/api/payments/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Note: "Bearer " prefix!
  },
  body: JSON.stringify({ ... })
});
```

---

### ❌ Firestore Not Storing Data

**Check 1**: Does Firestore database exist?
- Go to https://console.firebase.google.com/project/testcase-f67c9/firestore/data
- Should see collections: `payments`, `admins`, `config`

**Check 2**: Are security rules deployed?
- Go to Firestore → Rules
- Should see rules checking for admin/user authorization
- If rules are blank, data write will fail

**Check 3**: Is user authenticated?
```javascript
// API requires valid Firebase ID token
// Check if auth returns valid token
```

**Check 4**: Check Firestore activity
- Go to Firestore → Activity
- Look for errors like "Permission denied" or "Missing function"

---

### ❌ Real-Time Updates Not Working

**Check 1**: Is listener set up?
- Check browser console for errors
- Look for "onSnapshot" or subscription errors

**Check 2**: Check security rules
```
// Rules should allow read for authenticated users
allow read: if request.auth != null;
```

**Check 3**: Did Firestore data actually change?
- Go to Firestore Console
- Manually update payment status
- Check if page updates within 1-2 seconds

**Check 4**: Try refresh
```javascript
// Force hard refresh to clear any caches
// Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## Performance Check

### Bundle Size
```bash
npm run build
# Check the output size (should be < 1MB)
```

### Page Load Time
- Dev: http://localhost:3000 - should load < 2s
- Prod: Check Vercel Analytics

### API Response Time
```bash
# Time an API call
time curl -X POST http://localhost:3000/api/payments/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":20,"email":"test@example.com"}'
```

---

## Security Verification

### ✅ Check These Before Going Live

1. **Private Key Never Logged**:
   - Search project for hardcoded private keys: `grep -r "private_key" src/`
   - Should only be in `.env.local` (local) or Vercel (production)

2. **Token Validation**:
   - All API endpoints verify Firebase ID token
   - Check: `await adminAuth.verifyIdToken(token)`

3. **Admin Protection**:
   - Verify endpoints check admin status
   - Check: `adminDoc.exists` for admin collection

4. **CORS/Origin**:
   - API calls are same-origin (no CORS needed in Next.js)
   - Vercel automatically handles this

5. **Environment Variables**:
   - No secrets in code (all in .env.local or Vercel)
   - Vercel env vars set for all environments

---

## Files Modified / Created

✅ **API Routes (Fixed)**:
- `src/app/api/payments/create/route.ts`
- `src/app/api/payments/verify/route.ts`
- `src/app/api/payments/get/route.ts`
- `src/app/api/payments/list/route.ts`

✅ **Firebase Admin (Fixed)**:
- `src/lib/firebaseAdmin.ts` - Graceful initialization

✅ **Frontend (Enhanced)**:
- `src/app/user/dashboard/page.tsx` - Better error handling
- `src/app/admin/dashboard/page.tsx` - Better error handling

✅ **Documentation (New)**:
- `PRODUCTION_ISSUES_FIXED.md` - This deployment guide
- `VERCEL_PRODUCTION_SETUP.md` - Detailed setup steps
- `verify-production.js` - Production verification script

✅ **Old Files (Renamed)**:
- `src/app/api/payments/create.ts.old` (not compiled)
- `src/app/api/payments/verify.ts.old` (not compiled)
- `src/app/api/payments/get.ts.old` (not compiled)
- `src/app/api/payments/list.ts.old` (not compiled)

---

## Next Steps

### Immediate (Today):
1. [ ] Review `PRODUCTION_ISSUES_FIXED.md`
2. [ ] Test locally: `npm run dev`
3. [ ] Test payment flow in browser

### Very Soon (This Week):
1. [ ] Get Firebase Service Account Key
2. [ ] Convert to single-line format
3. [ ] Push to GitHub
4. [ ] Deploy to Vercel
5. [ ] Configure Firebase (domains, collections, rules)

### After Deployment:
1. [ ] Test full flow in production
2. [ ] Test real-time updates
3. [ ] Monitor Vercel logs
4. [ ] Monitor Firebase activity

---

## Support Resources

- **[PRODUCTION_ISSUES_FIXED.md](./PRODUCTION_ISSUES_FIXED.md)** - What was fixed
- **[VERCEL_PRODUCTION_SETUP.md](./VERCEL_PRODUCTION_SETUP.md)** - Detailed setup
- **[firestore.rules](./firestore.rules)** - Security rules
- **[package.json](./package.json)** - Dependencies

---

## Success Indicators

✅ **You'll know it's working when**:

1. **Dev Server**: `npm run dev` → No errors, loads in http://localhost:3000
2. **Build**: `npm run build` → 0 errors, all routes listed
3. **API Calls**: Receive JSON responses (not HTML 404s)
4. **Firestore**: New payments appear in Firestore Console
5. **Real-time**: Admin dashboard updates instantly when approving payments
6. **Vercel**: App deployed and accessible at vercel URL

---

## Still Having Issues?

1. **Check the logs**: Look at browser console AND Vercel logs
2. **Read error messages carefully**: They usually tell you exactly what's wrong
3. **Search Firebase docs**: Most issues have solutions in official docs
4. **Review file locations**: Make sure route.ts files are where they should be
5. **Verify environment variables**: Double-check in Vercel dashboard

---

**Last Updated**: March 23, 2026  
**Status**: ✅ Production Ready

