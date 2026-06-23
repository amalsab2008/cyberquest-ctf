const { query } = require('./db');

async function seedDb() {
  console.log('Checking database seed data...');

  try {
    // 1. Seed Badges
    const badgeCheck = await query('SELECT COUNT(*) as count FROM badges');
    const badgeCount = parseInt(badgeCheck.rows[0].count || 0);

    if (badgeCount === 0) {
      console.log('Seeding default badges...');
      const badges = [
        {
          id: 'badge-first-blood',
          name: 'First Blood',
          description: 'Awarded for solving your first challenge!',
          icon: 'Zap',
          rule_type: 'first_solve'
        },
        {
          id: 'badge-crypto-master',
          name: 'Crypto Master',
          description: 'Solve all Cryptography challenges!',
          icon: 'Key',
          rule_type: 'category_clear:Cryptography'
        },
        {
          id: 'badge-web-hacker',
          name: 'Web Hacker',
          description: 'Solve all Web Security challenges!',
          icon: 'Globe',
          rule_type: 'category_clear:Web Security'
        },
        {
          id: 'badge-elite-hacker',
          name: 'Elite Hacker',
          description: 'Reach a score of 300 or more points!',
          icon: 'Award',
          rule_type: 'score_threshold:300'
        }
      ];

      for (const badge of badges) {
        await query(
          'INSERT INTO badges (id, name, description, icon, rule_type) VALUES ($1, $2, $3, $4, $5)',
          [badge.id, badge.name, badge.description, badge.icon, badge.rule_type]
        );
      }
      console.log('Badges seeded.');
    }

    // 2. Seed Challenges
    const challengeCheck = await query('SELECT COUNT(*) as count FROM challenges');
    const challengeCount = parseInt(challengeCheck.rows[0].count || 0);

    const hintCheck = await query('SELECT COUNT(*) as count FROM hints');
    const hintCount = parseInt(hintCheck.rows[0].count || 0);

    if (challengeCount === 0 || hintCount === 0) {
      console.log('Seeding built-in beginner challenges (clearing partial database states)...');
      
      // Clear out partial states to prevent UUID primary key collisions on seeding
      await query('DELETE FROM hints');
      await query('DELETE FROM challenges');

      // Challenges and Hints definitions
      const challenges = [
        {
          id: 'b93f6c8d-6a4a-4e26-8051-7f937e4fb38e',
          title: 'The Cipher Matrix',
          description: 'An intercepted hacker transmission was found on our servers. It is in a text format and ends with character padding ("="). Decode it to recover the flag!\n\nCiphertext:\n```\nY3liZXJxdWVzdHtiNHMzNjRfaXNfbjB0X2NyeXB0MGdyNHBoeX0=\n```',
          points: 50,
          category: 'Cryptography',
          difficulty: 'Easy',
          flag: 'cyberquest{b4s364_is_n0t_crypt0gr4phy}',
          files: JSON.stringify([]),
          hints: [
            {
              id: 'hint-c1-1',
              hint_text: 'Look at the character set and the trailing "=" symbol. This is standard Base64 encoding. You can use the decoder in our Learning Hub to extract the clear text.',
              penalty: 10
            }
          ]
        },
        {
          id: '3a8f15d7-1335-43fe-a86d-66e6b527dc4b',
          title: 'Inspect Element',
          description: 'A developer left some secrets in the HTML comments of their test site page. Inspect the source code of the live simulation site to find the flag!\n\n[Launch Simulator Page](/simulation/html-comments.html)',
          points: 100,
          category: 'Web Security',
          difficulty: 'Easy',
          flag: 'cyberquest{c0mm3nts_4r3_n0t_hidd3n}',
          files: JSON.stringify([]),
          hints: [
            {
              id: 'hint-c2-1',
              hint_text: 'Right-click anywhere on the simulator page and select "Inspect" or "View Page Source". Look through the HTML tags for a green commented line starting with "<!--".',
              penalty: 20
            }
          ]
        },
        {
          id: 'ea96e273-0498-4bd8-ad7d-74d156554b7c',
          title: 'Hidden in Plain Sight',
          description: 'A suspicous hacker profile picture was found during a raid. Forensic investigators suspect they hid the flag inside the EXIF metadata properties of this image file. Download the file below and inspect its metadata details using the EXIF tool in our Learning Hub or `exiftool` to retrieve the flag.',
          points: 150,
          category: 'Forensics',
          difficulty: 'Medium',
          flag: 'cyberquest{ex1f_d4t4_r3v34ls_all}',
          files: JSON.stringify([{ name: 'hacker_avatar.jpg', url: '/api/challenges/download/hacker_avatar.jpg' }]),
          hints: [
            {
              id: 'hint-c3-1',
              hint_text: 'EXIF metadata stores details like camera models, dates, authors, and comments. Load this image into the EXIF Viewer on our Learning Hub page, and look closely at the "Description" or "Artist" tag.',
              penalty: 30
            }
          ]
        },
        {
          id: '443ad5a4-ee44-42f0-97ee-3b006a8f15bc',
          title: "The Emperor's Shift",
          description: 'We intercepted a note written by a hacker who claims to be using the classic Caesar Cipher. It appears they shifted the characters of their message by 13 spaces. Can you decrypt this string?\n\nCiphertext:\n```\nploredhrfg{pnrfne_pvcure_vf_pynffvp}\n```',
          points: 100,
          category: 'Cryptography',
          difficulty: 'Easy',
          flag: 'cyberquest{caesar_cipher_is_classic}',
          files: JSON.stringify([]),
          hints: [
            {
              id: 'hint-c4-1',
              hint_text: 'A shift of 13 positions is also known as ROT13. Because there are 26 letters, shifting by 13 twice gets you back to the original text. You can use the tool in our Learning Hub!',
              penalty: 20
            }
          ]
        },
        {
          id: 'fa6d7e8b-90f1-4322-901d-55e11ad2efcc',
          title: 'Where is the Mascot?',
          description: 'Our college cybersecurity club, CyberQuest, was founded in 2024. A post was once uploaded to our simulated social feed archive displaying the official mascot name. Find the mascot name!\n\nFormat: `cyberquest{mascotname_year}` (lowercase, e.g., cyberquest{name_2024})\n\n[Open Social Archive Simulation](/simulation/social-feed.html)',
          points: 200,
          category: 'OSINT',
          difficulty: 'Medium',
          flag: 'cyberquest{cyber_owl_2024}',
          files: JSON.stringify([]),
          hints: [
            {
              id: 'hint-c5-1',
              hint_text: 'Examine the simulated social posts closely. Look for updates published in the founding year (2024) that announce our club mascot with an image or text description.',
              penalty: 40
            }
          ]
        }
      ];

      for (const challenge of challenges) {
        // Insert challenge
        await query(
          'INSERT INTO challenges (id, title, description, points, category, difficulty, flag, files) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [challenge.id, challenge.title, challenge.description, challenge.points, challenge.category, challenge.difficulty, challenge.flag, challenge.files]
        );

        // Insert hints
        for (const hint of challenge.hints) {
          await query(
            'INSERT INTO hints (id, challenge_id, hint_text, penalty) VALUES ($1, $2, $3, $4)',
            [hint.id, challenge.id, hint.hint_text, hint.penalty]
          );
        }
      }
      console.log('Challenges and hints seeded successfully.');
    }

    // 3. Seed Default Admin User
    // Delete existing user if any, to ensure they are created fresh as admin with the correct password
    await query('DELETE FROM users WHERE email = $1', ['amalsab2008@gmail.com']);

    const adminCheck = await query('SELECT COUNT(*) as count FROM users WHERE email = $1', ['amalsab2008@gmail.com']);
    const adminExists = parseInt(adminCheck.rows[0].count || 0) > 0;

    if (!adminExists) {
      console.log('Seeding default admin user...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('amal2008', salt);
      
      const adminEmail = 'amalsab2008@gmail.com';
      const adminName = 'Admin';
      const rollNumber = 'ADMIN-01';
      const collegeName = 'CyberQuest Academy';
      const role = 'admin';

      const { isSqlite } = require('./db');
      if (isSqlite) {
        const userId = require('crypto').randomUUID();
        await query(
          `INSERT INTO users (id, name, email, password_hash, roll_number, college_name, role)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, adminName, adminEmail, passwordHash, rollNumber, collegeName, role]
        );
      } else {
        await query(
          `INSERT INTO users (name, email, password_hash, roll_number, college_name, role)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [adminName, adminEmail, passwordHash, rollNumber, collegeName, role]
        );
      }
      console.log('Default admin user seeded successfully.');
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

module.exports = {
  seedDb
};
