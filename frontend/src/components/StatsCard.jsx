export default function StatsCard({ icon, label, value, accent = '#1E88E5' }) {
    return (
        <div className="card card-sm stats-card" style={{ borderTop: `3px solid ${accent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: 44, height: 44,
                    background: `${accent}18`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'grid', placeItems: 'center',
                    fontSize: '1.3rem',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {value}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                        {label}
                    </div>
                </div>
            </div>
        </div>
    )
}
