// Este caso es lo mismo que con useAdminCajas
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminUsuarios = () => {
	const { notificar } = useNotificacion();
	const [cargando, setCargando] = useState(false);

	// respuesta.data.data: Axios guarda el cuerpo HTTP en .data y Laravel lo envuelve además en { data: ... } por eso hay que hacer .data.data
	// useCallback: memoriza la función para que su referencia no cambie entre renders, evitando el bucle infinito del useEffect
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

	const getUsuarios = (page = 1) => ejecutar(() => api.get(`/admin/usuarios?page=${page}`));

	const getUsuario = (id) => ejecutar(() => api.get(`/admin/usuarios/${id}`));

	const actualizarUsuario = async (id, datos) => {
		const respuesta = await ejecutar(() => api.put(`/admin/usuarios/${id}`, datos));
		if (respuesta !== null) notificar('Usuario actualizado correctamente.');
		return respuesta;
	};

	const eliminarUsuario = async (id) => {
		const respuesta = await ejecutar(() => api.delete(`/admin/usuarios/${id}`));
		if (respuesta !== null) notificar('Usuario eliminado de la plataforma.');
		return respuesta;
	};

	const getHistorialCajasUsuario = (id) => ejecutar(() => api.get(`/admin/usuarios/${id}/cajas`));

	const getHistorialTransaccionesUsuario = (id) => ejecutar(() => api.get(`/admin/usuarios/${id}/transacciones`));

	return {
		cargando,
		getUsuarios,
		getUsuario,
		actualizarUsuario,
		eliminarUsuario,
		getHistorialCajasUsuario,
		getHistorialTransaccionesUsuario,
	};
};

export default useAdminUsuarios;
