import { useState, useRef } from 'react'
import AppointmentForm from '../components/AppointmentForm'
import ReportPanel from '../components/ReportPanel'
import './PatientPage.css'

export default function PatientPage() {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const formRef = useRef(null)

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="patient-page">
            {/* ── Hero ── */}
            <div className="patient-hero anim-fade-in">
                <div className="hero-badge-blue">Patient Portal</div>
                <h1>AarogyaLekha</h1>
                <p>Smart triage and instant doctor assignment — describe your symptoms and let our system do the rest.</p>
                <button className="btn btn-primary btn-lg" onClick={scrollToForm}>
                    📋 Book Appointment
                </button>
            </div>

            {/* ── Form + Report split ── */}
            <div ref={formRef} className={`patient-content ${report ? 'has-report' : ''}`}>
                {/* Form card */}
                <div className="form-card card anim-fade-in">
                    <div className="section-header">
                        <div className="section-icon">📝</div>
                        <div>
                            <h3 style={{ margin: 0 }}>Book an Appointment</h3>
                            <p className="text-muted" style={{ marginTop: 2 }}>Fill in your details below</p>
                        </div>
                    </div>
                    <div className="divider" />
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner" />
                            <p>Finding the best doctor for you…</p>
                        </div>
                    ) : (
                        <AppointmentForm onReport={setReport} onLoading={setLoading} />
                    )}
                </div>

                {/* Report panel */}
                {report && (
                    <div className="report-slot">
                        <ReportPanel report={report} />
                    </div>
                )}
            </div>
        </div>
    )
}
