#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Smart Finance Tracker...\n');

// Create .env.local file if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/smart-finance-tracker

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Optional: For production deployment
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-finance-tracker
# NEXTAUTH_URL=https://your-domain.com
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('⚠️  .env.local already exists, skipping...');
}

// Create .gitignore entries if needed
const gitignorePath = path.join(process.cwd(), '.gitignore');
const gitignoreEntries = [
  '',
  '# Environment variables',
  '.env.local',
  '.env',
  '',
  '# Dependencies',
  'node_modules/',
  '',
  '# Next.js',
  '.next/',
  'out/',
  '',
  '# Production',
  'build/',
  'dist/',
  '',
  '# Misc',
  '.DS_Store',
  '*.tsbuildinfo',
  'next-env.d.ts',
];

if (fs.existsSync(gitignorePath)) {
  const existingContent = fs.readFileSync(gitignorePath, 'utf8');
  const needsUpdate = gitignoreEntries.some(entry => 
    entry && !existingContent.includes(entry)
  );
  
  if (needsUpdate) {
    fs.appendFileSync(gitignorePath, gitignoreEntries.join('\n'));
    console.log('✅ Updated .gitignore file');
  } else {
    console.log('✅ .gitignore is up to date');
  }
} else {
  fs.writeFileSync(gitignorePath, gitignoreEntries.join('\n'));
  console.log('✅ Created .gitignore file');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Set up MongoDB (local or MongoDB Atlas)');
console.log('3. Update .env.local with your MongoDB connection string');
console.log('4. Run the development server: npm run dev');
console.log('\nFor detailed instructions, see the README.md file.');








