// Hook de acceso al sistema de notificaciones globales.
// Uso: const { notificar } = useNotificacion();
//      notificar('Mensaje de éxito');
//      notificar('Algo salió mal', 'error');
import React, { useContext } from 'react';
import { contextoNotificaciones } from '../contexts/ProveerNotificaciones.jsx';

const useNotificacion = () => {
	const contexto = useContext(contextoNotificaciones);

	// Fallo temprano: si se usa fuera del proveedor el error es claro y localizable
	if (!contexto) {
		throw new Error('El hook useNotificación debe ser utilizado dentro de <ProveedorNotificaciones>.');
	}

	return contexto;
};

export default useNotificacion;
