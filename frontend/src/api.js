// This file is the ONLY place that talks to the Flask backend.
// Every other component calls these functions instead of using fetch() directly.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  return data
}

// GET /api/students  (with optional ?search=...&department=...&status=...)
export async function getStudents(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString()
  const res = await fetch(`${API_URL}/api/students${query ? `?${query}` : ''}`)
  return handleResponse(res)
}

// POST /api/students
export async function createStudent(student) {
  const res = await fetch(`${API_URL}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  })
  return handleResponse(res)
}

// PUT /api/students/:id
export async function updateStudent(id, student) {
  const res = await fetch(`${API_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  })
  return handleResponse(res)
}

// DELETE /api/students/:id
export async function deleteStudent(id) {
  const res = await fetch(`${API_URL}/api/students/${id}`, {
    method: 'DELETE',
  })
  return handleResponse(res)
}
