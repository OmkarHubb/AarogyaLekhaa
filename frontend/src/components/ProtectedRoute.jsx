import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute
 * Checks localStorage for "adminToken" (JWT).
 * Redirects to /admin/login if not authenticated.
 */
export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('adminToken')
    return token ? children : <Navigate to="/admin/login" replace />
}
