import React, { createContext, useState } from "react";

const contextoNotificaciones = createContext();

const ProveerNotificaciones = ({ children }) => {
	const [lista, setLista] = useState([]);

	const notificar = (mensaje, tipo = "exito") => {
		const id = Date.now() + Math.random();
		// Usamos prev para que si llegan 2 mensajes rápidos, se guarden los dos
		setLista((prev) => [...prev, { id, mensaje, tipo }]);

		setTimeout(() => {
			setLista((prev) => prev.filter((item) => item.id !== id));
		}, 3000);
	};

	const datosProveer = {
		lista,
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
