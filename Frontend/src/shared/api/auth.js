import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL

const createApi = (port) => {
    const instance = axios.create({
        baseURL: `${BASE}:${port}/api/v1`,
        headers: { 'Content-Type': 'application/json' },
    })

    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    })

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
            return Promise.reject(error)
        }
    )

    return instance
}

export const authApi         = createApi(3001)
export const usersApi        = createApi(3002)
export const accountsApi     = createApi(3003)
export const transactionsApi = createApi(3004)
export const financeApi      = createApi(3005)
export const productsApi     = createApi(3006)

// Instancia por defecto (retro-compatibilidad)
const api = authApi
export default api