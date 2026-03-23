#!/usr/bin/env node

/**
 * Setup Validator for Manual UPI Payment System
 * Run this script to validate your environment is properly configured
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function log(status, message) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${message}`);
  checks.push({ status, message });
}

console.log('\n📋 Manual UPI Payment System - Setup Validator\n');

// Check 1: Node version
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
if (nodeMajor >= 18) {
  log('pass', `Node.js version: ${nodeVersion}`);
} else {
  log('fail', `Node.js version: ${nodeVersion} (requires v18+)`);
}

// Check 2: .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  log('pass', '.env.local file exists');
  
  // Check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'FIREBASE_ADMIN_SDK_KEY'
  ];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(varName) && envContent.includes(varName + '=')) {
      const value = envContent.split(varName + '=')[1]?.split('\n')[0]?.trim();
      if (value && value.length > 0) {
        log('pass', `${varName} is configured`);
      } else {
        log('fail', `${varName} is empty`);
        allVarsPresent = false;
      }
    } else {
      log('fail', `${varName} not found`);
      allVarsPresent = false;
    }
  });
} else {
  log('fail', '.env.local file not found (required for Firebase)');
}

// Check 3: Package.json dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = ['next', 'react', 'firebase'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      log('pass', `${dep} is installed`);
    } else {
      log('fail', `${dep} not found (run: npm install)`);
    }
  });
}

// Check 4: Required build files exist
const requiredFiles = [
  'src/app/api/payments/create.ts',
  'src/app/api/payments/verify.ts',
  'src/app/api/payments/get.ts',
  'src/app/api/payments/list.ts',
  'src/app/user/payment-pending/page.tsx',
  'src/app/user/payment-success/page.tsx',
  'src/app/user/payment-history/page.tsx',
  'src/app/admin/dashboard/page.tsx',
  'QUICK_START_MANUAL_UPI.md',
  'MANUAL_UPI_SYSTEM_SETUP.md',
  'VERCEL_DEPLOYMENT_GUIDE.md'
];

console.log('\n📁 Required Files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    log('pass', `${file}`);
  } else {
    log('fail', `${file} not found`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
const passCount = checks.filter(c => c.status === 'pass').length;
const failCount = checks.filter(c => c.status === 'fail').length;
const warnCount = checks.filter(c => c.status === 'warn').length;

console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings\n`);

if (failCount === 0) {
  console.log('✅ All checks passed! Your system is ready.\n');
  console.log('Next steps:');
  console.log('1. Create Firestore collections (payments, admins, config)');
  console.log('2. Deploy Firestore security rules');
  console.log('3. Create Firebase Auth users');
  console.log('4. Run: npm run dev');
  console.log('5. Test the system locally');
  console.log('\nSee SETUP_VALIDATION.md for detailed instructions.\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  console.log('Run: npm install');
  console.log('Then ensure .env.local is properly configured.\n');
  process.exit(1);
}
