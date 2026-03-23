#!/usr/bin/env node

/**
 * Production Verification Script
 * Checks if the app is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Production Verification Script                           ║');
console.log('║  Checking if project is ready for Vercel deployment       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = [];

function check(name, condition, error = null) {
  if (condition) {
    console.log(`✅ ${name}`);
    checks.push({ name, status: 'pass' });
  } else {
    console.log(`❌ ${name}`);
    if (error) console.log(`   📌 ${error}`);
    checks.push({ name, status: 'fail' });
  }
}

function warn(name, message) {
  console.log(`⚠️  ${name}`);
  console.log(`   📌 ${message}`);
  checks.push({ name, status: 'warn' });
}

// 1. Check API routes exist
console.log('📁 Checking API Route Structure:\n');
const apiRoutes = [
  'src/app/api/payments/create/route.ts',
  'src/app/api/payments/verify/route.ts',
  'src/app/api/payments/get/route.ts',
  'src/app/api/payments/list/route.ts',
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(path.join(__dirname, route));
  check(`API Route exists: ${route}`, exists, 
    exists ? null : `Create at: ${route}`);
});

// 2. Check required files
console.log('\n📄 Checking Required Files:\n');
const requiredFiles = [
  'package.json',
  '.env.local',
  'firestore.rules',
  'tsconfig.json',
  'next.config.js',
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  check(`File exists: ${file}`, exists);
});

// 3. Check environment variables
console.log('\n🔐 Checking Environment Variables:\n');
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_ADMIN_SDK_KEY',
  ];

  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`);
    check(`Environment variable: ${varName}`, hasVar, 
      hasVar ? null : `Add ${varName} to .env.local`);
  });

  // Check if private key is properly formatted
  if (envContent.includes('FIREBASE_ADMIN_SDK_KEY=')) {
    const hasProperFormat = !envContent.includes(`FIREBASE_ADMIN_SDK_KEY={\n`);
    check('Private key is single-line formatted', hasProperFormat,
      hasProperFormat ? null : 'Convert key to single line (no newlines)');
  }
} else {
  console.log('❌ .env.local file not found');
}

// 4. Check dependencies
console.log('\n📦 Checking Dependencies:\n');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
  );
  
  const requiredDeps = {
    'next': '14.0.0',
    'react': '18.0.0',
    'firebase': '9.0.0',
    'firebase-admin': '11.0.0',
  };

  Object.entries(requiredDeps).forEach(([dep, minVersion]) => {
    const isDep = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    check(`Dependency installed: ${dep}`, !!isDep, 
      isDep ? null : `npm install ${dep}`);
  });
} catch (err) {
  console.log('❌ Failed to read package.json');
}

// 5. Check TypeScript configuration
console.log('\n🎯 Checking TypeScript Configuration:\n');
if (fs.existsSync(path.join(__dirname, 'tsconfig.json'))) {
  try {
    const tsConfig = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8')
    );
    
    check('TypeScript strict mode enabled', tsConfig.compilerOptions?.strict === true);
    check('Module resolution is bundler', tsConfig.compilerOptions?.moduleResolution === 'bundler');
    check('Target is ES2020 or higher', 
      ['ES2020', 'ES2021', 'ES2022', 'ESNext'].includes(tsConfig.compilerOptions?.target));
  } catch (err) {
    console.log('⚠️  Failed to parse tsconfig.json');
  }
}

// 6. Test build
console.log('\n🔨 Testing Production Build:\n');
try {
  console.log('Running: npm run build...');
  const buildOutput = execSync('npm run build 2>&1', { 
    stdio: 'pipe',
    cwd: __dirname 
  }).toString();
  
  const hasErrors = buildOutput.includes('error') && !buildOutput.includes('ERR!');
  const succeeded = buildOutput.includes('successfully') || buildOutput.includes('generated');
  
  check('Build succeeded', !hasErrors && succeeded, 
    hasErrors ? 'Build has errors - check output above' : null);
} catch (err) {
  const output = err.stdout?.toString() || err.toString();
  if (output.includes('error')) {
    check('Build succeeded', false, 'Build failed with errors');
    console.log('\n' + output);
  }
}

// 7. Firebase configuration
console.log('\n🔥 Checking Firebase Configuration:\n');
if (fs.existsSync(path.join(__dirname, '.firebaserc'))) {
  try {
    const firebaserc = JSON.parse(
      fs.readFileSync(path.join(__dirname, '.firebaserc'), 'utf8')
    );
    
    check('Firebase project configured', !!firebaserc.projects?.default);
  } catch (err) {
    console.log('⚠️  Failed to parse .firebaserc');
  }
}

// 8. Firestore rules
console.log('\n⚖️  Checking Firestore Rules:\n');
if (fs.existsSync(path.join(__dirname, 'firestore.rules'))) {
  const rules = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');
  
  check('Rules file exists', true);
  check('Rules contains payments collection', rules.includes('payments'));
  check('Rules contains admins collection', rules.includes('admins'));
  check('Rules have security restrictions', !rules.includes('allow read, write: if true'));
} else {
  console.log('❌ firestore.rules not found');
}

// Summary
console.log('\n' + '='.repeat(60));
const passCount = checks.filter(c => c.status === 'pass').length;
const failCount = checks.filter(c => c.status === 'fail').length;
const warnCount = checks.filter(c => c.status === 'warn').length;

console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed, ${warnCount} warnings\n`);

if (failCount === 0) {
  console.log('✅ Your project is ready for Vercel deployment!\n');
  console.log('Next steps:');
  console.log('1. Push to GitHub: git push origin main');
  console.log('2. Go to https://vercel.com and import your repository');
  console.log('3. Add environment variables in Vercel dashboard');
  console.log('4. Deploy!\n');
} else {
  console.log('❌ Please fix the errors above before deploying.\n');
  console.log('Failed checks:');
  checks
    .filter(c => c.status === 'fail')
    .forEach(c => console.log(`  - ${c.name}`));
  console.log('\nSee VERCEL_PRODUCTION_SETUP.md for help.\n');
}

if (warnCount > 0) {
  console.log('⚠️  Warnings to review:');
  checks
    .filter(c => c.status === 'warn')
    .forEach(c => console.log(`  - ${c.name}`));
  console.log();
}
