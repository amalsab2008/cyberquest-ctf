require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, isSqlite } = require('./db');

async function createAdmin() {
  const name = "Amal";
  const email = "amalsab2008@gmail.com";
  const password = "amal2008";
  const rollNumber = "ADMIN-01";
  const collegeName = "CyberQuest Core";
  const role = "admin";

  try {
    console.log('Connecting to database to register admin account...');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check if the user already exists (just in case)
    const userExists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      // If they exist, update their role to admin
      console.log('User already exists. Elevating privileges to admin...');
      await query('UPDATE users SET role = $1, password_hash = $2 WHERE email = $3', [role, passwordHash, email]);
      console.log('Admin privileges successfully updated!');
      process.exit(0);
    }

    // Insert new admin user
    const userId = isSqlite ? require('crypto').randomUUID() : undefined;
    
    let insertQuery;
    let params;

    if (isSqlite) {
      insertQuery = `
        INSERT INTO users (id, name, email, password_hash, roll_number, college_name, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      params = [userId, name, email, passwordHash, rollNumber, collegeName, role];
    } else {
      insertQuery = `
        INSERT INTO users (name, email, password_hash, roll_number, college_name, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      params = [name, email, passwordHash, rollNumber, collegeName, role];
    }

    await query(insertQuery, params);
    console.log(`Successfully created admin account!`);
    console.log(`Username: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role} (with full administrative privileges)`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
}

createAdmin();
