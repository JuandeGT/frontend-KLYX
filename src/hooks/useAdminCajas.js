// ¿Por qué un hook y no un Proveedor + hook como en la referencia?
// ─────────────────────────────────────────────────────────────────
// En la referencia el patrón era: Proveedor (guarda el estado) + hook (lo expone).
// Ese patrón se usa cuando VARIOS componentes distintos necesitan compartir el mismo estado.
// Por ejemplo, si el carrito de la tienda tiene que verse en la cabecera Y en la página
// de pago al mismo tiempo, necesitas un Proveedor en medio que guarde ese estado compartido.
//
// En el panel de administración cada sección la usa UN SOLO componente:
//   SeccionCajas  →  useAdminCajas   (nadie más lo necesita)
//   SeccionObjetos →  useAdminObjetos  (nadie más lo necesita)
//   etc.
//
// Si hiciéramos ProveedorAdminCajas sería añadir una capa extra sin ningún beneficio.
// El hook solo ya es suficiente: el componente lo llama, obtiene las funciones, y listo.
//
// ¿Por qué se llama useAdminCajas y no useCajas?
// Porque llama a rutas /api/admin/cajas que el backend solo permite a administradores.
// Un posible useCajas (sin "Admin") sería para usuarios normales viendo el catálogo.
// El prefijo "Admin" deja claro desde el nombre quién puede usarlo.
//
// Hook de administración — gestión de cajas y sus objetos.
import { useState, useCallback } from 'react';
import api from '../utils/api.js';
import useNotificacion from './useNotificacion.js';

const useAdminCajas = () => {
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

	const getCajas = () =>
		ejecutar(() => api.get('/cajas'));

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
		const respuesta = await ejecutar(() => api.post(`/admin/cajas/${cajaId}/objetos`, { objeto_id: objetoId, probabilidad }));
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
