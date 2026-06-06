import React from 'react';
import useSesion from '../hooks/useSesion.js';
import PanelRecarga from './PanelRecarga.jsx';
import PanelVip from './PanelVip.jsx';
import './Tienda.scss';

const Tienda = () => {
	const { usuario, obtenerPerfil } = useSesion();
	if (!usuario) return null;

	return (
		<div className="tienda-contenedor">
			<div className="tienda-cabecera">
				<h1>Tienda</h1>
				<p>Recarga Klyx Coins y activa tu suscripción VIP.</p>
			</div>

			<div className="tienda-grid">
				<PanelRecarga onRecarga={obtenerPerfil} />
				<PanelVip usuario={usuario} onCompra={obtenerPerfil} />
			</div>
		</div>
	);
};

export default Tienda;
