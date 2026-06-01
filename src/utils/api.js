// axios: librería HTTP para conectar con Laravel Sanctum API Tokens.
// No aparece en la referencia base (que usaba Supabase).
import axios from 'axios';

// VITE_API_URL contiene la URL BASE del backend SIN /api al final.
//   · En Vercel:  VITE_API_URL=https://klyx-backend-e63p.onrender.com
//   · En local:   VITE_API_URL=https://klyx-backend-e63p.onrender.com  (mismo backend)
// El código añade /api automáticamente para que el env var sea siempre solo el dominio.
const BASE = (import.meta.env.VITE_API_URL ?? 'https://klyx-backend-e63p.onrender.com')
	.replace(/\/$/, ''); // elimina barra final si la hubiera

const api = axios.create({
	baseURL: `${BASE}/api`,
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
