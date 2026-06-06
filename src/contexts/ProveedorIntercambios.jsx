// ¿Por qué aquí SÍ hay un Proveedor y en los hooks de admin no?
// ─────────────────────────────────────────────────────────────────
// En la referencia el patrón era: Proveedor (guarda el estado) + hook (lo expone).
// Ese patrón tiene sentido cuando el MISMO estado lo necesitan VARIOS componentes
// que no son padre e hijo directo.
//
// Los intercambios los usan:
//   - Intercambios.jsx     → muestra el mercado y mis ofertas
//   - CrearIntercambio.jsx → publica una nueva oferta y recarga el mercado
//   - TarjetaOferta.jsx    → acepta, rechaza o cancela una oferta y recarga
//
// Sin el Proveedor, cada uno haría su propia petición al servidor y el estado
// estaría desincronizado (uno puede mostrar datos viejos mientras otro ya recargó).
// El Proveedor guarda UN SOLO estado compartido y cualquiera puede llamar a
// cargarIntercambios() para que todos vean los datos frescos a la vez.
//
// Los hooks de admin (useAdminCajas etc.) no necesitan esto porque cada sección
// del panel admin la usa UN único componente — no hay nada que compartir.
//
// ⚠️ useCallback: memorizamos la función cargarIntercambios para que su referencia
// no cambie en cada render. Sin esto, incluirla en el array de dependencias de
// useEffect provocaría un bucle infinito (el efecto llama a la función, la función
// se recrea, el efecto vuelve a ejecutarse...). No aparece en la referencia base.
import React, { createContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api.js';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';

const contextoIntercambios = createContext();

const ProveedorIntercambios = ({ children }) => {
	const { sesionIniciada } = useSesion();
	const { notificar } = useNotificacion();

	const [mercado, setMercado] = useState([]);
	const [misOfertas, setMisOfertas] = useState([]);
	const [cargando, setCargando] = useState(false);

	// Carga el mercado público y mis ofertas enviadas.
	// Promise.all lanza ambas peticiones al mismo tiempo en vez de una tras otra,
	// reduciendo el tiempo de carga a la duración de la más lenta (no la suma de las dos).
	// No aparece en la referencia base pero es JS estándar.
	const cargarIntercambios = useCallback(async () => {
		if (!sesionIniciada) return;
		setCargando(true);
		try {
			const [respuestaMercado, respuestaMias] = await Promise.all([
				api.get('/intercambios'),
				api.get('/mis-intercambios'),
			]);
			setMercado(respuestaMercado.data.data);
			setMisOfertas(respuestaMias.data.data);
		} catch {
			notificar('No se pudo cargar el mercado de intercambios.', 'error');
		} finally {
			setCargando(false);
		}
	}, [sesionIniciada]);

	// Crea una nueva oferta de intercambio
	const crearIntercambio = async (datos) => {
		try {
			await api.post('/intercambios', datos);
			notificar('¡Oferta publicada en el mercado!');
			await cargarIntercambios();
			return true;
		} catch (error) {
			notificar(error.response?.data?.message || 'Error al crear la oferta.', 'error');
			return false;
		}
	};

	// Acepta una oferta del mercado
	const aceptarIntercambio = async (id) => {
		try {
			await api.put(`/intercambios/${id}/aceptar`);
			notificar('¡Intercambio completado con éxito!');
			await cargarIntercambios();
		} catch (error) {
			notificar(error.response?.data?.message || 'No se pudo completar el intercambio.', 'error');
		}
	};

	// Rechaza una oferta directa recibida
	const rechazarIntercambio = async (id) => {
		try {
			await api.put(`/intercambios/${id}/rechazar`);
			notificar('Oferta rechazada.');
			await cargarIntercambios();
		} catch (error) {
			notificar(error.response?.data?.message || 'No se pudo rechazar la oferta.', 'error');
		}
	};

	// Cancela una oferta propia pendiente
	const cancelarIntercambio = async (id) => {
		try {
			await api.delete(`/intercambios/${id}`);
			notificar('Oferta cancelada.');
			await cargarIntercambios();
		} catch (error) {
			notificar(error.response?.data?.message || 'No se pudo cancelar la oferta.', 'error');
		}
	};

	useEffect(() => {
		if (sesionIniciada) {
			cargarIntercambios();
		} else {
			setMercado([]);
			setMisOfertas([]);
		}
	}, [sesionIniciada]);

	const datosProveer = {
		mercado,
		misOfertas,
		cargando,
		crearIntercambio,
		aceptarIntercambio,
		rechazarIntercambio,
		cancelarIntercambio,
		cargarIntercambios,
	};

	return (
		<contextoIntercambios.Provider value={datosProveer}>
			{children}
		</contextoIntercambios.Provider>
	);
};

export default ProveedorIntercambios;
export { contextoIntercambios };
