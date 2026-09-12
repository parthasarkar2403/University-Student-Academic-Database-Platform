-- University System - Database Schema
-- Module 1: Students
--
-- You do NOT have to run this file by hand. When the Flask backend
-- starts, it automatically creates this table for you (see backend/app.py,
-- the line "db.create_all()").
--
-- This file exists so you can:
--   1) See exactly what the table looks like.
--   2) Create the table manually if you ever want to, using psql or
--      a tool like pgAdmin / TablePlus / DBeaver.

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(30) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(30),
    department VARCHAR(150),
    year VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Active',
    date_of_birth DATE,
    enrollment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- A few sample rows so the Students page isn't empty the first time you run it.
-- Safe to delete any time from the app itself.
INSERT INTO students (student_id, full_name, email, department, year, status, enrollment_date)
VALUES
    ('STU-2026-001', 'Amara Okafor', 'amara.okafor@example.edu', 'Computer Science', '2nd Year', 'Active', '2024-08-15'),
    ('STU-2026-002', 'Liam Chen', 'liam.chen@example.edu', 'Mechanical Engineering', '3rd Year', 'Active', '2023-08-20')
ON CONFLICT DO NOTHING;
