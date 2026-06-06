// De normal hacíamos Proveedor (guarda el estado) + hook (lo expone)
// Ese patrón se usa cuando varios componentes distintos necesitan compartir el mismo estado
// Si hiciéramos ProveedorAdminCajas sería añadir una capa extra sin ningún beneficio, el hook solo ya es suficiente: el componente lo llama, obtiene las funciones, y no usa en ningún otro lado

import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminCajas = () => {
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

	const getCajas = () => ejecutar(() => api.get('/cajas'));

	const crearCaja = async (datos) => {
		const respuesta = await ejecutar(() => api.post('/admin/cajas', datos));
		if (respuesta !== null) notificar('Caja creada correctamente.');
		return respuesta;
	};

	const actualizarCaja = async (id, datos) => {
		const respuesta = await ejecutar(() => api.put(`/admin/cajas/${id}`, datos));
		if (respuesta !== null) notificar('Caja actualizada correctamente.');
		return respuesta;
	};

	const eliminarCaja = async (id) => {
		const respuesta = await ejecutar(() => api.delete(`/admin/cajas/${id}`));
		if (respuesta !== null) notificar('Caja eliminada correctamente.');
		return respuesta;
	};

	const añadirObjetoACaja = async (cajaId, objetoId, probabilidad) => {
		const respuesta = await ejecutar(() =>
			api.post(`/admin/cajas/${cajaId}/objetos`, { objeto_id: objetoId, probabilidad }),
		);
		if (respuesta !== null) notificar('Objeto añadido a la caja.');
		return respuesta;
	};

	const quitarObjetoDeCaja = async (cajaId, objetoId) => {
		const respuesta = await ejecutar(() => api.delete(`/admin/cajas/${cajaId}/objetos/${objetoId}`));
		if (respuesta !== null) notificar('Objeto retirado de la caja.');
		return respuesta;
	};

	return {
		cargando,
		getCajas,
		crearCaja,
		actualizarCaja,
		eliminarCaja,
		añadirObjetoACaja,
		quitarObjetoDeCaja,
	};
};

export default useAdminCajas;
