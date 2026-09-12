import { useEffect, useState } from 'react'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api.js'

const STATUSES = ['Active', 'Graduated', 'Suspended', 'Dropped']

const EMPTY_FORM = {
  student_id: '',
  full_name: '',
  email: '',
  phone: '',
  department: '',
  year: '',
  status: 'Active',
  date_of_birth: '',
  enrollment_date: '',
}

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Load students whenever the page opens, or the search/filters change
  useEffect(() => {
    loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, departmentFilter])

  async function loadStudents() {
    setLoading(true)
    setError('')
    try {
      const data = await getStudents({
        search,
        status: statusFilter,
        department: departmentFilter,
      })
      setStudents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEditModal(student) {
    setEditingId(student.id)
    setForm({
      student_id: student.student_id || '',
      full_name: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      department: student.department || '',
      year: student.year || '',
      status: student.status || 'Active',
      date_of_birth: student.date_of_birth || '',
      enrollment_date: student.enrollment_date || '',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await updateStudent(editingId, form)
      } else {
        await createStudent(form)
      }
      setShowModal(false)
      await loadStudents()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(student) {
    const confirmed = window.confirm(
      `Delete student "${student.full_name}" (${student.student_id})? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      await deleteStudent(student.id)
      await loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by department..."
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={openAddModal}>+ Add Student</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <div className="empty-state">No students found. Click "Add Student" to create one.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Status</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.student_id}</td>
                <td>{s.full_name}</td>
                <td>{s.department || '-'}</td>
                <td>{s.year || '-'}</td>
                <td>
                  <span className={`status-badge status-${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td>{s.email || '-'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => openEditModal(s)}>Edit</button>{' '}
                  <button className="btn-danger" onClick={() => handleDelete(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Student ID *</label>
                <input
                  type="text"
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={form.date_of_birth || ''}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Enrollment Date</label>
                <input
                  type="date"
                  value={form.enrollment_date || ''}
                  onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
