import StatsCard from '../components/StatsCard'
import DoctorTable from '../components/DoctorTable'
import AppointmentTable from '../components/AppointmentTable'

const STATS = [
    { icon: '🩺', label: 'Total Doctors', value: 6, accent: '#1E88E5' },
    { icon: '📅', label: 'Total Appointments', value: 6, accent: '#43A047' },
    { icon: '🚨', label: 'Emergency Cases', value: 3, accent: '#E53935' },
    { icon: '📊', label: 'Avg Workload %', value: '55%', accent: '#FB8C00' },
]

export default function AdminPage() {
    return (
        <div className="page anim-fade-in">
            {/* Page Header */}
            <div style={{ marginBottom: 32 }}>
                <h2>Admin Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
                    Hospital-wide overview — doctor workloads and appointment monitoring
                </p>
            </div>

            {/* Stats row */}
            <div className="stats-grid">
                {STATS.map((s) => (
                    <StatsCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} />
                ))}
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
                <DoctorTable />
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
                <AppointmentTable />
            </div>
        </div>
    )
}
