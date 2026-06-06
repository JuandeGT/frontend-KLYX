// Este caso es lo mismo que con useAdminCajas
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminIntercambios = () => {
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

	const getIntercambiosAdmin = (page = 1, estado = '') =>
		ejecutar(() => api.get(`/admin/intercambios?page=${page}${estado ? `&estado=${estado}` : ''}`));

	return { cargando, getIntercambiosAdmin };
};

export default useAdminIntercambios;
