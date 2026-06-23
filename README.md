# CyberQuest CTF Platform

CyberQuest CTF is a modern, responsive, beginner-friendly Capture The Flag (CTF) training platform for college students. All challenges, file analysis, web simulation inspection, and certificate generation happen directly inside the application.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS v3 + Lucide Icons + HTML5 Canvas (Certificate Generator) + Canvas Confetti
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL (Production) with automatic **SQLite** fallback (Local Dev)
- **Containerization**: Docker & Docker Compose (Multi-stage Nginx builds)
- **Authentication**: JWT Session Tokens + Bcryptjs Password Hashing

---

## 📂 Project Structure

```
CTF/
├── docker-compose.yml
├── README.md
├── client/                      # React frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.cjs
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/          # Navbar, CodeRain, TerminalConsole
│       ├── context/             # AuthContext session provider
│       ├── pages/               # Landing, Dashboard, Challenges, Leaderboard, etc.
│       └── utils/               # Fetch endpoints helpers
└── server/                      # Node.js Express Backend
    ├── Dockerfile
    ├── package.json
    ├── public/                  # Static assets & web challenge simulations
    └── src/
        ├── index.js
        ├── config/              # Db schema init and Seed scripts
        ├── controllers/         # Auth, Challenge, Leaderboard, and Admin APIs
        ├── middleware/          # JWT check and Admin Guards
        ├── routes/              # Express Router bindings
        └── utils/               # EXIF image binary generators
```

---

## 🚀 Local Quickstart (No Setup Required)

The backend is engineered to **auto-fallback to a local SQLite database** if no PostgreSQL instance is found. This allows you to run and test the codebase instantly without setting up a database server.

### 1. Start the Backend API
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
*The server will start on `http://localhost:5000` and automatically create a SQLite database file at `server/data/cyberquest.db` containing seeded badges and challenges.*

### 2. Start the Frontend client
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
*The React client will run on `http://localhost:3000` and automatically proxy all `/api` calls to the backend.*

---

## 🐳 Running with Docker Compose (PostgreSQL Stack)

To run the complete production-grade architecture including a live PostgreSQL instance:

1. Ensure you have Docker and Docker Compose installed.
2. In the root project directory, run:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:3000` to interact with the platform.
   - Nginx handles the React static file delivery.
   - Nginx proxies API traffic to the backend server.
   - Backend links directly to the PostgreSQL database.

---

## 🔐 Administrative Privileges

To access the **Admin Console** (editing challenges, inspecting logs, exporting CSV scoreboard):
1. **The first user who registers on a new database is automatically granted the Admin role.**
2. Alternatively, registering any email containing the word `admin@` (e.g. `admin@cyberquest.edu`) grants administrative privileges.

---

## 📝 Walkthrough: Built-in Beginner Challenges

### Challenge 1: The Cipher Matrix (Cryptography - 50 pts)
- **Clue**: Decode `Y3liZXJxdWVzdHtiNHMzNjRfaXNfbjB0X2NyeXB0MGdyNHBoeX0=`.
- **Solution**: Open the **Base64 Decoder** in the Learning Hub, paste the ciphertext, and click "Decode".
- **Flag**: `cyberquest{b4s364_is_n0t_crypt0gr4phy}`

### Challenge 2: Inspect Element (Web Security - 100 pts)
- **Clue**: Inspect comments on the staging simulator site.
- **Solution**: Open the simulator link in a new tab, right-click, and select "View Page Source" or "Inspect". Locate the commented lines:
  ```html
  <!-- FIXME: The flag for Challenge 2 is here: cyberquest{c0mm3nts_4r3_n0t_hidd3n} -->
  ```
- **Flag**: `cyberquest{c0mm3nts_4r3_n0t_hidd3n}`

### Challenge 3: Hidden in Plain Sight (Forensics - 150 pts)
- **Clue**: Recover metadata from downloaded image `hacker_avatar.jpg`.
- **Solution**: Download the attachment from the challenge details, upload it into the **EXIF Header Viewer** on the Learning Hub. The tool will parse the image's binary headers and extract the description tag.
- **Flag**: `cyberquest{ex1f_d4t4_r3v34ls_all}`

### Challenge 4: The Emperor's Shift (Cryptography - 100 pts)
- **Clue**: Shift key is 13 (ROT13) for cipher `ploredrfg{pnrfne_pvcure_vf_pynffvp}`.
- **Solution**: Open the **Caesar Shift Decrypter** tool in the Learning Hub. Paste the text, set the shift to `13`, and inspect output.
- **Flag**: `cyberquest{caesar_cipher_is_classic}`

### Challenge 5: Where is the Mascot? (OSINT - 200 pts)
- **Clue**: Look for CyberQuest Cybersecurity Club mascot name announced in founding year 2024.
- **Solution**: Open the Social Archive simulator link, scroll down to the founding announcement (October 12, 2024), and read the post: "Meet **cyber_owl_2024**!". Format as `cyberquest{mascot_year}`.
- **Flag**: `cyberquest{cyber_owl_2024}`

---

## ☁️ Deployment Instructions

### Frontend (Vercel)
Vercel hosts the React client as a Static Site.
1. Link your git repository to Vercel.
2. Configure Build Command: `npm run build`
3. Configure Output Directory: `dist`
4. Set up client rewrite rules in a `vercel.json` file in the client root to handle proxy routing:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://your-backend-url.render.com/api/$1" }
     ]
   }
   ```

### Backend (Render)
Render hosts the Express API and handles database connections.
1. Create a Web Service on Render and link the git repository.
2. Select Root Directory: `server`
3. Set Start Command: `npm start`
4. Add Environment Variables:
   - `JWT_SECRET`: A secure random string.
   - `DATABASE_URL`: Your PostgreSQL connection string. (Render will spin up a free PostgreSQL instance and link it automatically if created under the same project).
