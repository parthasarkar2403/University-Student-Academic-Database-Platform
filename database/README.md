# Database Folder

This folder is just for reference and manual database work. The Flask
backend creates and manages the actual tables for you automatically.

## What's here

- `schema.sql` — the SQL definition of every table in the system.
  Right now it only has the `students` table (Module 1). As we add more
  modules (Faculty, Courses, Departments, Attendance, Exams, Grades,
  Fees, Reports) their tables will be added here too.

## How to use it (optional)

You don't need to run this file manually — `backend/app.py` does it for
you the first time it starts. But if you ever want to inspect or set up
the database by hand:

### 1. Local Postgres

```bash
# Create the database (only once)
createdb university_system

# Load the schema
psql -d university_system -f schema.sql
```

### 2. Render Postgres

1. Go to your Render Postgres instance's dashboard.
2. Click **Connect** → copy the **PSQL Command**.
3. Paste it into your terminal, then run:
   ```sql
   \i schema.sql
   ```

## Viewing your data

```bash
psql -d university_system
SELECT * FROM students;
```
