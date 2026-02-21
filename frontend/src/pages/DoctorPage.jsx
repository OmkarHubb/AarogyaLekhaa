import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import PasswordInput from '../components/PasswordInput'
import './DoctorPage.css'

export default function DoctorPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showReset, setShowReset] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetMsg, setResetMsg] = useState({ text: '', type: '' })
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email.trim() || !form.password.trim()) {
            setError('Please enter both email and password.')
            return
        }
        setLoading(true)
        try {
            const { data } = await api.post('/doctor/login', form)
            localStorage.removeItem('adminToken')  // clear stale admin session
            localStorage.setItem('doctorToken', data.token)
            localStorage.setItem('doctorUser', JSON.stringify(data.user))
            navigate('/doctor/dashboard', { replace: true })
        } catch (err) {
            setError(
                err.response?.status === 401
                    ? 'Invalid email or password'
                    : err.response?.data?.detail || 'Something went wrong. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleReset = async (e) => {
        e.preventDefault()
        if (!resetEmail.trim()) {
            setResetMsg({ text: 'Please enter your email.', type: 'error' })
            return
        }
        try {
            const { data } = await api.post('/auth/reset-password', { email: resetEmail })
            setResetMsg({ text: data.message, type: 'success' })
        } catch (err) {
            setResetMsg({
                text: err.response?.data?.detail || 'Failed to reset password.',
                type: 'error',
            })
        }
    }

    return (
        <div className="doctor-page">
            <div className="login-card card anim-fade-in">
                {/* Header */}
                <div className="login-header">
                    <div className="login-icon">👨‍⚕️</div>
                    <h2>Doctor Login</h2>
                    <p className="text-muted">Sign in to access your appointment queue</p>
                </div>

                <div className="divider" />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            placeholder="doctor@hospital.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="al-error">⚠ {error}</div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
                        style={{ justifyContent: 'center', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>

                {/* Forgot Password */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => { setShowReset(!showReset); setResetMsg({ text: '', type: '' }) }}
                    >
                        Forgot Password?
                    </button>
                </div>

                {showReset && (
                    <div className="reset-section anim-fade-in">
                        <form onSubmit={handleReset}>
                            <div className="form-group">
                                <label htmlFor="resetEmail">Registered Email</label>
                                <input
                                    id="resetEmail"
                                    type="email"
                                    className="form-control"
                                    placeholder="your@email.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>
                            {resetMsg.text && (
                                <div className={`reset-msg ${resetMsg.type}`}>
                                    {resetMsg.type === 'success' ? '✅' : '⚠'} {resetMsg.text}
                                </div>
                            )}
                            <button type="submit" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
                                Send Temporary Password
                            </button>
                        </form>
                    </div>
                )}

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    🔒 Secure login — credentials are encrypted in transit
                </p>
            </div>
        </div>
    )
}
