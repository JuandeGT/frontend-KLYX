import React from 'react';
import { formatearKC } from '../utils/formatear.js';
import './ListadoCajas.scss';

// Tarjeta de una caja del catálogo. Al hacer clic en cualquier parte o en el botón
// se abre el ModalCaja con los detalles y la opción de apertura.
const TarjetaCaja = ({ caja, onVerDetalles }) => (
	<div className="tarjeta-caja" onClick={onVerDetalles}>
		{caja.vip && <span className="badge-vip">VIP</span>}

		<div className="tarjeta-caja-imagen">
			{caja.imagen && <img src={caja.imagen} alt={caja.nombre} />}
		</div>

		<h3 className="tarjeta-caja-nombre">{caja.nombre}</h3>
		<p className="tarjeta-caja-precio">{formatearKC(caja.precio)}</p>

		<button
			className="btn-abrir-caja"
			onClick={(e) => { e.stopPropagation(); onVerDetalles(); }}
		>
			Ver detalles
		</button>
	</div>
);

export default TarjetaCaja;
