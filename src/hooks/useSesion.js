// Hook principal de autenticación. Expone:
//   sesionIniciada, usuario, administrador — estado actual de la sesión
//   iniciarSesion, cerrarSesion, crearCuenta — acciones de autenticación
//   obtenerPerfil — recarga los datos del usuario desde la API (útil tras compras/cambios)
//   borrarCuenta — elimina la cuenta y limpia la sesión local
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
