import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedDoctorRoute from './components/ProtectedDoctorRoute'
import LandingPage from './pages/LandingPage'
import PatientPage from './pages/PatientPage'
import DoctorPage from './pages/DoctorPage'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/patient" element={<PatientPage />} />
                <Route path="/doctor" element={<DoctorPage />} />

                {/* Protected doctor dashboard */}
                <Route
                    path="/doctor/dashboard"
                    element={
                        <ProtectedDoctorRoute>
                            <DoctorDashboard />
                        </ProtectedDoctorRoute>
                    }
                />

                {/* Admin auth */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected admin dashboard */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* /admin redirect → login */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
