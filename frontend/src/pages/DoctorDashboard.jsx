import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import './DoctorDashboard.css'

export default function DoctorDashboard() {
    const navigate = useNavigate()
    const [doctor, setDoctor] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    const storedUser = JSON.parse(localStorage.getItem('doctorUser') || '{}')
    const doctorId = storedUser.id

    useEffect(() => {
        if (!doctorId) return
        Promise.all([
            api.get(`/doctor/profile/${doctorId}`),
            api.get(`/doctor/appointments/${doctorId}`),
        ])
            .then(([profileRes, apptRes]) => {
                setDoctor(profileRes.data)
                setAppointments(apptRes.data)
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    localStorage.removeItem('doctorToken')
                    localStorage.removeItem('doctorUser')
                    navigate('/doctor', { replace: true })
                }
            })
            .finally(() => setLoading(false))
    }, [doctorId, navigate])

    const handleLogout = () => {
        localStorage.removeItem('doctorToken')
        localStorage.removeItem('doctorUser')
        navigate('/doctor', { replace: true })
    }

    // Filter today's appointments
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayAppts = appointments
        .filter((a) => {
            const created = a.created_at || ''
            return created.slice(0, 10) === todayStr
        })
        .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))

    const workloadPct = doctor?.workload_percent ?? 0
    const workloadColor = workloadPct >= 80 ? 'var(--danger)' : workloadPct >= 50 ? 'var(--warning)' : 'var(--success)'

    if (loading) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
                <p className="text-muted">Loading dashboard…</p>
            </div>
        )
    }

    return (
        <div className="page anim-fade-in">
            {/* Page Header */}
            <div className="dd-header">
                <div>
                    <h2>Doctor Dashboard</h2>
                    <p className="text-muted">Welcome back, Dr. {doctor?.name || storedUser.name}</p>
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>
                    Sign Out
                </button>
            </div>

            {/* Profile Card */}
            <div className="dd-profile card">
                <div className="dd-profile-grid">
                    <div className="dd-avatar">👨‍⚕️</div>
                    <div className="dd-profile-info">
                        <h3>{doctor?.name || 'Doctor'}</h3>
                        <p className="text-muted">{doctor?.department || ''}</p>
                    </div>
                    <div className="dd-stats-row">
                        <div className="dd-stat">
                            <span className="dd-stat-label">Doctor ID</span>
                            <span className="dd-stat-value" style={{ fontSize: '0.82rem' }}>{doctor?.id || '—'}</span>
                        </div>
                        <div className="dd-stat">
                            <span className="dd-stat-label">Daily Capacity</span>
                            <span className="dd-stat-value">{doctor?.daily_capacity ?? 0}</span>
                        </div>
                        <div className="dd-stat">
                            <span className="dd-stat-label">Current Patients</span>
                            <span className="dd-stat-value">{doctor?.current_appointments ?? 0}</span>
                        </div>
                        <div className="dd-stat">
                            <span className="dd-stat-label">Workload</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <div className="progress-track" style={{ width: 60 }}>
                                    <div className="progress-fill" style={{ width: `${Math.min(workloadPct, 100)}%`, background: workloadColor }} />
                                </div>
                                <span style={{ fontWeight: 600, color: workloadColor, fontSize: '0.85rem' }}>{workloadPct}%</span>
                            </div>
                        </div>
                        <div className="dd-stat">
                            <span className="dd-stat-label">Status</span>
                            <span className={`badge ${doctor?.is_available ? 'badge-available' : 'badge-overloaded'}`}>
                                {doctor?.is_available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="card dd-section">
                <div className="section-header">
                    <div className="section-icon">📅</div>
                    <div>
                        <h3 style={{ margin: 0 }}>Today's Schedule</h3>
                        <p className="text-muted" style={{ marginTop: 2 }}>
                            {todayAppts.length} appointment{todayAppts.length !== 1 ? 's' : ''} today
                        </p>
                    </div>
                </div>
                {todayAppts.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>
                        No appointments scheduled for today.
                    </p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Patient</th>
                                    <th>Symptoms</th>
                                    <th>Severity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayAppts.map((a) => (
                                    <tr key={a.id} className={a.emergency === 1 ? 'row-emergency' : ''}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                            {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{a.patient_name}</td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.symptoms}
                                        </td>
                                        <td>
                                            <span className={`badge ${a.severity_score >= 7 ? 'badge-red' : a.severity_score >= 4 ? 'badge-yellow' : 'badge-green'}`}>
                                                {a.severity_score}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${a.status === 'scheduled' ? 'badge-scheduled' : a.status === 'rescheduled' ? 'badge-near-capacity' : 'badge-normal'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* All Appointments */}
            <div className="card dd-section">
                <div className="section-header">
                    <div className="section-icon">📋</div>
                    <div>
                        <h3 style={{ margin: 0 }}>All Appointments</h3>
                        <p className="text-muted" style={{ marginTop: 2 }}>
                            {appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                {appointments.length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>
                        No appointments assigned yet.
                    </p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Symptoms</th>
                                    <th>Severity</th>
                                    <th>Emergency</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((a) => (
                                    <tr key={a.id} className={a.emergency === 1 ? 'row-emergency' : ''}>
                                        <td style={{ fontWeight: 500 }}>{a.patient_name}</td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.symptoms}
                                        </td>
                                        <td>
                                            <span className={`badge ${a.severity_score >= 7 ? 'badge-red' : a.severity_score >= 4 ? 'badge-yellow' : 'badge-green'}`}>
                                                {a.severity_score}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${a.emergency === 1 ? 'badge-emergency' : 'badge-normal'}`}>
                                                {a.emergency === 1 ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${a.status === 'scheduled' ? 'badge-scheduled' : a.status === 'rescheduled' ? 'badge-near-capacity' : 'badge-normal'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
