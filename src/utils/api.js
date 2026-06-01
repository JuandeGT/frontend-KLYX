// axios: librería HTTP para conectar con Laravel Sanctum API Tokens.
// No aparece en la referencia base (que usaba Supabase).
import axios from 'axios';

// VITE_API_URL es una variable de entorno de Vite (import.meta.env).
// En local usa http://localhost:8000/api (definida en .env.local).
// En producción (Render) usa la URL del backend desplegado.
// Las variables de Vite DEBEN empezar por VITE_ para estar disponibles en el cliente.
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	},
});

// ——— INTERCEPTOR DE PETICIÓN ———
// Inyecta el token Bearer en cada petición automáticamente.
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('klyx_token');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

export default api;
