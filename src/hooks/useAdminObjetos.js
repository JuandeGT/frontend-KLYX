// Este caso es lo mismo que con useAdminCajas
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminObjetos = () => {
	const { notificar } = useNotificacion();
	const [cargando, setCargando] = useState(false);

	// respuesta.data.data: Axios guarda el cuerpo HTTP en .data y Laravel lo envuelve además en { data: ... } por eso hay que hacer .data.data
	const ejecutar = useCallback(async (peticion) => {
		setCargando(true);
		try {
			const respuesta = await peticion();
			return respuesta.data.data;
		} catch (error) {
			// error.response?.data?.message porque con Axios los errores HTTP no son excepciones normales, el mensaje del backend está en error.response.data.message
			notificar(error.response?.data?.message || 'Error en la operación.', 'error');
			return null;
		} finally {
			setCargando(false);
		}
	}, []);

	const getObjetos = () => ejecutar(() => api.get('/objetos'));

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
