# University Student & Academic Database System — Beginner-Friendly Build

A simple, real (no fake data) University Student & Academic Database
System, built one module at a time.

**Stack:** React (frontend) → Flask (backend) → PostgreSQL (database) → Render (hosting)

```
university-system/
├── frontend/     React app (what you see in the browser)
├── backend/      Flask API (the "brain" — talks to the database)
└── database/     SQL schema + notes (reference only)
```

**Status: Module 1 — Students is complete and tested.** Faculty, Courses,
Departments, Attendance, Exams, Grades, Fees, and Reports will be added
one at a time after you confirm this module works for you.

---

## How data flows

```
React (frontend)  --fetch()-->  Flask (backend)  --SQL-->  PostgreSQL (database)
```

The React app never talks to the database directly — it only ever calls
the Flask API. Flask is the only thing allowed to touch PostgreSQL. This
is what makes it secure and "real" instead of a mockup.

---

## Step-by-step: what we built and why

### Step 1 — Project setup
Three folders: `frontend/`, `backend/`, `database/`. Keeping them separate
means you can deploy the backend and frontend as two different services on
Render, which is what real production apps do.

### Step 2 — PostgreSQL connection
`backend/config.py` reads a `DATABASE_URL` environment variable and gives
it to Flask-SQLAlchemy (the library that lets Python talk to Postgres
using normal Python code instead of raw SQL everywhere).

### Step 3 — Students table
`backend/models.py` defines the `Student` model — this is Python's
description of the `students` table. When the backend starts, it runs
`db.create_all()`, which automatically creates the table in Postgres if
it doesn't already exist. `database/schema.sql` shows the same table in
plain SQL, for reference. Each student has a unique `student_id` (their
roll/registration number) — the backend rejects duplicates.

### Step 4 — Flask CRUD API
`backend/app.py` has 5 routes:

| Method | URL                    | Does                              |
|--------|------------------------|-----------------------------------|
| GET    | `/api/students`        | List / search / filter students   |
| GET    | `/api/students/<id>`   | Get one student                   |
| POST   | `/api/students`        | Create a student                  |
| PUT    | `/api/students/<id>`   | Update a student                  |
| DELETE | `/api/students/<id>`   | Delete a student                  |

Every route reads from or writes to the real Postgres database — nothing
is hardcoded. Search checks name, student ID, and email at once; you can
also filter by department and status.

### Step 5 — React Students page
`frontend/src/components/StudentsPage.jsx` — a table of students, a search
box, department and status filters, and an "Add Student" button that
opens a form modal for creating and editing.

### Step 6 — Connect React to Flask
`frontend/src/api.js` is the only file that calls `fetch()`. It reads the
backend's address from `VITE_API_URL` (an environment variable), so you
can point it at `localhost` while developing and at your real Render URL
after deploying — without changing any code.

### Step 7 — Test Create, Read, Update, Delete
Already tested for you (see below) — creating, listing, searching,
filtering, updating, deleting, and the duplicate-student-ID check all
work correctly against a real database.

### Step 8 — Deploy to Render
Instructions below.

---

## Running it on your own computer

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL installed locally (or use a free Render Postgres — see deployment section)

### 1. Set up the database
```bash
createdb university_system
```
(The tables get created automatically when you start the backend — you
don't need to run any SQL by hand.)

### 2. Start the backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# open .env and set DATABASE_URL to your local Postgres connection string

python3 app.py
```
Backend now running at **http://localhost:5000**. Visit it in your
browser — you should see `{"message": "University System API is running"}`.

### 3. Start the frontend
Open a **second terminal**:
```bash
cd frontend
npm install

cp .env.example .env
# leave VITE_API_URL as http://localhost:5000 for local dev

npm run dev
```
Frontend now running at **http://localhost:5173**. Open it in your
browser — you should see the Students page, already talking to your real
database.

### 4. Try it
- Click **+ Add Student**, fill the form (Student ID and Full Name are
  required), save it.
- Try adding the same Student ID again — it should be rejected.
- Refresh the page — your student is still there (it's in Postgres, not
  in browser memory).
- Try search, and the department/status filters.
- Edit a student, then delete one (with the confirmation dialog).

---

## Deploying to Render

You'll create **3 things** on Render: a Postgres database, a backend web
service, and a frontend static site.

### 1. Create the PostgreSQL database
1. Render dashboard → **New +** → **PostgreSQL**.
2. Name it (e.g. `university-system-db`) → **Create Database**.
3. Once it's ready, copy the **Internal Database URL** shown on its page.

### 2. Deploy the backend
1. Push this project to a GitHub repo.
2. Render dashboard → **New +** → **Web Service** → connect your repo.
3. Set **Root Directory** to `backend`.
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `gunicorn app:app`
6. Under **Environment**, add:
   - `DATABASE_URL` = the Internal Database URL from step 1
   - `ADMIN_KEY` = a password you make up (used in a later module)
7. Deploy. Once live, copy your backend's URL
   (e.g. `https://university-system-backend.onrender.com`).

### 3. Deploy the frontend
1. Render dashboard → **New +** → **Static Site** → connect the same repo.
2. Set **Root Directory** to `frontend`.
3. **Build Command:** `npm install && npm run build`
4. **Publish Directory:** `dist`
5. Under **Environment**, add:
   - `VITE_API_URL` = your backend's Render URL from step 2
6. Deploy.

### 4. Test the live app
Open your frontend's Render URL. Add a student — it's now stored in a
real, cloud-hosted PostgreSQL database.

> **Note on CORS:** the backend already has `flask-cors` enabled for all
> origins so this works out of the box. When you're ready to lock things
> down for production, restrict it to just your frontend's URL in
> `backend/app.py`.

---

## What's next

Once you've confirmed Students works the way you want (locally and/or on
Render), tell me and we'll add the next module — most likely **Faculty**
or **Departments** — following the exact same pattern:
new table → new Flask routes → new React page → connect → test.

Later modules will build on Students: Courses and Departments come next
(so students can be linked to them), then Attendance, Exams, and Grades
(which reference Students + Courses), then Fees, and finally Reports
(a simple query builder across the other tables) plus a Login/Admin
dashboard with basic user roles.
