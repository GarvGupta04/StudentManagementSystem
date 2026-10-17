
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test whether the backend is running.
app.get("/", (req, res) => {
    res.json({ message: "Student Management API is running" });
});

// Get all students.
app.get("/api/students", async (req, res) => {
    try {
        const [students] = await pool.execute(`
            SELECT
                s.student_id,
                s.name,
                s.email,
                s.phone,
                s.year_of_study,
                s.department_id,
                d.department_name
            FROM students s
            JOIN departments d
                ON s.department_id = d.department_id
            ORDER BY s.student_id DESC
        `);

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not fetch students" });
    }
});

// Add a student.
app.post("/api/students", async (req, res) => {
    try {
        const { name, email, phone, year_of_study, department_id } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            !Number.isInteger(Number(year_of_study)) ||
            Number(year_of_study) < 1 ||
            Number(year_of_study) > 6 ||
            !Number.isInteger(Number(department_id)) ||
            Number(department_id) < 1
        ) {
            return res.status(400).json({ error: "Invalid student details" });
        }

        const [result] = await pool.execute(
            `INSERT INTO students
                (name, email, phone, year_of_study, department_id)
             VALUES (?, ?, ?, ?, ?)`,
            [
                name.trim(),
                email.trim(),
                phone || null,
                Number(year_of_study),
                Number(department_id)
            ]
        );

        res.status(201).json({
            message: "Student added successfully",
            student_id: result.insertId
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "This email already exists"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                error: "Selected department does not exist"
            });
        }

        res.status(500).json({ error: "Could not add student" });
    }
});

// Update a student's details.
app.put("/api/students/:id", async (req, res) => {
    try {
        const { name, email, phone, year_of_study, department_id } = req.body;
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) || id < 1 ||
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            !Number.isInteger(Number(year_of_study)) ||
            Number(year_of_study) < 1 ||
            Number(year_of_study) > 6 ||
            !Number.isInteger(Number(department_id)) ||
            Number(department_id) < 1
        ) {
            return res.status(400).json({ error: "Invalid student details" });
        }

        const [result] = await pool.execute(
            `UPDATE students
             SET name = ?, email = ?, phone = ?,
                 year_of_study = ?, department_id = ?
             WHERE student_id = ?`,
            [
                name.trim(),
                email.trim(),
                phone || null,
                Number(year_of_study),
                Number(department_id),
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student updated successfully" });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "This email already exists" });
        }

        res.status(500).json({ error: "Could not update student" });
    }
});

// Delete a student.
app.delete("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: "Invalid student ID" });
        }

        const [result] = await pool.execute(
            "DELETE FROM students WHERE student_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not delete student" });
    }
});


// Get all departments.
app.get("/api/departments", async (req, res) => {
    try {
        const [departments] = await pool.execute(
            "SELECT department_id, department_name FROM departments ORDER BY department_name"
        );

        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not fetch departments" });
    }
});


// Start the server.
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
