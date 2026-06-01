// Hook de administración — encapsula todas las llamadas al grupo de rutas /api/admin/*
// Solo accesible para usuarios con rol Admin (verificado también en el backend).
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdmin = () => {
	const { notificar } = useNotificacion();

	// ─── Estado de carga compartido ─────────────────────────────────────────
	const [cargando, setCargando] = useState(false);

	// ─── Helper interno: ejecuta una llamada y notifica errores ─────────────
	const ejecutar = useCallback(async (fn) => {
		setCargando(true);
		try {
			const res = await fn();
			return res.data.data;
		} catch (error) {
			const msg = error.response?.data?.message || 'Error en la operación.';
			notificar(msg, 'error');
			return null;
		} finally {
			setCargando(false);
		}
	}, []);

	// ════════════════════════════════════════════════════════════════════════
	// USUARIOS
	// ════════════════════════════════════════════════════════════════════════

	const getUsuarios = (page = 1) =>
		ejecutar(() => api.get(`/admin/usuarios?page=${page}`));

	const getUsuario = (id) =>
		ejecutar(() => api.get(`/admin/usuarios/${id}`));

	const actualizarUsuario = async (id, datos) => {
		const res = await ejecutar(() => api.put(`/admin/usuarios/${id}`, datos));
		if (res !== null) notificar('Usuario actualizado correctamente.');
		return res;
	};

	const eliminarUsuario = async (id) => {
		const res = await ejecutar(() => api.delete(`/admin/usuarios/${id}`));
		if (res !== null) notificar('Usuario eliminado de la plataforma.');
		return res;
	};

	const getHistorialCajasUsuario = (id) =>
		ejecutar(() => api.get(`/admin/usuarios/${id}/cajas`));

	const getHistorialTransaccionesUsuario = (id) =>
		ejecutar(() => api.get(`/admin/usuarios/${id}/transacciones`));

	// ════════════════════════════════════════════════════════════════════════
	// OBJETOS
	// ════════════════════════════════════════════════════════════════════════

	const getObjetos = () =>
		ejecutar(() => api.get('/objetos'));

	const crearObjeto = async (datos) => {
		const res = await ejecutar(() => api.post('/admin/objetos', datos));
		if (res !== null) notificar('Objeto creado correctamente.');
		return res;
	};

	const actualizarObjeto = async (id, datos) => {
		const res = await ejecutar(() => api.put(`/admin/objetos/${id}`, datos));
		if (res !== null) notificar('Objeto actualizado correctamente.');
		return res;
	};

	const eliminarObjeto = async (id) => {
		const res = await ejecutar(() => api.delete(`/admin/objetos/${id}`));
		if (res !== null) notificar('Objeto eliminado correctamente.');
		return res;
	};

	// ════════════════════════════════════════════════════════════════════════
	// CAJAS
	// ════════════════════════════════════════════════════════════════════════

	const getCajas = () =>
		ejecutar(() => api.get('/cajas'));

	const crearCaja = async (datos) => {
		const res = await ejecutar(() => api.post('/admin/cajas', datos));
		if (res !== null) notificar('Caja creada correctamente.');
		return res;
	};

	const actualizarCaja = async (id, datos) => {
		const res = await ejecutar(() => api.put(`/admin/cajas/${id}`, datos));
		if (res !== null) notificar('Caja actualizada correctamente.');
		return res;
	};

	const eliminarCaja = async (id) => {
		const res = await ejecutar(() => api.delete(`/admin/cajas/${id}`));
		if (res !== null) notificar('Caja eliminada correctamente.');
		return res;
	};

	const añadirObjetoACaja = async (cajaId, objetoId, probabilidad) => {
		const res = await ejecutar(() =>
			api.post(`/admin/cajas/${cajaId}/objetos`, { objeto_id: objetoId, probabilidad })
		);
		if (res !== null) notificar('Objeto añadido a la caja.');
		return res;
	};

	const quitarObjetoDeCaja = async (cajaId, objetoId) => {
		const res = await ejecutar(() =>
			api.delete(`/admin/cajas/${cajaId}/objetos/${objetoId}`)
		);
		if (res !== null) notificar('Objeto retirado de la caja.');
		return res;
	};

	return {
		cargando,
		// Usuarios
		getUsuarios, getUsuario, actualizarUsuario, eliminarUsuario,
		getHistorialCajasUsuario, getHistorialTransaccionesUsuario,
		// Objetos
		getObjetos, crearObjeto, actualizarObjeto, eliminarObjeto,
		// Cajas
		getCajas, crearCaja, actualizarCaja, eliminarCaja,
		añadirObjetoACaja, quitarObjetoDeCaja,
	};
};

export default useAdmin;
