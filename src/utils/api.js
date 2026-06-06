// Para esto usamos Axios, una librería que hace ese trabajo más fácil que el fetch() nativo de JavaScript. La diferencia clave:
//   · fetch()  → los errores 404/422/500 NO se lanzan como excepciones (hay que comprobarlos a mano)
//   · Axios    → cualquier respuesta de error SÍ lanza una excepción, igual que haría una app real
//
// Flujo resumido:
//   1. El usuario hace login → el servidor devuelve un token (una "llave")
//   2. Guardamos ese token en localStorage
//   3. El interceptor (ver abajo) añade ese token automáticamente a cada petición
//   4. El servidor lee el token y sabe quién eres
import axios from 'axios';

// URL del backend desplegado en Render.
// Si en el futuro hay que cambiar el entorno, basta con tocar esta línea.
const BASE = 'https://klyx-backend-e63p.onrender.com';

// Instancia de Axios con la URL base + cabeceras por defecto para JSON
const api = axios.create({
	baseURL: `${BASE}/api`,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

// Interceptor de petición
// Un interceptor es una función que Axios ejecuta ANTES de enviar cada petición.
// Aquí leemos el token que guardó ProveedorSesion al hacer login, y lo añadimos al header Authorization para que el backend reconozca al usuario autenticado.
// Sin este interceptor, habría que añadir el header manualmente en cada llamada.
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('klyx_token');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

export default api;
