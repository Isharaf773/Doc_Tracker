# DocTrack Backend

This backend uses Express and MySQL to provide authentication and data for the frontend pages.

## Setup

1. Copy `.env.example` to `.env`.
2. Set your database credentials.
3. Run `npm install` if you haven't already.
4. Create the MySQL database and seed the data:

```bash
cd backend
mysql -u root -p < init.sql
```

5. Start the backend server:

```bash
npm run dev
```

## Local environment

Use `.env.example` as a template. Example values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=doctrack
DB_PORT=3306
PORT=8080
```

## API routes

- `GET /api/health` — backend health check
- `POST /api/login` — login with `email` and `password`
- `GET /api/dashboard` — dashboard metrics + recent records + activity
- `GET /api/records` — list records, optional query `?status=&dept=` 
- `GET /api/records/:recordCode` — get single record details
- `POST /api/records` — create a new record
- `POST /api/records/:recordCode/location` — update record location/status
- `GET /api/users` — list user accounts
- `GET /api/notifications` — list notification items
- `GET /api/journey?recordId=REC-2026-0341` — get journey steps
- `GET /api/reports` — report data for charts

## Seed data

The `init.sql` script creates these tables and inserts sample values:

- `admins`
- `users`
- `records`
- `journey_logs`
- `notifications`

## Admin login

- Email: `amal@geomine.gov.lk`
- Password: `password123`

> If your MySQL password is not `root`, update `.env` before running the backend.
