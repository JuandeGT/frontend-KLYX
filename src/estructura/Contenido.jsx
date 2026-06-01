import React from 'react';
import './Contenido.scss';

const Contenido = ({ children }) => {
	return (
		<main id="contenido">
			{children}
		</main>
	);
};

export default Contenido;
