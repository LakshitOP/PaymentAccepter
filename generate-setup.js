#!/usr/bin/env node

/**
 * Automated Setup Configuration
 * Generates the exact commands/steps needed for Firebase setup
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  AUTOMATED SETUP CONFIGURATION GENERATOR                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Step 1: Get .env.local config
console.log('STEP 1: Extracting Configuration\n');

const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const projectId = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID=(.+)/)?.[1]?.trim();
const authDomain = envContent.match(/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=(.+)/)?.[1]?.trim();

if (!projectId || !authDomain) {
  console.log('❌ Firebase config incomplete in .env.local');
  process.exit(1);
}

console.log(`✅ Project ID: ${projectId}`);
console.log(`✅ Auth Domain: ${authDomain}\n`);

// Step 2: Read security rules
console.log('STEP 2: Preparing Firestore Rules\n');

const rulesPath = path.join(__dirname, 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.log('❌ firestore.rules not found');
  process.exit(1);
}

const rules = fs.readFileSync(rulesPath, 'utf8');
console.log('✅ Firestore rules ready for deployment\n');

// Step 3: Generate setup guide
console.log('STEP 3: Generating Setup Guide\n');

let setupGuide = `
╔════════════════════════════════════════════════════════════╗
║  FIREBASE CONSOLE SETUP - STEP BY STEP                    ║
╚════════════════════════════════════════════════════════════╝

PROJECT: ${projectId}
DOMAIN: ${authDomain}

─────────────────────────────────────────────────────────

STEP 1: CREATE FIRESTORE COLLECTIONS
URL: https://console.firebase.google.com/project/${projectId}/firestore

Actions:
1. Click "Create Collection"
2. Name: payments → Create
3. Click "Create Collection"  
4. Name: admins → Create
5. Click "Create Collection"
6. Name: config → Create

─────────────────────────────────────────────────────────

STEP 2: CREATE CONFIG DOCUMENT
In Firestore → config collection

1. Click "Add Document"
2. Document ID: payment
3. Add Field:
   - Field: amount
   - Type: number
   - Value: 20
4. Click Save

─────────────────────────────────────────────────────────

STEP 3: DEPLOY FIRESTORE RULES
In Firestore → Rules tab

1. Select ALL existing content (Ctrl+A)
2. Delete it
3. Paste the following rules:
4. Click "Publish"

RULES TO PASTE:
─────────────────────────────────────────────────────────
${rules}
─────────────────────────────────────────────────────────

─────────────────────────────────────────────────────────

STEP 4: CREATE ADMIN ACCOUNT IN FIRESTORE
In Firestore → admins collection

1. Click "Add Document"
2. Document ID: [YOUR EMAIL ADDRESS]
   Example: admin@example.com
3. Add Field:
   - Field: role
   - Type: string
   - Value: admin
4. Click Save

─────────────────────────────────────────────────────────

STEP 5: CREATE FIREBASE AUTH USERS
In Authentication tab

1. Click "Create User"
2. Create test user:
   - Email: testuser@example.com
   - Password: Test@123456
3. Click "Create User"
4. Create admin user:
   - Email: [YOUR EMAIL ADDRESS]
   - Password: Admin@123456

─────────────────────────────────────────────────────────

✅ SETUP COMPLETE

When done:
1. Run: npm run dev
2. Visit: http://localhost:3000/user/login
3. Login: testuser@example.com / Test@123456
4. Test payment submission

Admin login:
1. Visit: http://localhost:3000/admin/login
2. Login: [YOUR EMAIL] / Admin@123456
3. Approve the test payment
`;

console.log(setupGuide);

// Step 4: Save to file
const outputPath = path.join(__dirname, 'SETUP_INSTRUCTIONS_AUTO.txt');
fs.writeFileSync(outputPath, setupGuide);

console.log(`\n✅ Complete setup instructions saved to: SETUP_INSTRUCTIONS_AUTO.txt`);
console.log(`\nNext steps:\n`);
console.log(`1. Open Firebase Console: https://console.firebase.google.com`);
console.log(`2. Open SETUP_INSTRUCTIONS_AUTO.txt`);
console.log(`3. Follow the step-by-step instructions`);
console.log(`4. Run: npm run dev\n`);

process.exit(0);
