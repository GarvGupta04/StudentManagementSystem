# 🎓 Student Management System

A full-stack web application for managing student records and academic information through a centralized dashboard.

The application allows administrators to manage students, organize departments, and view student statistics through a clean and responsive user interface.

## 🚀 Features

- **Dashboard Overview:** View total students, department count, year-wise student statistics, and average study year.
- **Student Management:** Add, edit, and delete student records.
- **Search Students:** Search by student name, email, or student ID.
- **Filter Records:** Filter students by department and year of study.
- **Department Overview:** View departments and their associated students.
- **Form Validation:** Validate student information before submission.
- **Confirmation Messages:** Receive feedback when operations succeed or fail.
- **Responsive UI:** Access the dashboard on different screen sizes.
- **MySQL Integration:** Store and retrieve student information from a relational database.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server and build tool |
| CSS | Styling and responsive layout |
| Node.js | Backend JavaScript runtime |
| Express.js | REST API and server-side logic |
| MySQL | Relational database |
| Git & GitHub | Version control and source code hosting |

## 📁 Project Structure

```text
StudentManagementSystem/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── public/
│   ├── package.json
│   └── index.html
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql
│   └── sample_data.sql
├── .gitignore
└── README.md
```

*Note: The structure above is representative. Your actual files may differ.*

## ⚙️ Prerequisites

Before running the project, install:

- [Node.js](https://nodejs.org/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [Git](https://git-scm.com/)

You can use MySQL Workbench to manage the database.

## 💻 Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd StudentManagementSystem
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Set Up the Database

1. Start your MySQL Server.
2. Open MySQL Workbench and connect to your server.
3. Open `database/schema.sql` and execute it to create the database and tables.
4. Open `database/sample_data.sql` and execute it to insert sample departments, courses, and students.

These scripts are intended for initial setup on a fresh database.

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory using `.env.example` as a reference.

Example configuration:

```env
PORT=5001
DB_HOST=localhost
DB_USER=student_app
DB_PASSWORD=your_mysql_password
DB_NAME=student_management
```

Use the exact environment variable names expected by your `db.js` file. Replace the example password with your own local MySQL user's password.

**Security:** Never commit your actual `.env` file or database credentials to GitHub.

### 4. Start the Backend

From the `backend` directory, run:

```bash
npm start
```

If your `package.json` does not define a `start` script, use the command configured for your backend, such as:

```bash
node server.js
```

The backend should run at:

```text
http://localhost:5001
```

### 5. Start the Frontend

Open a new terminal window and navigate to the frontend directory from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

## 🔌 API Endpoints

The backend exposes REST API endpoints for student and department management.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | Retrieve student records |
| POST | `/api/students` | Add a new student |
| PUT | `/api/students/:id` | Update an existing student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/departments` | Retrieve department records |

Base URL:

```text
http://localhost:5001/api
```

## 🗄️ Database Design

The MySQL database is named `student_management` and contains six tables:

- **departments:** Stores department information.
- **students:** Stores student details and department associations.
- **courses:** Stores course information and course codes.
- **enrollments:** Connects students with courses and semesters.
- **marks:** Stores marks obtained for course enrollments.
- **attendance:** Records attendance status by date for each enrollment.

Primary keys, foreign keys, and unique constraints help maintain data consistency.

## 🔒 Security and Configuration

- Environment variables are stored locally in `.env`.
- `.gitignore` excludes environment files and dependency directories.
- Database queries should use parameterized statements to reduce SQL injection risks.
- A separate MySQL application user is used for backend database access.

## 🔮 Future Improvements

- Course enrollment management through the dashboard.
- Marks entry and academic performance reports.
- Attendance tracking and percentage calculations.
- Authentication and role-based access control.
- Export student reports to CSV or PDF.
- Deploy the application for online access.

## 👨‍💻 Author

**Garv Gupta**

B.Tech CSE (Data Science)  
Vellore Institute of Technology, Vellore

GitHub: [GarvGupta04](https://github.com/GarvGupta04)

---

⭐ If you find this project useful, consider giving the repository a star.
