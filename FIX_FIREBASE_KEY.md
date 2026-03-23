# 🔧 FIREBASE ADMIN SDK KEY - EXACT STEPS TO FIX

## THE PROBLEM

Your `.env.local` has:
```
FIREBASE_ADMIN_SDK_KEY=\nMIIEvAIB...
```

The `\n` at the start means the key is malformed. This breaks Firebase Admin SDK initialization.

---

## THE SOLUTION - 5 MINUTE FIX

### Step 1: Generate New Private Key from Google
1. Open: https://console.firebase.google.com/
2. Select your project: **testcase-f67c9**
3. Click ⚙️ **Settings** (bottom left)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download (probably named something like `testcase-f67c9-firebase-adminsdk-*.json`)

### Step 2: Open the Downloaded JSON File
The file will look like:
```json
{
  "type": "service_account",
  "project_id": "testcase-f67c9",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@testcase-f67c9.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40testcase-f67c9.iam.gserviceaccount.com"
}
```

### Step 3: Convert to Single Line
Use this online tool: https://jsoncrush.com/

1. Copy the entire JSON from step 2
2. Paste into the tool
3. The right side shows a compressed version (this is your single line)
4. Alternatively, use VS Code:
   - Remove all newlines between fields (keep `\n` inside the `private_key` value!)
   - Keep all content exactly the same

### Step 4: Update .env.local
1. Open your project folder: `c:\Users\lakshit\Desktop\Payment reciver website\`
2. Open file: `.env.local`
3. Find line: `FIREBASE_ADMIN_SDK_KEY=...`
4. Replace with the single-line JSON:

**BEFORE:**
```
FIREBASE_ADMIN_SDK_KEY=\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDe...
```

**AFTER:**
```
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"testcase-f67c9","private_key_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n...actual key content here...\n-----END RSA PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@testcase-f67c9.iam.gserviceaccount.com",...rest of fields...}
```

**⚠️ IMPORTANT:**
- Keep the `\n` inside the `private_key` field (between the key dashes)
- Remove the `\n` at the beginning
- Make sure the whole thing is ONE line

### Step 5: Restart Dev Server
```bash
npm run dev
```

You should see:
```
✓ Ready in X.Xs on http://localhost:3000
```

---

## VERIFY IT WORKED

### Test 1: Check the Build
```bash
npm run build
```

Should complete without "Firebase" errors.

### Test 2: Check the Dev Server
Open browser to: http://localhost:3000

Should load without Firebase warnings in console.

### Test 3: Try Admin Login
1. Go to Admin Panel
2. Try login
3. Should connect to Firestore

---

## IF IT'S STILL NOT WORKING

### Error: "FIREBASE_ADMIN_SDK_KEY is not valid JSON"
**Fix:** Use VS Code to format the JSON:
1. Paste your single-line key into: https://jsonformatter.org/
2. Click "Validate" 
3. If it fails, there's a syntax error - check for mismatched quotes

### Error: "private_key is invalid"
**Fix:** The `private_key` field must have actual `\n` characters in it:
✅ CORRECT: `"private_key":"-----BEGIN RSA...\nMIIE...\n-----END..."` (has literal \n)
❌ WRONG: `"private_key":"-----BEGIN RSA\\\n...` (has \\ before n)

### Error: Still getting old key?
**Fix:** 
1. Close your terminal 
2. Delete `.env.local`
3. Create new `.env.local` with corrected key
4. Restart `npm run dev`

---

## QUICK COPY-PASTE TEMPLATE

If you're confused, here's the exact format (replace VALUES with your actual data):

```
FIREBASE_ADMIN_SDK_KEY={"type":"service_account","project_id":"testcase-f67c9","private_key_id":"YOUR_KEY_ID","private_key":"YOUR_PRIVATE_KEY_HERE","client_email":"YOUR_EMAIL@testcase-f67c9.iam.gserviceaccount.com","client_id":"YOUR_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"YOUR_CERT_URL"}
```

---

## AFTER YOU FIX THIS

Next, follow [SETUP_FIXES.md](./SETUP_FIXES.md) for the remaining 2 steps:
1. ✅ Firebase Admin SDK Key (YOU ARE HERE)
2. ⏳ Create Admin User in Firestore
3. ⏳ Test the Application

---

**Stuck? Double-check:**
- ✅ Is the entire key on ONE line in .env.local?
- ✅ Does it start with `{` and end with `}` (NOT `\n`)?
- ✅ Did you restart `npm run dev` after changing the file?
- ✅ Is the JSON valid? (Test at https://jsonformatter.org/)

**You're almost there! 🚀**
