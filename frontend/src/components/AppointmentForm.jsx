import { useState } from 'react'
import api from '../api'

const DEPARTMENTS = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'General',
    'Pediatrics',
    'ENT'
]

export default function AppointmentForm({ onReport, onLoading }) {

    const [form, setForm] = useState({
        patient_name: '',
        age: '',
        symptoms: '',
        department: 'Cardiology',
        patient_email: '',
    })

    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.patient_name.trim())
            return setError('Patient name is required.')

        if (!form.age || Number(form.age) <= 0)
            return setError('Please enter a valid age.')

        if (!form.symptoms.trim())
            return setError('Please describe symptoms.')

        if (!form.patient_email.trim())
            return setError('Patient email is required.')

        if (!isValidEmail(form.patient_email))
            return setError('Please enter a valid email address.')

        onLoading(true)
        setError('')

        try {
            const { data } = await api.post('/appointments', {
                ...form,
                age: Number(form.age),
            })

            if (data.status === 'rejected') {
                setError(data.reason || 'No doctor available. Please try again later.')
                return
            }

            onReport(data)

        } catch (err) {

            const detail = err.response?.data?.detail

            if (Array.isArray(detail)) {
                setError(detail.map((d) => d.msg).join(' '))
            } else if (typeof detail === 'string') {
                setError(detail)
            } else {
                setError('Something went wrong. Please try again.')
            }

        } finally {
            onLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>

            <div className="form-group">
                <label htmlFor="patient_name">Patient Name</label>
                <input
                    id="patient_name"
                    name="patient_name"
                    className="form-control"
                    placeholder="e.g. Rahul Mehta"
                    value={form.patient_name}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 45"
                    value={form.age}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="patient_email">Email Address</label>
                <input
                    id="patient_email"
                    name="patient_email"
                    type="email"
                    className="form-control"
                    placeholder="e.g. patient@email.com"
                    value={form.patient_email}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="symptoms">Symptoms</label>
                <textarea
                    id="symptoms"
                    name="symptoms"
                    className="form-control"
                    placeholder="Describe symptoms (e.g. chest pain, breathlessness...)"
                    value={form.symptoms}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                    id="department"
                    name="department"
                    className="form-control"
                    value={form.department}
                    onChange={handleChange}
                >
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    marginBottom: 16,
                }}>
                    ⚠ {error}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center', padding: '12px' }}
            >
                Book Appointment →
            </button>

        </form>
    )
}
