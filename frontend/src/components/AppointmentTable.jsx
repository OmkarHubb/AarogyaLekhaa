import { useState, useEffect } from 'react'
import api from '../api'

/** Binary emergency badge — red pill or green pill, no numeric score */
function EmergencyBadge({ emergency }) {
    const style = {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '20px',
        fontWeight: 700,
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#fff',
        background: emergency === 1 ? 'var(--danger)' : 'var(--success)',
    }
    return (
        <span style={style}>
            {emergency === 1 ? '🔴 Emergency' : '🟢 Normal'}
        </span>
    )
}

function StatusBadge({ status }) {
    const cls =
        status === 'Completed' ? 'badge badge-normal' :
            status === 'In Progress' ? 'badge badge-yellow' :
                'badge badge-scheduled'
    return <span className={cls}>{status}</span>
}

export default function AppointmentTable() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/appointments')
            .then(({ data }) => setAppointments(data))
            .catch(() => setError('Failed to load appointments.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading appointments…</div>
    if (error) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
    if (appointments.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No appointments yet.</div>

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Emergency</th>
                        <th>Wait Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((apt, i) => (
                        <tr key={apt.id || i} className={apt.emergency === 1 ? 'row-emergency' : ''}>
                            <td style={{ fontWeight: 500 }}>{apt.patient_name}</td>
                            <td>{apt.assigned_doctor_name || '—'}</td>
                            <td><EmergencyBadge emergency={apt.emergency} /></td>
                            <td>{apt.predicted_wait_minutes} min</td>
                            <td><StatusBadge status={apt.status || 'Scheduled'} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
