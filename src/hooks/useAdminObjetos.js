// ¿Por qué un hook y no un Proveedor + hook como en la referencia?
// Solo SeccionObjetos usa este hook — no hay estado que compartir entre componentes.
// Un Proveedor aquí sería una capa extra sin ningún beneficio. Ver useAdminCajas.js
// para la explicación completa del patrón y del prefijo "Admin".
//
// Hook de administración — gestión de objetos y oferta semanal.
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminObjetos = () => {
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

	const getObjetos = () =>
		ejecutar(() => api.get('/objetos'));

	const crearObjeto = async (datos) => {
		const respuesta = await ejecutar(() => api.post('/admin/objetos', datos));
		if (respuesta !== null) notificar('Objeto creado correctamente.');
		return respuesta;
	};

	const actualizarObjeto = async (id, datos) => {
		const respuesta = await ejecutar(() => api.put(`/admin/objetos/${id}`, datos));
		if (respuesta !== null) notificar('Objeto actualizado correctamente.');
		return respuesta;
	};

	const eliminarObjeto = async (id) => {
		const respuesta = await ejecutar(() => api.delete(`/admin/objetos/${id}`));
		if (respuesta !== null) notificar('Objeto eliminado correctamente.');
		return respuesta;
	};

	// Toggle de oferta semanal — PUT /api/admin/objetos/{id}/oferta
	// El backend activa si estaba desactivado y viceversa. Devuelve el objeto actualizado.
	// Si ya hay 3 activos devuelve 422 y se notifica el error automáticamente.
	const toggleOferta = async (id) => {
		setCargando(true);
		try {
			const respuesta = await api.put(`/admin/objetos/${id}/oferta`);
			notificar(respuesta.data.message);
			return respuesta.data.data;
		} catch (error) {
			notificar(error.response?.data?.message || 'Error al cambiar la oferta.', 'error');
			return null;
		} finally {
			setCargando(false);
		}
	};

	return {
		cargando,
		getObjetos,
		crearObjeto,
		actualizarObjeto,
		eliminarObjeto,
		toggleOferta,
	};
};

export default useAdminObjetos;
