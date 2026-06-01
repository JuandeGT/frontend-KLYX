import React, { useContext } from 'react';
import { contextoNotificaciones } from '../contexts/ProveerNotificaciones.jsx';

const useNotificacion = () => {
	const contexto = useContext(contextoNotificaciones);

	if (!contexto) {
		throw new Error('El hook useNotificación debe ser utilizado dentro de <ProveedorNotificaciones>.');
	}

	return contexto;
};

export default useNotificacion;
