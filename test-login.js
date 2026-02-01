// Load env from .env.local manually
require('dotenv').config({ path: '.env.local' });

const bcrypt = require('bcryptjs');

console.log('=== Testing Login ===\n');

const testUsername = 'admin';
const testPassword = 'Anthropia0910';

const envUsername = process.env.ADMIN_USERNAME;
const envHash = process.env.ADMIN_PASSWORD_HASH;

console.log('Expected Username:', testUsername);
console.log('Env Username:', envUsername);
console.log('Username Match:', testUsername === envUsername ? '✅ YES' : '❌ NO');

console.log('\nExpected Password:', testPassword);
console.log('Env Hash:', envHash);

if (envHash) {
  const isValid = bcrypt.compareSync(testPassword, envHash);
  console.log('Password Match:', isValid ? '✅ YES' : '❌ NO');
  
  if (!isValid) {
    console.log('\n⚠️ Password does not match hash!');
    console.log('Hash in env:', envHash);
    console.log('Hash length:', envHash.length);
  }
} else {
  console.log('❌ ADMIN_PASSWORD_HASH not found in environment');
}
