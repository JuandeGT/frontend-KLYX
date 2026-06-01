import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Error.scss';

const Error = () => {
	const navigate = useNavigate();

	return (
		<div className="error-contenedor">
			<div className="error-card">
				<h1 className="error-codigo">404</h1>
				<h2 className="error-titulo">Página no encontrada.</h2>
				<p className="error-descripcion">
					La ruta que buscas no existe o ha sido movida.
				</p>
				<button className="btn-error-inicio" onClick={() => navigate('/')}>
					Volver al inicio
				</button>
			</div>
		</div>
	);
};

export default Error;
