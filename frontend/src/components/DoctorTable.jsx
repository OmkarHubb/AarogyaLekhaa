import { useState, useEffect } from 'react'
import api from '../api'

function workloadClass(pct) {
    if (pct >= 80) return 'badge badge-red'
    if (pct >= 50) return 'badge badge-yellow'
    return 'badge badge-green'
}

function statusBadge(pct, isAvailable) {
    if (!isAvailable) return { cls: 'badge badge-overloaded', label: 'Unavailable' }
    if (pct >= 100) return { cls: 'badge badge-overloaded', label: 'Overloaded' }
    if (pct >= 80) return { cls: 'badge badge-near-capacity', label: 'Near Capacity' }
    return { cls: 'badge badge-available', label: 'Available' }
}

export default function DoctorTable() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/doctors')
            .then(({ data }) => setDoctors(data))
            .catch(() => setError('Failed to load doctors.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading doctors…</div>
    if (error) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
    if (doctors.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No doctors found.</div>

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Capacity</th>
                        <th>Current</th>
                        <th>Workload %</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map((doc) => {
                        const pct = Math.round(doc.workload_percent)
                        const { cls, label } = statusBadge(pct, doc.is_available)
                        return (
                            <tr key={doc.id}>
                                <td style={{ fontWeight: 500 }}>{doc.name}</td>
                                <td>{doc.department}</td>
                                <td>{doc.daily_capacity}</td>
                                <td>{doc.current_appointments}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="progress-track" style={{ width: 80 }}>
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${Math.min(pct, 100)}%`,
                                                    background: pct >= 80 ? 'var(--danger)' : pct >= 50 ? 'var(--warning)' : 'var(--success)',
                                                }}
                                            />
                                        </div>
                                        <span className={workloadClass(pct)} style={{ minWidth: 46 }}>{pct}%</span>
                                    </div>
                                </td>
                                <td><span className={cls}>{label}</span></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
