// En los hooks de admin no se usa el proveedor y aquí sí porque este proveedor se usa en 3 componentes distintos.
// Sin el Proveedor, cada uno haría su propia petición al servidor y el estado estaría desincronizado (uno puede mostrar datos viejos mientras otro ya recargó)
// El Proveedor guarda UN SOLO estado compartido y cualquiera puede llamar a cargarIntercambios() para que todos vean los datos frescos a la vez
//
// Los hooks de admin no necesitan esto porque cada sección del panel admin la usa UN único componente, no tienen nada que compartir
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

	// Promise.all lanza ambas peticiones al mismo tiempo en vez de una tras otra
	// useCallback: memoriza la función para que su referencia no cambie entre renders, evitando el bucle infinito del useEffect
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

	const aceptarIntercambio = async (id) => {
		try {
			await api.put(`/intercambios/${id}/aceptar`);
			notificar('¡Intercambio completado con éxito!');
			await cargarIntercambios();
		} catch (error) {
			notificar(error.response?.data?.message || 'No se pudo completar el intercambio.', 'error');
		}
	};

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
		cancelarIntercambio,
		cargarIntercambios,
	};

	return <contextoIntercambios.Provider value={datosProveer}>{children}</contextoIntercambios.Provider>;
};

export default ProveedorIntercambios;
export { contextoIntercambios };
