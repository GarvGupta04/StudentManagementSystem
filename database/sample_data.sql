
-- Sample Data for Student Management System

USE student_management;

-- 1. Insert departments
INSERT INTO departments (department_name)
SELECT 'Computer Science'
WHERE NOT EXISTS (
    SELECT 1 FROM departments
    WHERE department_name = 'Computer Science'
);

INSERT INTO departments (department_name)
SELECT 'Information Technology'
WHERE NOT EXISTS (
    SELECT 1 FROM departments
    WHERE department_name = 'Information Technology'
);

INSERT INTO departments (department_name)
SELECT 'Electronics'
WHERE NOT EXISTS (
    SELECT 1 FROM departments
    WHERE department_name = 'Electronics'
);

-- 2. Insert courses
INSERT INTO courses (course_name, course_code, credits)
SELECT 'Database Management Systems', 'DBMS101', 4
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE course_code = 'DBMS101'
);

INSERT INTO courses (course_name, course_code, credits)
SELECT 'Data Structures and Algorithms', 'DSA101', 4
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE course_code = 'DSA101'
);

INSERT INTO courses (course_name, course_code, credits)
SELECT 'Computer Networks', 'CN101', 3
WHERE NOT EXISTS (
    SELECT 1 FROM courses WHERE course_code = 'CN101'
);

-- 3. Insert sample students

INSERT INTO students
    (name, email, phone, year_of_study, department_id)
SELECT
    'Aarav Sharma',
    'aarav@example.com',
    '9876543210',
    2,
    department_id
FROM departments
WHERE department_name = 'Computer Science'
AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE email = 'aarav@example.com'
)
LIMIT 1;

INSERT INTO students
    (name, email, phone, year_of_study, department_id)
SELECT
    'Priya Verma',
    'priya@example.com',
    '9876543211',
    2,
    department_id
FROM departments
WHERE department_name = 'Information Technology'
AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE email = 'priya@example.com'
)
LIMIT 1;

INSERT INTO students
    (name, email, phone, year_of_study, department_id)
SELECT
    'Rahul Mehta',
    'rahul@example.com',
    '9876543212',
    1,
    department_id
FROM departments
WHERE department_name = 'Computer Science'
AND NOT EXISTS (
    SELECT 1 FROM students
    WHERE email = 'rahul@example.com'
)
LIMIT 1;
