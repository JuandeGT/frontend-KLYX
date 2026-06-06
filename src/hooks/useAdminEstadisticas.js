// Este caso es lo mismo que con useAdminCajas
import { useState } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminEstadisticas = () => {
	const { notificar } = useNotificacion();
	const [cargando, setCargando] = useState(false);

	// respuesta.data.data: Axios guarda el cuerpo HTTP en .data y Laravel lo envuelve además en { data: ... } por eso hay que hacer .data.data
	const getEstadisticas = async () => {
		setCargando(true);
		try {
			const respuesta = await api.get('/admin/estadisticas');
			return respuesta.data.data;
		} catch (error) {
			// error.response?.data?.message porque con Axios los errores HTTP no son excepciones normales, el mensaje del backend está en error.response.data.message
			notificar(error.response?.data?.message || 'Error al cargar estadísticas.', 'error');
			return null;
		} finally {
			setCargando(false);
		}
	};

	return { cargando, getEstadisticas };
};

export default useAdminEstadisticas;
