import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import PasswordInput from '../components/PasswordInput'
import './AdminLogin.css'

export default function AdminLogin() {
    const [form, setForm] = useState({ username: '', password: '' })
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
        if (!form.username.trim() || !form.password.trim()) {
            setError('Please enter both username and password.')
            return
        }
        setLoading(true)
        try {
            const { data } = await api.post('/admin/login', form)
            localStorage.removeItem('doctorToken')  // clear stale doctor session
            localStorage.setItem('adminToken', data.token)
            localStorage.setItem('adminUser', JSON.stringify(data.user))
            navigate('/admin/dashboard', { replace: true })
        } catch (err) {
            setError(
                err.response?.status === 401
                    ? 'Invalid credentials'
                    : 'Something went wrong. Please try again.'
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
        <div className="admin-login-page">
            <div className="admin-login-card card anim-fade-in">
                {/* Header */}
                <div className="al-header">
                    <div className="al-icon">🛡️</div>
                    <h2>Admin Login</h2>
                    <p className="text-muted">Access the hospital coordination dashboard</p>
                </div>

                <div className="divider" />

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            className="form-control"
                            placeholder="admin"
                            value={form.username}
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
                                    placeholder="admin@hospital.com"
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

                <p className="al-hint">
                    🔒 Secured access &nbsp;·&nbsp; AarogyaLekha v3.0
                </p>
            </div>
        </div>
    )
}
