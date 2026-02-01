require('dotenv').config({ path: '.env.local.new' });
const bcrypt = require('bcryptjs');

console.log('Testing with .env.local.new:\n');
console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
console.log('ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH);

if (process.env.ADMIN_PASSWORD_HASH) {
  const isValid = bcrypt.compareSync('Anthropia0910', process.env.ADMIN_PASSWORD_HASH);
  console.log('\nPassword test:', isValid ? '✅ WORKS!' : '❌ FAILED');
}
