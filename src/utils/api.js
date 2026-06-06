// ─────────────────────────────────────────────────────────────────────────────
// api.js — Cliente HTTP preconfigurado para el backend Laravel de KLYX
//
// ⚠️ DIFERENCIA con la referencia del profesor
// ─────────────────────────────────────────────
// La referencia usaba Supabase, que es una base de datos en la nube con
// autenticación incluida. Cuando hacías login con Supabase, él solo guardaba
// tu sesión y añadía tu identidad a cada petición automáticamente.
//
// KLYX tiene su propio servidor (Laravel). Eso significa que nosotros
// tenemos que hablar con ese servidor de forma manual:
//   - Enviar las peticiones a la URL correcta
//   - Decirle quién somos en cada petición (con un token)
//   - Manejar los errores que devuelve
//
// Para esto usamos Axios — una librería que hace ese trabajo más fácil que
// el fetch() nativo de JavaScript. La diferencia clave:
//   · fetch()  → los errores 404/422/500 NO se lanzan como excepciones (hay que comprobarlos a mano)
//   · Axios    → cualquier respuesta de error SÍ lanza una excepción, igual que haría una app real
//
// Este archivo crea UNA sola instancia configurada de Axios (como el supabase.js
// de la referencia) que todo el proyecto importa para hacer peticiones.
//
// Flujo resumido:
//   1. El usuario hace login → el servidor devuelve un token (una "llave")
//   2. Guardamos ese token en localStorage
//   3. El interceptor (ver abajo) añade ese token automáticamente a cada petición
//   4. El servidor lee el token y sabe quién eres
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios';

// La URL base viene de la variable de entorno VITE_API_URL (definida en .env).
// Si no existe, usa el backend desplegado en Render como fallback.
// Si VITE_API_URL vale "https://mi-backend.com/" (con barra al final),
// al hacer `${BASE}/api` quedaría "https://mi-backend.com//api" (doble barra).
// El .replace quita esa barra final para que la URL siempre quede limpia.
const BASE = (import.meta.env.VITE_API_URL ?? 'https://klyx-backend-e63p.onrender.com')
	.replace(/\/$/, '');

// Instancia de Axios con la URL base + cabeceras por defecto para JSON
const api = axios.create({
	baseURL: `${BASE}/api`,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

// ─── Interceptor de petición ──────────────────────────────────────────────────
// Un interceptor es una función que Axios ejecuta ANTES de enviar cada petición.
// Aquí leemos el token que guardó ProveedorSesion al hacer login, y lo añadimos
// al header Authorization para que el backend reconozca al usuario autenticado.
// Sin este interceptor, habría que añadir el header manualmente en cada llamada.
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('klyx_token');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

export default api;
