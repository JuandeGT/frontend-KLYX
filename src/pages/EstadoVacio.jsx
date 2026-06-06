import React from 'react';
import { Link } from 'react-router-dom';

// Mensaje de lista vacía con icono y enlace para crear una nueva oferta.
// Usado en Intercambios.jsx.
const EstadoVacio = ({ mensaje }) => (
	<div className="intercambios-vacio">
		<svg className="intercambios-vacio-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
			<path d="M7 16V4m0 0L3 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
		<p>{mensaje}</p>
		<Link to="/crear-intercambio" className="btn-nueva-oferta-vacio">
			Crear una oferta
		</Link>
	</div>
);

export default EstadoVacio;
