import axios from 'axios'

// Use environment variable for base URL if provided (Netlify production), otherwise fallback to local proxy path
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
    const url = config.url || ''
    let token = null

    // Use the correct token based on the request path
    if (url.startsWith('/admin')) {
        token = localStorage.getItem('adminToken')
    } else if (url.startsWith('/doctor')) {
        token = localStorage.getItem('doctorToken')
    } else {
        // Fallback: try admin first, then doctor
        token = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken')
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
