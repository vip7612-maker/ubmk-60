import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash:password -- <yourpassword>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\n🔐 Bcrypt hash:\n');
console.log(hash);
console.log('\nAdd this to your .env.local as ADMIN_PASSWORD_HASH=...\n');
