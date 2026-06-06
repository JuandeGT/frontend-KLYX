import React from 'react';
import { Link } from 'react-router-dom';
import { formatearKC, formatearFecha } from '../utils/formatear.js';

// Tarjeta de acceso rápido a la tienda desde el perfil.
// Muestra el saldo actual y el estado VIP. Al hacer clic lleva a /tienda.
// La recarga real y la compra VIP están en Tienda.jsx para mantener el perfil limpio.
const TarjetaWallet = ({ usuario }) => (
	<Link to="/tienda" className="wallet-card">
		<div className="wallet-card-info">
			<p className="wallet-card-etiqueta">Saldo disponible</p>
			<p className="wallet-card-saldo">{formatearKC(usuario?.saldo ?? 0)}</p>
			<p className="wallet-card-plan">
				{usuario?.suscripcion ? `VIP · caduca ${formatearFecha(usuario.fecha_fin_suscripcion)}` : 'Plan Estándar'}
			</p>
		</div>
		<div className="wallet-card-accion">
			<span>Recargar / VIP</span>
			<span className="wallet-card-flecha">→</span>
		</div>
	</Link>
);

export default TarjetaWallet;
