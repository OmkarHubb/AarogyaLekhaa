export default function ReportPanel({ report }) {
    if (!report) return null

    const isEmergency = report.emergency === 1
    const isRejected = report.status === 'rejected'

    const severityScore = report.severity_score ?? 0
    const severityColor = severityScore >= 8
        ? 'var(--danger)'
        : severityScore >= 5
            ? 'var(--warning)'
            : 'var(--success)'

    return (
        <div className="report-panel anim-slide-right" style={{
            background: isEmergency ? 'var(--danger-light)' : 'var(--bg-card)',
            border: `1.5px solid ${isEmergency ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-md)',
        }}>
            {isRejected ? (
                <>
                    <div style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: 12 }}>❌</div>
                    <h3 style={{ textAlign: 'center', color: 'var(--danger)', marginBottom: 8 }}>
                        No Doctor Available
                    </h3>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {report.reason}
                    </p>
                </>
            ) : (
                <>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ margin: 0 }}>Appointment Report</h3>
                        <span className={`badge ${isEmergency ? 'badge-emergency' : 'badge-normal'}`}>
                            {isEmergency ? '🚨 EMERGENCY' : '✅ ROUTINE'}
                        </span>
                    </div>

                    {/* Severity */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                Severity Score
                            </span>
                            <span style={{ fontWeight: 700, color: severityColor }}>
                                {severityScore} / 10
                            </span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(severityScore / 10) * 100}%`,
                                    background: severityColor,
                                }}
                            />
                        </div>
                    </div>

                    {/* Details grid */}
                    <div style={{ display: 'grid', gap: 14 }}>
                        <ReportRow icon="👤" label="Patient" value={report.patient_name} />
                        <ReportRow icon="🏥" label="Department" value={report.department} />
                        <ReportRow icon="🩺" label="Assigned Doctor" value={report.assigned_doctor_name} />
                        <ReportRow icon="⏱" label="Predicted Wait" value={`${report.predicted_wait_minutes} minutes`} />
                        <ReportRow icon="📊" label="Doctor Workload" value={`${report.workload_percent}%`} />
                        {report.bed_type && (
                            <ReportRow icon="🛏️" label="Bed Allocated" value={report.bed_type} />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</span>
                            <span className="badge badge-scheduled">✦ Scheduled</span>
                        </div>
                    </div>

                    {/* Created at */}
                    {report.created_at && (
                        <p style={{ marginTop: 16, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            {new Date(report.created_at).toLocaleString()}
                        </p>
                    )}
                </>
            )}
        </div>
    )
}

function ReportRow({ icon, label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {icon} {label}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {value}
            </span>
        </div>
    )
}
