# KINGS Library Management System — Express backend

## Setup
1. Ensure MySQL Server 8.0 is running.
2. Open MySQL 8.0 Command Line Client and run the contents of `database.sql` (or run `SOURCE C:/full/path/to/database.sql;`).
3. In this folder, run `npm install`.
4. Copy `.env.example` to `.env` and enter your actual MySQL password and a long JWT secret. Never commit `.env` to GitHub.
5. Run `npm run dev`.
6. Visit `http://localhost:5000/api/health`. Expect `{"api":"ok","database":"connected"}`.

## Important: initial admin
No default user is inserted because passwords must be hashed. After the server and database are running, create the first admin by running `node seed-admin.js` and following its prompts (see the file). Keep the credentials private.

## Routes
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/books`, `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id`
- `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` (Admin only)
- `GET /api/transactions`, `POST /api/transactions`

Protected routes expect `Authorization: Bearer <token>`.
