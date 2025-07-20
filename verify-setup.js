#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying Leftover Chef Setup...\n');

const checks = [];

// Check Node.js version
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion >= 14) {
    checks.push({ name: 'Node.js Version', status: '✅', details: nodeVersion });
  } else {
    checks.push({ name: 'Node.js Version', status: '❌', details: `${nodeVersion} (requires 14+)` });
  }
} catch (error) {
  checks.push({ name: 'Node.js Version', status: '❌', details: 'Not found' });
}

// Check NPM version
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  checks.push({ name: 'NPM Version', status: '✅', details: npmVersion });
} catch (error) {
  checks.push({ name: 'NPM Version', status: '❌', details: 'Not found' });
}

// Check project structure
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'frontend/package.json',
  'backend/server.js',
  'frontend/src/App.js',
  'backend/config/oauth.js',
  'backend/routes/auth.js',
  'frontend/src/contexts/AuthContext.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    checks.push({ name: `File: ${file}`, status: '✅', details: 'Found' });
  } else {
    checks.push({ name: `File: ${file}`, status: '❌', details: 'Missing' });
  }
});

// Check dependencies
const checkDependencies = (packagePath, type) => {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const depCount = Object.keys(deps).length;
    
    const nodeModulesPath = path.join(path.dirname(packagePath), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      checks.push({ name: `${type} Dependencies`, status: '✅', details: `${depCount} packages installed` });
    } else {
      checks.push({ name: `${type} Dependencies`, status: '⚠️', details: `${depCount} packages - need to install` });
    }
  } catch (error) {
    checks.push({ name: `${type} Dependencies`, status: '❌', details: 'Error reading package.json' });
  }
};

checkDependencies('package.json', 'Root');
checkDependencies('backend/package.json', 'Backend');
checkDependencies('frontend/package.json', 'Frontend');

// Check ports
const http = require('http');

const checkPort = (port, service) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => {
        resolve({ name: `Port ${port} (${service})`, status: '✅', details: 'Available' });
      });
    });
    server.on('error', () => {
      resolve({ name: `Port ${port} (${service})`, status: '⚠️', details: 'In use (this is OK if app is running)' });
    });
  });
};

// Check environment setup
const envChecks = [];

if (fs.existsSync('.env')) {
  envChecks.push({ name: 'Environment File', status: '✅', details: '.env found' });
} else {
  envChecks.push({ name: 'Environment File', status: '⚠️', details: '.env not found (optional for dev)' });
}

if (fs.existsSync('.env.example')) {
  envChecks.push({ name: 'Environment Template', status: '✅', details: '.env.example found' });
} else {
  envChecks.push({ name: 'Environment Template', status: '❌', details: '.env.example missing' });
}

// Print results
console.log('📋 Setup Verification Results:\n');

[...checks, ...envChecks].forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.details}`);
});

// Check ports asynchronously
Promise.all([
  checkPort(3000, 'Frontend'),
  checkPort(5000, 'Backend')
]).then(portChecks => {
  console.log('\n🌐 Port Availability:');
  portChecks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.details}`);
  });

  // Summary
  const totalChecks = checks.length + envChecks.length + portChecks.length;
  const passedChecks = [...checks, ...envChecks, ...portChecks].filter(c => c.status === '✅').length;
  const warningChecks = [...checks, ...envChecks, ...portChecks].filter(c => c.status === '⚠️').length;
  const failedChecks = [...checks, ...envChecks, ...portChecks].filter(c => c.status === '❌').length;

  console.log('\n📊 Summary:');
  console.log(`✅ Passed: ${passedChecks}`);
  console.log(`⚠️ Warnings: ${warningChecks}`);
  console.log(`❌ Failed: ${failedChecks}`);
  console.log(`Total: ${totalChecks}`);

  if (failedChecks === 0) {
    console.log('\n🎉 Setup verification complete! You can run the application.');
    console.log('\n🚀 To start the application:');
    console.log('   npm run install-all  # If dependencies need installing');
    console.log('   npm run dev          # Start both frontend and backend');
    console.log('\n🌐 Access points:');
    console.log('   Frontend: http://localhost:3000/welcome');
    console.log('   Backend:  http://localhost:5000/api/health');
    console.log('   Admin:    http://localhost:5000/admin');
  } else {
    console.log('\n⚠️ Some issues found. Please review the failed items above.');
    console.log('\n🔧 Common fixes:');
    console.log('   npm run install-all  # Install missing dependencies');
    console.log('   node --version       # Check Node.js version (requires 14+)');
  }
});
