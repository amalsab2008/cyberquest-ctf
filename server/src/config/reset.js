require('dotenv').config();
const { query } = require('./db');

async function resetDb() {
  try {
    console.log('Connecting to database and resetting participant nodes...');
    
    // Delete all users. Due to ON DELETE CASCADE foreign keys, this will
    // automatically wipe all: solves, submissions, user_badges, and unlocked_hints.
    const result = await query('DELETE FROM users');
    
    console.log('Successfully wiped all participant records!');
    console.log('The platform database is now fresh and ready for new registrations.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDb();
