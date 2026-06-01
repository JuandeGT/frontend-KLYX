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

	// Carga el mercado público y mis ofertas enviadas
	const cargarIntercambios = useCallback(async () => {
		if (!sesionIniciada) return;
		setCargando(true);
		try {
			const [resMercado, resMias] = await Promise.all([
				api.get('/intercambios'),
				api.get('/mis-intercambios'),
			]);
			setMercado(resMercado.data.data);
			setMisOfertas(resMias.data.data);
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
			const msg = error.response?.data?.message || 'Error al crear la oferta.';
			notificar(msg, 'error');
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
			const msg = error.response?.data?.message || 'No se pudo completar el intercambio.';
			notificar(msg, 'error');
		}
	};

	// Rechaza una oferta directa recibida
	const rechazarIntercambio = async (id) => {
		try {
			await api.put(`/intercambios/${id}/rechazar`);
			notificar('Oferta rechazada.');
			await cargarIntercambios();
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo rechazar la oferta.';
			notificar(msg, 'error');
		}
	};

	// Cancela una oferta propia pendiente
	const cancelarIntercambio = async (id) => {
		try {
			await api.delete(`/intercambios/${id}`);
			notificar('Oferta cancelada.');
			await cargarIntercambios();
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo cancelar la oferta.';
			notificar(msg, 'error');
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
