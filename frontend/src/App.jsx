
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:5001/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  year_of_study: "1",
  department_id: ""
};

function App() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  // Load students and departments from the backend.
  async function loadData() {
    try {
      const [studentResponse, departmentResponse] =
        await Promise.all([
          fetch(`${API}/students`),
          fetch(`${API}/departments`)
        ]);

      if (!studentResponse.ok || !departmentResponse.ok) {
        throw new Error("Could not load application data.");
      }

      const studentData = await studentResponse.json();
      const departmentData = await departmentResponse.json();

      setStudents(studentData);
      setDepartments(departmentData);
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.message ||
          "Could not connect to the server. Check your backend."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Show a notification to the user.
  function showNotice(type, message) {
    setNotice({ type, message });
  }

  // Handle changes in the form.
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Validate the form before sending it to the backend.
  function validateForm() {
    if (!form.name.trim()) {
      return "Please enter the student's full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (
      form.phone.trim() &&
      !/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())
    ) {
      return "Please enter a valid phone number.";
    }

    const year = Number(form.year_of_study);

    if (!Number.isInteger(year) || year < 1 || year > 6) {
      return "Select a valid year of study.";
    }

    if (
      !form.department_id ||
      !departments.some(
        (department) =>
          Number(department.department_id) ===
          Number(form.department_id)
      )
    ) {
      return "Please select a valid department.";
    }

    return null;
  }

  // Add a new student or update an existing student.
  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showNotice("error", validationError);
      return;
    }

    setSaving(true);
    setNotice(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      year_of_study: Number(form.year_of_study),
      department_id: Number(form.department_id)
    };

    try {
      const url = editingId
        ? `${API}/students/${editingId}`
        : `${API}/students`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save student details."
        );
      }

      showNotice(
        "success",
        editingId
          ? "Student details updated successfully."
          : "New student added successfully."
      );

      setForm(emptyForm);
      setEditingId(null);

      await loadData();
    } catch (error) {
      showNotice("error", error.message);
    } finally {
      setSaving(false);
    }
  }

  // Fill the form when Edit is clicked.
  function handleEdit(student) {
    setEditingId(student.student_id);

    setForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      year_of_study: String(student.year_of_study),
      department_id: String(student.department_id)
    });

    setNotice(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Delete a student after confirmation.
  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Delete ${student.name}'s record? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/students/${student.student_id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not delete student."
        );
      }

      if (editingId === student.student_id) {
        cancelEdit();
      }

      showNotice("success", "Student record deleted successfully.");
      await loadData();
    } catch (error) {
      showNotice("error", error.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setNotice(null);
  }

  // Search and filter student records.
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        String(student.student_id).includes(query) ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "all" ||
        String(student.department_id) === departmentFilter;

      const matchesYear =
        yearFilter === "all" ||
        String(student.year_of_study) === yearFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesYear
      );
    });
  }, [students, search, departmentFilter, yearFilter]);

  // Calculate dashboard statistics.
  const departmentStats = useMemo(() => {
    return departments.map((department) => ({
      ...department,
      count: students.filter(
        (student) =>
          Number(student.department_id) ===
          Number(department.department_id)
      ).length
    })).sort((a, b) => b.count - a.count);
  }, [students, departments]);

  const yearStats = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map((year) => ({
      year,
      count: students.filter(
        (student) => Number(student.year_of_study) === year
      ).length
    }));
  }, [students]);

  const maximumYearCount = Math.max(
    1,
    ...yearStats.map((item) => item.count)
  );

  const averageYear =
    students.length > 0
      ? (
        students.reduce(
          (sum, student) =>
            sum + Number(student.year_of_study),
          0
        ) / students.length
      ).toFixed(1)
      : "0.0";

  const totalDepartments = departments.length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">S</span>
          <span>
            <strong>Student Portal</strong>
            <small>Management Suite</small>
          </span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="#dashboard">
            <span className="nav-symbol">▦</span>
            Dashboard
          </a>

          <a className="nav-item" href="#students">
            <span className="nav-symbol">♙</span>
            Students
          </a>

          <a className="nav-item" href="#analytics">
            <span className="nav-symbol">▥</span>
            Analytics
          </a>

          <a className="nav-item" href="#departments">
            <span className="nav-symbol">▤</span>
            Departments
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            <div>
              <strong>System status</strong>
              <small>Application workspace</small>
            </div>
          </div>
          <p>Student Management System</p>
          <small>Academic administration</small>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">ACADEMIC WORKSPACE</p>
            <h1>Dashboard</h1>
            <p className="page-subtitle">
              Manage your student records in one place.
            </p>
          </div>

          <button
            className="button button-secondary refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            ↻ <span>Refresh data</span>
          </button>
        </header>

        {notice && (
          <div
            className={`notice notice-${notice.type}`}
            role="status"
          >
            <span>
              {notice.type === "success" ? "✓" : "!"}
            </span>
            <p>{notice.message}</p>
            <button
              type="button"
              className="notice-close"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        <section className="stats-grid" aria-label="Overview">
          <article className="stat-card">
            <div className="stat-heading">
              <span>Total students</span>
              <span className="stat-icon green-icon">♙</span>
            </div>
            <h2>{students.length}</h2>
            <p>Registered student records</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Departments</span>
              <span className="stat-icon orange-icon">▤</span>
            </div>
            <h2>{totalDepartments}</h2>
            <p>Available academic departments</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Year 1 students</span>
              <span className="stat-icon yellow-icon">◷</span>
            </div>
            <h2>{yearStats[0].count}</h2>
            <p>First-year registrations</p>
          </article>

          <article className="stat-card">
            <div className="stat-heading">
              <span>Average study year</span>
              <span className="stat-icon neutral-icon">▥</span>
            </div>
            <h2>{averageYear}</h2>
            <p>Across registered students</p>
          </article>
        </section>

        <section className="analytics-grid" id="analytics">
          <article className="panel analytics-panel">
            <div className="panel-heading">
              <div>
                <h2>Year-wise distribution</h2>
                <p>Students across study years</p>
              </div>
              <span className="panel-tag">6 years</span>
            </div>

            <div className="year-chart">
              {yearStats.map((item) => (
                <div className="year-row" key={item.year}>
                  <span className="year-label">
                    Year {item.year}
                  </span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(item.count /
                            maximumYearCount) *
                          100
                          }%`
                      }}
                    ></div>
                  </div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </article>

          <article
            className="panel analytics-panel"
            id="departments"
          >
            <div className="panel-heading">
              <div>
                <h2>Department overview</h2>
                <p>Registrations by department</p>
              </div>
            </div>

            <div className="department-list">
              {departmentStats.map((department) => {
                const percentage =
                  students.length > 0
                    ? Math.round(
                      (department.count /
                        students.length) *
                      100
                    )
                    : 0;

                return (
                  <div
                    className="department-item"
                    key={department.department_id}
                  >
                    <div className="department-info">
                      <span className="department-mark">
                        {department.department_name
                          .charAt(0)}
                      </span>
                      <span className="department-name">
                        <strong>
                          {department.department_name}
                        </strong>
                        <small>
                          {department.count} student
                          {department.count !== 1
                            ? "s"
                            : ""}
                        </small>
                      </span>
                      <span className="department-percent">
                        {percentage}%
                      </span>
                    </div>
                    <div className="bar-track department-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {departments.length === 0 && (
                <p className="empty-message">
                  No departments available.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="panel form-panel" id="student-form">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">STUDENT MANAGEMENT</p>
              <h2>
                {editingId
                  ? "Edit student details"
                  : "Add a new student"}
              </h2>
              <p>
                {editingId
                  ? "Update the selected student's information."
                  : "Enter the details to register a student."}
              </p>
            </div>

            {editingId && (
              <span className="editing-tag">Editing record</span>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <label className="form-field">
                <span>Full name <b>*</b></span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Mehta"
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="form-field">
                <span>Email address <b>*</b></span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  maxLength={20}
                  autoComplete="tel"
                />
              </label>

              <label className="form-field">
                <span>Year of study <b>*</b></span>
                <select
                  name="year_of_study"
                  value={form.year_of_study}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <option value={year} key={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field full-field">
                <span>Department <b>*</b></span>
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select a department
                  </option>
                  {departments.map((department) => (
                    <option
                      key={department.department_id}
                      value={department.department_id}
                    >
                      {department.department_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="button button-primary"
                disabled={saving || loading}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "+ Add student"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel table-panel" id="students">
          <div className="panel-heading table-title">
            <div>
              <h2>Student records</h2>
              <p>
                Search, filter, and manage registered students.
              </p>
            </div>
            <span className="record-count">
              {filteredStudents.length} records
            </span>
          </div>

          <div className="filter-toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, email or ID..."
                aria-label="Search students"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
              aria-label="Filter by department"
            >
              <option value="all">All departments</option>
              {departments.map((department) => (
                <option
                  key={department.department_id}
                  value={String(department.department_id)}
                >
                  {department.department_name}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(event.target.value)
              }
              aria-label="Filter by study year"
            >
              <option value="all">All years</option>
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option value={String(year)} key={year}>
                  Year {year}
                </option>
              ))}
            </select>

            {(search ||
              departmentFilter !== "all" ||
              yearFilter !== "all") && (
                <button
                  className="clear-filters"
                  onClick={() => {
                    setSearch("");
                    setDepartmentFilter("all");
                    setYearFilter("all");
                  }}
                >
                  Clear filters
                </button>
              )}
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>STUDENT</th>
                  <th>EMAIL ADDRESS</th>
                  <th>DEPARTMENT</th>
                  <th>YEAR</th>
                  <th className="actions-heading">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="table-message">
                      Loading student records...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-message">
                      {students.length === 0
                        ? "No student records yet. Add your first student above."
                        : "No students match your search or filters."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.student_id}>
                      <td className="id-cell">
                        #{student.student_id}
                      </td>

                      <td>
                        <div className="student-cell">
                          <span className="avatar">
                            {student.name
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <strong>{student.name}</strong>
                        </div>
                      </td>

                      <td className="email-cell">
                        {student.email}
                      </td>

                      <td>
                        <span className="department-badge">
                          {student.department_name}
                        </span>
                      </td>

                      <td>
                        <span className="year-badge">
                          Year {student.year_of_study}
                        </span>
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(student)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(student)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing {filteredStudents.length} of{" "}
              {students.length} students
            </span>
            <span>Student Management System</span>
          </div>
        </section>

        <footer className="page-footer">
          <span>© {new Date().getFullYear()} Student Portal</span>
          <span>Built for academic administration</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
