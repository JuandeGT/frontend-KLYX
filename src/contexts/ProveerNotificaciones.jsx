// Sistema de notificaciones globales (toasts).
// Cualquier componente puede llamar a notificar() a través del hook useNotificacion.
// Las alertas se eliminan automáticamente a los 3 segundos.
import React, { createContext, useState } from "react";

const contextoNotificaciones = createContext();

const ProveerNotificaciones = ({ children }) => {
	// Cada notificación es { id, mensaje, tipo } donde tipo = 'exito' | 'error'
	const [notificaciones, setLista] = useState([]);

	// tipo tiene valor por defecto 'exito' para no tener que pasarlo cuando todo va bien
	const notificar = (mensaje, tipo = "exito") => {
		// id único combinando timestamp + número aleatorio para evitar colisiones si
		// dos notificaciones se disparan en el mismo milisegundo
		const id = Date.now() + Math.random();
		// Usamos prev para que si llegan 2 mensajes rápidos, se guarden los dos
		setLista((prev) => [...prev, { id, mensaje, tipo }]);

		// Auto-eliminación a los 3 segundos filtrando por id
		setTimeout(() => {
			setLista((prev) => prev.filter((item) => item.id !== id));
		}, 3000);
	};

	const datosProveer = {
		notificaciones,
		notificar,
	};

	return (
		<contextoNotificaciones.Provider value={datosProveer}>
			{children}
		</contextoNotificaciones.Provider>
	);
};

export default ProveerNotificaciones;
export { contextoNotificaciones };
