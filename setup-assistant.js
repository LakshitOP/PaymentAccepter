#!/usr/bin/env node

/**
 * Manual UPI Payment System - Complete Setup Assistant
 * This script guides you through the complete setup process step-by-step
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Manual UPI Payment System - Complete Setup Guide          ║');
  console.log('║  This will help you set up the entire system step-by-step  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Verify environment
  console.log('STEP 1: Verifying Your Environment...\n');
  
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (nodeMajor < 18) {
    console.log('❌ ERROR: Node.js v18+ required. Current: ' + nodeVersion);
    process.exit(1);
  }
  console.log('✅ Node.js version: ' + nodeVersion);

  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ ERROR: .env.local not found');
    process.exit(1);
  }
  console.log('✅ .env.local file exists\n');

  // Step 2: Check dependencies
  console.log('STEP 2: Checking Dependencies...\n');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const deps = ['next', 'react', 'firebase', 'firebase-admin'];
  let missingDeps = [];
  
  deps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log('✅ ' + dep);
    } else {
      console.log('❌ ' + dep + ' not installed');
      missingDeps.push(dep);
    }
  });

  if (missingDeps.length > 0) {
    console.log('\n⚠️  Missing dependencies. Run: npm install\n');
    process.exit(1);
  }
  console.log();

  // Step 3: Verify build
  console.log('STEP 3: Verifying Build...\n');
  console.log('Running: npm run build\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build successful\n');
  } catch (error) {
    console.log('\n❌ Build failed\n');
    process.exit(1);
  }

  // Step 4: Firebase setup instructions
  console.log('STEP 4: Firebase Console Setup\n');
  console.log('You now need to set up Firestore. This requires manual steps in Firebase Console.\n');
  console.log('📍 Go to: https://console.firebase.google.com\n');

  const proceed = await question('Ready to continue? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('\nSetup paused. Run this script again when ready.\n');
    rl.close();
    return;
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  FIREBASE CONSOLE SETUP - FOLLOW THESE STEPS EXACTLY      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('STEP 4A: Create Collections\n');
  console.log('1. Go to Firestore Database');
  console.log('2. Click "Create Collection"');
  console.log('3. Create three collections with these exact names:');
  console.log('   - payments');
  console.log('   - admins');
  console.log('   - config\n');

  const collCreated = await question('Have you created all 3 collections? (yes/no): ');
  if (collCreated.toLowerCase() !== 'yes' && collCreated.toLowerCase() !== 'y') {
    console.log('\n⚠️  Collections must be created. Please create them and run this script again.\n');
    rl.close();
    return;
  }

  console.log('\n✅ Collections created\n');

  console.log('STEP 4B: Create Admin Account in Firestore\n');
  const adminEmail = await question('Enter your admin email (must match Firebase Auth): ');
  
  console.log('\nNow in Firebase Console:');
  console.log('1. Go to Firestore → admins collection');
  console.log('2. Click "Add Document"');
  console.log(`3. Document ID: ${adminEmail}`);
  console.log('4. Add field: role (string) = "admin"');
  console.log('5. Click Save\n');

  const adminCreated = await question('Have you created the admin document? (yes/no): ');
  if (adminCreated.toLowerCase() !== 'yes' && adminCreated.toLowerCase() !== 'y') {
    console.log('\n⚠️  Admin document must be created.\n');
    rl.close();
    return;
  }

  console.log('\n✅ Admin account created\n');

  console.log('STEP 4C: Create Payment Config\n');
  const paymentAmount = await question('Enter default payment amount (e.g., 20): ') || '20';
  
  console.log('\nNow in Firebase Console:');
  console.log('1. Go to Firestore → config collection');
  console.log('2. Click "Add Document"');
  console.log('3. Document ID: payment');
  console.log(`4. Add field: amount (number) = ${paymentAmount}`);
  console.log('5. Click Save\n');

  const configCreated = await question('Have you created the config document? (yes/no): ');
  if (configCreated.toLowerCase() !== 'yes' && configCreated.toLowerCase() !== 'y') {
    console.log('\n⚠️  Config document must be created.\n');
    rl.close();
    return;
  }

  console.log('\n✅ Payment config created\n');

  console.log('STEP 4D: Deploy Firestore Security Rules\n');
  console.log('1. Go to Firestore → Rules tab');
  console.log('2. Replace ALL existing content with the rules below:');
  console.log('\n─────────────────────────────────────────────────────');
  
  const rules = `rules_version = '2';
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
}`;

  console.log(rules);
  console.log('─────────────────────────────────────────────────────\n');

  console.log('3. Click "Publish"');
  console.log('4. Wait for "Rules Updated" message\n');

  const rulesDeployed = await question('Have you deployed the Firestore rules? (yes/no): ');
  if (rulesDeployed.toLowerCase() !== 'yes' && rulesDeployed.toLowerCase() !== 'y') {
    console.log('\n⚠️  Rules must be deployed.\n');
    rl.close();
    return;
  }

  console.log('\n✅ Firestore rules deployed\n');

  console.log('STEP 5: Create Firebase Auth Users\n');
  console.log('1. Go to Firebase Console → Authentication');
  console.log('2. Click "Create User" or use Sign Up');
  console.log('3. Create test user:');
  console.log('   - Email: testuser@example.com');
  console.log('   - Password: Test@123456');
  console.log('4. Create admin user:');
  console.log(`   - Email: ${adminEmail}`);
  console.log('   - Password: Admin@123456\n');

  const authCreated = await question('Have you created both users in Firebase Auth? (yes/no): ');
  if (authCreated.toLowerCase() !== 'yes' && authCreated.toLowerCase() !== 'y') {
    console.log('\n⚠️  Auth users must be created.\n');
    rl.close();
    return;
  }

  console.log('\n✅ Firebase Auth users created\n');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  ALL MANUAL SETUP COMPLETE!                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('🎉 Your system is now ready to use!\n');
  console.log('Next steps:\n');
  console.log('1. Start development server:');
  console.log('   npm run dev\n');
  console.log('2. Test user flow:');
  console.log('   - Go to http://localhost:3000/user/login');
  console.log('   - Login with: testuser@example.com / Test@123456');
  console.log('   - Click "I Have Paid - Submit for Verification"\n');
  console.log('3. Test admin flow:');
  console.log('   - Go to http://localhost:3000/admin/login');
  console.log(`   - Login with: ${adminEmail} / Admin@123456`);
  console.log('   - Approve the pending payment\n');
  console.log('4. When ready for production:');
  console.log('   npm run build');
  console.log('   Deploy to Vercel\n');

  console.log('📚 For more details, see:');
  console.log('   - QUICK_START_MANUAL_UPI.md');
  console.log('   - MANUAL_UPI_SYSTEM_SETUP.md');
  console.log('   - VERCEL_DEPLOYMENT_GUIDE.md\n');

  rl.close();
}

main().catch(console.error);
