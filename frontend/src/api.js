import axios from 'axios'

/*
  Base URL priority:

  1. Vercel / Netlify production → VITE_API_URL
  2. Local development fallback → http://localhost:8000
*/

const baseURL =
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000'

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// -----------------------------
// Attach JWT token (if present)
// -----------------------------
api.interceptors.request.use((config) => {

    const url = config.url || ''
    let token = null

    // Route-based token selection
    if (url.startsWith('/admin')) {
        token = localStorage.getItem('adminToken')
    } else if (url.startsWith('/doctor')) {
        token = localStorage.getItem('doctorToken')
    } else {
        token =
            localStorage.getItem('adminToken') ||
            localStorage.getItem('doctorToken')
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default api
