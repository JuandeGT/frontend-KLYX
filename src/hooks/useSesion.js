import React, { useContext } from 'react';
import { contextoSesion } from '../contexts/ProveedorSesion.jsx';

const useSesion = () => {
	const contexto = useContext(contextoSesion);

	if (!contexto) {
		throw new Error('El hook useSesion debe ser utilizado dentro de <ProveedorSesion>.');
	}

	return contexto;
};

export default useSesion;
