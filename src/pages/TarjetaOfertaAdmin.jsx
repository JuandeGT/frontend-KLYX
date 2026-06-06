import React from 'react';
import { formatearKC } from '../utils/formatear.js';

// Tarjeta visual para un cuchillo activo en la oferta semanal del panel admin.
const TarjetaOfertaAdmin = ({ objeto, onToggle, activo }) => (
	<div className={`oferta-tarjeta ${activo ? 'oferta-tarjeta-activa' : ''}`}>
		{objeto.imagen && <img src={objeto.imagen} alt={objeto.nombre} className="oferta-tarjeta-img" />}
		<div className="oferta-tarjeta-info">
			<p className="oferta-tarjeta-nombre">{objeto.nombre}</p>
			<p className="oferta-tarjeta-precio">{formatearKC(objeto.precio)}</p>
		</div>
		<button className="btn-accion btn-eliminar" onClick={onToggle}>
			✕ Desactivar
		</button>
	</div>
);

export default TarjetaOfertaAdmin;
