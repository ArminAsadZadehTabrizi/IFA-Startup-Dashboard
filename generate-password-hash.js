const bcrypt = require('bcryptjs');

// Dieses Skript generiert einen bcrypt Hash für ein Passwort
// Verwendung: node generate-password-hash.js <your-password>

const password = process.argv[2];

if (!password) {
  console.error('❌ Bitte geben Sie ein Passwort an:');
  console.error('   node generate-password-hash.js <your-password>');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n✅ Passwort-Hash erfolgreich generiert:\n');
console.log(hash);
console.log('\n📝 Fügen Sie diesen Hash in Ihre .env.local Datei ein:');
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);


