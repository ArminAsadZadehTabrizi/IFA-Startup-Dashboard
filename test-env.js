// Debug-Skript um zu testen ob .env.local geladen wird
console.log('=== Environment Variables Check ===')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : '❌ Not set')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Not set')
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME || '❌ Not set')
console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH ? '✅ Set (starts with: ' + process.env.ADMIN_PASSWORD_HASH.substring(0, 10) + '...)' : '❌ Not set')

// Test bcrypt
const bcrypt = require('bcryptjs');
const testPassword = 'Anthropia0910';
const hash = '$2b$10$LMzRWFs8Snz2sFe0FZY7ce0Kj4deMQj.iD2q1cqVvFcpMKOI8bhh6';

console.log('\n=== Bcrypt Test ===')
console.log('Testing password:', testPassword)
console.log('Against hash:', hash)

const isValid = bcrypt.compareSync(testPassword, hash);
console.log('Result:', isValid ? '✅ MATCH' : '❌ NO MATCH')

if (process.env.ADMIN_PASSWORD_HASH) {
  console.log('\n=== Testing against .env.local hash ===')
  const envHashValid = bcrypt.compareSync(testPassword, process.env.ADMIN_PASSWORD_HASH);
  console.log('Result:', envHashValid ? '✅ MATCH' : '❌ NO MATCH')
}

