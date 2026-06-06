import React, { useEffect, useState } from 'react';
import api from '../utils/api.js';
import Cargando from './Cargando.jsx';
import ModalCaja from './ModalCaja.jsx';
import TarjetaCaja from './TarjetaCaja.jsx';
import './ListadoCajas.scss';

// Vista pública aunque no haya sesión
const ListadoCajas = () => {
	const [cajas, setCajas] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(false);
	const [cajaSeleccionada, setCajaSeleccionada] = useState(null);

	useEffect(() => {
		const cargarCajas = async () => {
			try {
				// Api directo, no hay hook porque solo este componente usa este endpoint
				const respuesta = await api.get('/cajas');
				setCajas(respuesta.data.data);
			} catch {
				setError(true);
			} finally {
				setCargando(false);
			}
		};
		cargarCajas();
	}, []);

	if (cargando) return <Cargando />;

	return (
		<div className="listado-cajas-contenedor">
			<div className="listado-cajas-cabecera">
				<h1>Todas las cajas</h1>
				<p>Elige tu caja y prueba tu suerte con Klyx Coins.</p>
			</div>

			{error && <p className="cajas-error">No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.</p>}

			{!error && cajas.length === 0 && <p className="cajas-error">No hay cajas disponibles en este momento.</p>}

			{!error && cajas.length > 0 && (
				<div className="cajas-grid">
					{cajas.map((caja) => (
						<TarjetaCaja key={caja.id} caja={caja} onVerDetalles={() => setCajaSeleccionada(caja)} />
					))}
				</div>
			)}

			{cajaSeleccionada && <ModalCaja caja={cajaSeleccionada} onCerrar={() => setCajaSeleccionada(null)} />}
		</div>
	);
};

export default ListadoCajas;
