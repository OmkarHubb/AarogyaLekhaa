import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import StatsCard from '../components/StatsCard'
import DoctorTable from '../components/DoctorTable'
import AppointmentTable from '../components/AppointmentTable'
import PasswordInput from '../components/PasswordInput'
import './AdminDashboard.css'

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics', 'ENT']

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showRegister, setShowRegister] = useState(false)
    const [regForm, setRegForm] = useState({
        name: '', email: '', department: 'Cardiology', daily_capacity: '', password: '', confirmPassword: '',
    })
    const [regError, setRegError] = useState('')
    const [regSuccess, setRegSuccess] = useState('')
    const [regLoading, setRegLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        api.get('/admin/stats')
            .then(({ data }) => setStats(data))
            .catch((err) => {
                if (err.response?.status === 401) {
                    localStorage.removeItem('adminToken')
                    localStorage.removeItem('adminUser')
                    navigate('/admin/login', { replace: true })
                }
                setStats(null)
            })
            .finally(() => setLoading(false))
    }, [navigate, refreshKey])

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/admin/login', { replace: true })
    }

    const handleRegChange = (e) => {
        setRegForm({ ...regForm, [e.target.name]: e.target.value })
        setRegError('')
        setRegSuccess('')
    }

    const handleRegSubmit = async (e) => {
        e.preventDefault()
        setRegError('')
        setRegSuccess('')

        if (!regForm.name.trim()) return setRegError('Doctor name is required.')
        if (!regForm.email.trim()) return setRegError('Email is required.')
        if (!regForm.department) return setRegError('Department is required.')
        if (!regForm.daily_capacity || Number(regForm.daily_capacity) <= 0) return setRegError('Valid daily capacity is required.')
        if (!regForm.password) return setRegError('Password is required.')
        if (regForm.password.length < 6) return setRegError('Password must be at least 6 characters.')
        if (regForm.password !== regForm.confirmPassword) return setRegError('Passwords do not match.')

        setRegLoading(true)
        try {
            const { data } = await api.post('/admin/register-doctor', {
                name: regForm.name,
                email: regForm.email,
                department: regForm.department,
                daily_capacity: Number(regForm.daily_capacity),
                password: regForm.password,
            })
            setRegSuccess(`Doctor registered successfully! ID: ${data.doctor_id}`)
            setRegForm({ name: '', email: '', department: 'Cardiology', daily_capacity: '', password: '', confirmPassword: '' })
            setRefreshKey((k) => k + 1) // refresh stats and tables
        } catch (err) {
            setRegError(err.response?.data?.detail || 'Failed to register doctor.')
        } finally {
            setRegLoading(false)
        }
    }

    const statsCards = stats
        ? [
            { icon: '🩺', label: 'Total Doctors', value: stats.total_doctors, accent: '#1E88E5' },
            { icon: '📅', label: 'Total Appointments', value: stats.total_appointments, accent: '#43A047' },
            { icon: '🚨', label: 'Emergency Cases', value: stats.emergency_cases, accent: '#E53935' },
            { icon: '📊', label: 'Avg Workload %', value: `${stats.avg_workload}%`, accent: '#FB8C00' },
        ]
        : []

    return (
        <div className="page anim-fade-in">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h2>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                        Hospital-wide overview — doctor workloads and appointment monitoring
                    </p>
                </div>
                <button
                    className="btn btn-outline"
                    onClick={handleLogout}
                    style={{ marginTop: 4, flexShrink: 0 }}
                >
                    Sign Out
                </button>
            </div>

            {/* Stats row */}
            <div className="stats-grid">
                {loading ? (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
                        Loading stats…
                    </p>
                ) : statsCards.length > 0 ? (
                    statsCards.map((s) => (
                        <StatsCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
                        Unable to load stats.
                    </p>
                )}
            </div>

            {/* Register New Doctor */}
            <div className="card" style={{ marginBottom: 28 }}>
                <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => setShowRegister(!showRegister)}>
                    <div className="section-icon">➕</div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>Register New Doctor</h3>
                        <p className="text-muted" style={{ marginTop: 2 }}>Add a new doctor to the system</p>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', transform: showRegister ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
                        ▼
                    </span>
                </div>

                {showRegister && (
                    <div className="anim-fade-in" style={{ marginTop: 16 }}>
                        <div className="divider" />
                        <form onSubmit={handleRegSubmit} style={{ maxWidth: 540 }}>
                            <div className="form-group">
                                <label htmlFor="reg-name">Doctor Name</label>
                                <input id="reg-name" name="name" className="form-control" placeholder="Dr. Full Name"
                                    value={regForm.name} onChange={handleRegChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reg-email">Email</label>
                                <input id="reg-email" name="email" type="email" className="form-control" placeholder="doctor@hospital.com"
                                    value={regForm.email} onChange={handleRegChange} />
                            </div>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                                    <label htmlFor="reg-dept">Department</label>
                                    <select id="reg-dept" name="department" className="form-control"
                                        value={regForm.department} onChange={handleRegChange}>
                                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
                                    <label htmlFor="reg-cap">Daily Capacity</label>
                                    <input id="reg-cap" name="daily_capacity" type="number" min="1" className="form-control"
                                        placeholder="e.g. 10" value={regForm.daily_capacity} onChange={handleRegChange} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                                    <label htmlFor="reg-pw">Password</label>
                                    <PasswordInput id="reg-pw" name="password" value={regForm.password}
                                        onChange={handleRegChange} autoComplete="new-password" />
                                </div>
                                <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                                    <label htmlFor="reg-cpw">Confirm Password</label>
                                    <PasswordInput id="reg-cpw" name="confirmPassword" value={regForm.confirmPassword}
                                        onChange={handleRegChange} autoComplete="new-password" />
                                </div>
                            </div>

                            {regError && (
                                <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: 12 }}>
                                    ⚠ {regError}
                                </div>
                            )}
                            {regSuccess && (
                                <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: 12 }}>
                                    ✅ {regSuccess}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={regLoading} style={{ padding: '10px 28px' }}>
                                {regLoading ? 'Registering…' : 'Register Doctor'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Doctor Workload Table */}
            <div className="card" style={{ marginBottom: 28 }}>
                <div className="section-header">
                    <div className="section-icon">🩺</div>
                    <div>
                        <h3 style={{ margin: 0 }}>Doctor Workload</h3>
                        <p className="text-muted" style={{ marginTop: 2 }}>Real-time capacity and availability overview</p>
                    </div>
                </div>
                <DoctorTable key={`dt-${refreshKey}`} />
            </div>

            {/* Appointment Monitoring Table */}
            <div className="card">
                <div className="section-header">
                    <div className="section-icon">📅</div>
                    <div>
                        <h3 style={{ margin: 0 }}>Appointment Monitoring</h3>
                        <p className="text-muted" style={{ marginTop: 2 }}>Live queue — emergency cases highlighted in red</p>
                    </div>
                </div>
                <AppointmentTable key={`at-${refreshKey}`} />
            </div>
        </div>
    )
}
