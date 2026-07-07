# Tally — Expense Tracker

A full-stack expense tracker: React (Vite) frontend, Node/Express API, MongoDB via Mongoose, JWT auth. Built as a portfolio piece — same stack as TaskFlow.

## Features
- Register/login with JWT, passwords hashed with bcrypt
- Create, edit, delete expenses (title, amount, category, date, notes)
- Filter by category, paginated Tally table
- Dashboard: total spend, current-month spend vs. budget (with an "on budget" / "over budget" stamp), spend-by-category pie chart, 12-month bar chart
- Monthly budget you can set and edit inline
- Every expense scoped to the logged-in user — one user can never see another's data
- Jest + Supertest backend test suite (auth + expense CRUD + authorization checks) using an in-memory MongoDB

## Stack
- **Frontend:** React 18, React Router, Axios, Recharts, Vite
- **Backend:** Node, Express, Mongoose, jsonwebtoken, bcryptjs, express-validator patterns
- **DB:** MongoDB
- **Testing:** Jest, Supertest, mongodb-memory-server

## Project structure
```
expense-tracker/
├── backend/
│   ├── config/db.js
│   ├── models/User.js
│   ├── models/Expense.js
│   ├── middleware/auth.js
│   ├── middleware/errorHandler.js
│   ├── controllers/authController.js
│   ├── controllers/expenseController.js
│   ├── routes/authRoutes.js
│   ├── routes/expenseRoutes.js
│   ├── tests/
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/
        ├── pages/
        └── styles/global.css
```

## Running it locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit JWT_SECRET and MONGO_URI if needed
npm run dev                # nodemon, http://localhost:5000
```
Requires a running MongoDB instance (local install, or a free Atlas cluster — just drop the connection string into `MONGO_URI`).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```
The frontend expects the API at `http://localhost:5000/api` by default. To point elsewhere, create `frontend/.env` with:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run backend tests
```bash
cd backend
npm test
```
Tests spin up an in-memory MongoDB (`mongodb-memory-server`), so no real database is touched. Note: the first run downloads a MongoDB binary, so it needs internet access once.

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create account, returns JWT |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| GET | `/api/auth/me` | ✔ | Current user profile |
| PUT | `/api/auth/me` | ✔ | Update name / monthly budget |
| GET | `/api/expenses` | ✔ | List expenses (`?category=&from=&to=&page=&limit=`) |
| POST | `/api/expenses` | ✔ | Create an expense |
| GET | `/api/expenses/:id` | ✔ | Get one expense |
| PUT | `/api/expenses/:id` | ✔ | Update an expense |
| DELETE | `/api/expenses/:id` | ✔ | Delete an expense |
| GET | `/api/expenses/stats/summary` | ✔ | Totals, by-category, by-month aggregates |

Send the JWT as `Authorization: Bearer <token>`.

## Deployment notes
- **Backend:** Render, Railway, or Fly.io all work well for a free-tier Node + MongoDB Atlas deploy. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` as environment variables.
- **Frontend:** Vercel or Netlify — set `VITE_API_URL` to your deployed backend URL, then `npm run build`.

## Ideas for extending this for your resume
- Recurring expenses (subscriptions) with auto-generation
- CSV export of the Tally
- Multi-currency support
- Shared/household budgets (multiple users on one budget)
- Receipt image upload (would pair well with the Claude API, like in TaskFlow)
