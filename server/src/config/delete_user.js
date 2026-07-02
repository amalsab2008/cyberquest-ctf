require('dotenv').config();
const { query } = require('./db');

async function deleteUser() {
  const email = process.argv[2] || 'abhinandr04@gmail.com';
  
  if (!email) {
    console.error('Please provide an email of the user to delete.');
    process.exit(1);
  }

  try {
    console.log(`Attempting to delete user with email: ${email}...`);
    
    // Find the user first to confirm they exist
    const userCheck = await query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length === 0) {
      console.log(`No user found with email: ${email}`);
      process.exit(0);
    }
    
    const user = userCheck.rows[0];
    console.log(`Found user: ${user.name} (${user.email}). Deleting...`);
    
    const result = await query('DELETE FROM users WHERE email = $1', [email]);
    
    console.log(`Successfully deleted user ${user.name}!`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  }
}

deleteUser();
