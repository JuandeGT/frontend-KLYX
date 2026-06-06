import React from 'react';
import './ModalCaja.scss';

// Tarjeta pequeña que muestra un objeto del grid de contenido de la caja
// Aparece en el modal cuando el usuario aún no ha abierto las cajas, muestra los objetos de la caja
const MiniObjeto = ({ objeto: o }) => {
	// Extrae la probabilidad de forma segura, si el backend devuelve un objeto en vez de un número, String() lo convierte antes de renderizar
	const probabilidad = o.pivot?.probabilidad;
	const porcentaje =
		probabilidad !== null && probabilidad !== undefined && typeof probabilidad !== 'object'
			? String(probabilidad)
			: '?';

	return (
		<div className="mini-objeto" title={`${o.nombre} — ${porcentaje}%`}>
			<div className="mini-objeto-img">{o.imagen && <img src={o.imagen} alt={o.nombre} />}</div>
			<p className="mini-objeto-nombre">{o.nombre}</p>
			<span className="mini-objeto-prob">{porcentaje}%</span>
		</div>
	);
};

export default MiniObjeto;
