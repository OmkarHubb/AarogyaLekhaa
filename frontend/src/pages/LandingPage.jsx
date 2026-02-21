import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const ROLES = [
    {
        icon: '🧑‍⚕️',
        title: 'Patient Portal',
        desc: 'Book appointments, describe symptoms and get instant triage and doctor assignment.',
        path: '/patient',
        accent: '#1E88E5',
    },
    {
        icon: '👨‍⚕️',
        title: 'Doctor Login',
        desc: 'Secure login for doctors to view their upcoming appointments and patient queue.',
        path: '/doctor',
        accent: '#43A047',
    },
    {
        icon: '🛡️',
        title: 'Admin Dashboard',
        desc: 'Monitor doctor workloads, live appointments, and hospital-wide stats at a glance.',
        path: '/admin',
        accent: '#8E24AA',
    },
]

export default function LandingPage() {
    const navigate = useNavigate()
    return (
        <div className="landing-page">
            <div className="landing-hero anim-fade-in">
                <div className="hero-badge">Hospital Coordination System</div>
                <h1 className="hero-title">
                    Welcome to <span className="hero-highlight">AarogyaLekha</span>
                </h1>
                <p className="hero-sub">
                    AI-assisted triage and intelligent doctor allocation — designed for clarity, speed, and care.
                </p>
            </div>

            <div className="role-grid anim-fade-in">
                {ROLES.map((role) => (
                    <button
                        key={role.path}
                        className="role-card"
                        style={{ borderTop: `4px solid ${role.accent}` }}
                        onClick={() => navigate(role.path)}
                    >
                        <div className="role-icon" style={{ background: `${role.accent}18`, color: role.accent }}>
                            {role.icon}
                        </div>
                        <h3 className="role-title">{role.title}</h3>
                        <p className="role-desc">{role.desc}</p>
                        <span className="role-cta" style={{ color: role.accent }}>
                            Enter Portal →
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
