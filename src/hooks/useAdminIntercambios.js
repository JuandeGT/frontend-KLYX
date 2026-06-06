// ¿Por qué un hook y no un Proveedor + hook como en la referencia?
// Solo SeccionIntercambiosAdmin usa este hook — no hay estado que compartir.
// Un Proveedor aquí sería una capa extra sin ningún beneficio. Ver useAdminCajas.js
// para la explicación completa del patrón y del prefijo "Admin".
//
// Hook de administración — vista de todos los intercambios de la plataforma.
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminIntercambios = () => {
	const { notificar } = useNotificacion();
	const [cargando, setCargando] = useState(false);

	// Ejecuta una petición a la API, gestiona cargando y notifica si hay error.
	// respuesta.data.data: Axios mete el cuerpo HTTP en .data, y Laravel lo envuelve
	// en { data: ... }, así que hay que hacer .data.data para llegar al contenido real.
	const ejecutar = useCallback(async (peticion) => {
		setCargando(true);
		try {
			const respuesta = await peticion();
			return respuesta.data.data;
		} catch (error) {
			// error.response?.data?.message: con Axios los errores HTTP (422, 403…)
			// no son excepciones normales — el mensaje del backend está en error.response.data.message
			notificar(error.response?.data?.message || 'Error en la operación.', 'error');
			return null;
		} finally {
			setCargando(false);
		}
	}, []);

	// estado: '' | 'pendiente' | 'aceptado' | 'rechazado' | 'cancelado'
	const getIntercambiosAdmin = (page = 1, estado = '') =>
		ejecutar(() => api.get(`/admin/intercambios?page=${page}${estado ? `&estado=${estado}` : ''}`));

	return { cargando, getIntercambiosAdmin };
};

export default useAdminIntercambios;
