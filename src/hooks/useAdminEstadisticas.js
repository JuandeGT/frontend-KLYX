// ¿Por qué un hook y no un Proveedor + hook como en la referencia?
// Solo SeccionDashboard usa este hook — no hay estado que compartir entre componentes.
// Un Proveedor aquí sería una capa extra sin ningún beneficio. Ver useAdminCajas.js
// para la explicación completa del patrón y del prefijo "Admin".
//
// Hook de administración — estadísticas globales del dashboard.
import { useState } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminEstadisticas = () => {
	const { notificar } = useNotificacion();
	const [cargando, setCargando] = useState(false);

	// respuesta.data.data: Axios mete el cuerpo HTTP en .data, y Laravel lo envuelve
	// en { data: ... }, así que hay que hacer .data.data para llegar al contenido real.
	const getEstadisticas = async () => {
		setCargando(true);
		try {
			const respuesta = await api.get('/admin/estadisticas');
			return respuesta.data.data;
		} catch (error) {
			// error.response?.data?.message: con Axios los errores HTTP no son excepciones
			// normales — el mensaje del backend está en error.response.data.message
			notificar(error.response?.data?.message || 'Error al cargar estadísticas.', 'error');
			return null;
		} finally {
			setCargando(false);
		}
	};

	return { cargando, getEstadisticas };
};

export default useAdminEstadisticas;
