// ¿Por qué un hook y no un Proveedor + hook como en la referencia?
// Solo SeccionUsuarios usa este hook — no hay estado que compartir entre componentes.
// Un Proveedor aquí sería una capa extra sin ningún beneficio. Ver useAdminCajas.js
// para la explicación completa del patrón y del prefijo "Admin".
//
// Hook de administración — gestión de usuarios.
// useCallback: memoriza ejecutar para que su referencia no cambie entre renders,
// evitando el bucle infinito que provocaría si se usara en un array de dependencias de useEffect.
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminUsuarios = () => {
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

	const getUsuarios = (page = 1) =>
		ejecutar(() => api.get(`/admin/usuarios?page=${page}`));

	const getUsuario = (id) =>
		ejecutar(() => api.get(`/admin/usuarios/${id}`));

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

	const getHistorialCajasUsuario = (id) =>
		ejecutar(() => api.get(`/admin/usuarios/${id}/cajas`));

	const getHistorialTransaccionesUsuario = (id) =>
		ejecutar(() => api.get(`/admin/usuarios/${id}/transacciones`));

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
