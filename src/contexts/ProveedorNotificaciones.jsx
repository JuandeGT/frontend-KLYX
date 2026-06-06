import React, { createContext, useState } from 'react';

const contextoNotificaciones = createContext();

const ProveedorNotificaciones = ({ children }) => {
	const [notificaciones, setLista] = useState([]);

	const notificar = (mensaje, tipo = 'exito') => {
		// El id lo hacemos único combinando la fecha + número aleatorio para evitar colisiones si dos notificaciones se disparan al mismo tiempo
		const id = Date.now() + Math.random();
		// Usamos prev para que si llegan 2 mensajes rápidos, se guarden los dos
		setLista((prev) => [...prev, { id, mensaje, tipo }]);

		setTimeout(() => {
			setLista((prev) => prev.filter((item) => item.id !== id));
		}, 3000);
	};

	const datosProveer = {
		notificaciones,
		notificar,
	};

	return <contextoNotificaciones.Provider value={datosProveer}>{children}</contextoNotificaciones.Provider>;
};

export default ProveedorNotificaciones;
export { contextoNotificaciones };
