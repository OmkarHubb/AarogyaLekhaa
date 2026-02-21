import { Navigate } from 'react-router-dom'

/**
 * ProtectedDoctorRoute
 * Checks localStorage for "doctorToken".
 * Redirects to /doctor if not authenticated.
 */
export default function ProtectedDoctorRoute({ children }) {
    const token = localStorage.getItem('doctorToken')
    return token ? children : <Navigate to="/doctor" replace />
}
