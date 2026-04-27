# QuizForge 🧠
> A full-stack customizable quiz builder — built using your exact syllabus topics.

---

## 📁 Project Structure

```
quizforge/
├── server.js                  ← Main Node.js + Express entry point
├── package.json
├── .env.example               ← Copy to .env and fill in your values
│
├── config/
│   └── db.js                  ← MongoDB connection (Mongoose)
│
├── models/
│   ├── User.js                ← User schema (bcrypt, JWT)
│   ├── Quiz.js                ← Quiz + Question schemas
│   └── Score.js               ← Score/leaderboard schema
│
├── middleware/
│   ├── auth.js                ← JWT protect, optionalAuth, RBAC, generateToken
│   └── errorHandler.js        ← Centralized Express error handling
│
├── routes/
│   ├── auth.js                ← POST /api/auth/register, /login, GET /me
│   ├── quizzes.js             ← GET/POST/PUT/DELETE /api/quizzes
│   └── scores.js              ← POST /api/scores, GET /leaderboard, /my
│
└── public/                    ← Static frontend (served by Express)
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js             ← Fetch API wrapper + local seed data
        ├── auth.js            ← Frontend login/register/logout
        ├── quiz.js            ← Quiz engine (timer, scoring, DOM)
        ├── builder.js         ← Quiz creation form logic
        ├── scores.js          ← Leaderboard rendering
        ├── socket.js          ← Socket.IO real-time client
        └── app.js             ← Screen router, global helpers, init
```

---

## 🗺️ Syllabus Coverage

### Frontend (Syllabus 1)
| Unit | Topic | Where Used |
|------|-------|------------|
| I    | HTML5 & CSS3, Flexbox, Grid, Responsive | `index.html`, `style.css` |
| II   | JavaScript syntax, DOM, Events, Arrays | `quiz.js`, `builder.js`, `app.js` |
| III  | Closures, Async/Await, Promises, ES6+ | `quiz.js`, `api.js` |
| IV   | DOM Manipulation, Event Delegation | `builder.js`, `app.js` |
| V    | TypeScript-style interfaces (JS mirrors) | `models/` (schema = TS interface) |
| VI   | Code quality, modular structure | All JS files use IIFE modules |

### Backend (Syllabus 2)
| Unit | Topic | Where Used |
|------|-------|------------|
| I    | Node.js, REPL, npm, fs, EventEmitter, Zlib, Callbacks | `server.js` |
| II   | Express, GET/POST, Router, Validator, Error Handling | `routes/`, `middleware/errorHandler.js` |
| III  | Socket.IO, Middleware, JWT, RBAC, Security headers | `socket.js`, `middleware/auth.js`, `server.js` |
| IV   | MongoDB, Mongoose, Schema, CRUD, insertOne | `models/`, `routes/` |
| V    | PostgreSQL (swap Mongoose for Prisma ORM) | See note below |
| VI   | REST API testing, Deployment, API versioning | `routes/scores.js`, README |

> **PostgreSQL Note:** To use PostgreSQL + Prisma instead of MongoDB, replace `models/` with Prisma schema files and swap `mongoose.connect` in `config/db.js` for `new PrismaClient()`.

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
cd quizforge
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET
```

### 3. Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas (cloud)
# Set MONGO_URI=mongodb+srv://... in .env
```

### 4. Run the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 5. Open in browser
```
http://localhost:5000
```

> **No backend?** The frontend works completely offline too — it falls back to 7 built-in seed quizzes and stores scores in memory.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user (requires JWT) |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/quizzes` | List all quizzes (filter: `?topic=&difficulty=`) |
| GET  | `/api/quizzes/:id` | Get single quiz with all questions |
| POST | `/api/quizzes` | Create a quiz |
| PUT  | `/api/quizzes/:id` | Update a quiz (creator/admin only) |
| DELETE | `/api/quizzes/:id` | Delete a quiz (creator/admin only) |

### Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scores` | Submit a score after completing quiz |
| GET  | `/api/scores/leaderboard` | Global top scores |
| GET  | `/api/scores/my` | Current user's score history (requires JWT) |

---

## ✨ Features
- **7 built-in quizzes** covering all syllabus topics
- **Quiz builder** — create and publish custom quizzes
- **Countdown timer** per question with visual arc
- **Instant answer feedback** with explanations
- **Score ring animation** on results screen
- **Live leaderboard** powered by Socket.IO
- **Topic + difficulty filters**
- **JWT authentication** (register/login/logout)
- **Keyboard shortcuts** — press 1–4 to answer, Enter to proceed, Esc to exit
- **Offline mode** — works without backend using local data

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Grid/Flexbox), Vanilla JS (ES6+) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.IO |
| Validation | express-validator |
| Compression | Node.js zlib |
