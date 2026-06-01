import React, { useEffect, useState } from 'react';
import api from '../utils/api.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import ModalCaja from './ModalCaja.jsx';
import './ListadoCajas.scss';

const ListadoCajas = () => {
	const [cajas, setCajas] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(false);
	// caja seleccionada para el modal — null = cerrado
	const [cajaSeleccionada, setCajaSeleccionada] = useState(null);

	useEffect(() => {
		const cargarCajas = async () => {
			try {
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

			{error && (
				<p className="cajas-error">No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.</p>
			)}

			{!error && cajas.length === 0 && (
				<p className="cajas-error">No hay cajas disponibles en este momento.</p>
			)}

			{!error && cajas.length > 0 && (
				<div className="cajas-grid">
					{cajas.map((caja) => (
						<TarjetaCaja
							key={caja.id}
							caja={caja}
							onVerDetalles={() => setCajaSeleccionada(caja)}
						/>
					))}
				</div>
			)}

			{cajaSeleccionada && (
				<ModalCaja
					caja={cajaSeleccionada}
					onCerrar={() => setCajaSeleccionada(null)}
				/>
			)}
		</div>
	);
};

const TarjetaCaja = ({ caja, onVerDetalles }) => (
	<div className="tarjeta-caja">
		{caja.vip && <span className="badge-vip">VIP</span>}

		<div className="tarjeta-caja-imagen">
			{caja.imagen
				? <img src={caja.imagen} alt={caja.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
				: <span className="icono-caja">⬡</span>
			}
		</div>

		<div className="tarjeta-caja-info">
			<h3 className="tarjeta-caja-nombre">{caja.nombre}</h3>
			<p className="tarjeta-caja-precio">{formatearKC(caja.precio)}</p>
		</div>

		<button className="btn-abrir-caja" onClick={onVerDetalles}>
			Ver detalles
		</button>
	</div>
);

export default ListadoCajas;
