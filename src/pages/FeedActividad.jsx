import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

// Muestra las últimas ganancias de todos los usuarios en tiempo real
// El endpoint GET /api/historial-objetos es público por lo que no se necesita sesión
const FeedActividad = () => {
	const [items, setItems] = useState([]);

	// Pide al servidor la lista de últimos objetos ganados y actualiza el estado.
	const cargar = async () => {
		try {
			// Api directo, no hay hook porque solo este componente usa este endpoint
			const respuesta = await api.get('/historial-objetos');
			setItems(respuesta.data.data ?? []);
		} catch {
			// Si falla no pasa nada, el feed simplemente no aparece
		}
	};

	useEffect(() => {
		cargar();
		const intervalo = setInterval(cargar, 30000);
		return () => clearInterval(intervalo);
	}, []);

	if (items.length === 0) return null;

	return (
		<section className="feed-actividad">
			<div className="feed-encabezado">
				<span className="feed-dot" aria-hidden="true" />
				<span className="feed-label">En vivo</span>
				<span className="feed-titulo-hint">Últimas ganancias</span>
			</div>

			<div className="feed-lista">
				{items.map((item, i) => {
					const nombre = typeof item.objeto === 'string' ? item.objeto : (item.objeto?.nombre ?? '—');
					const imagen = item.imagen ?? (typeof item.objeto === 'object' ? item.objeto?.imagen : null);

					return (
						<div className="feed-card" key={i}>
							<div className="feed-card-img">{imagen && <img src={imagen} alt={nombre} />}</div>
							<p className="feed-card-nombre">{nombre}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default FeedActividad;
