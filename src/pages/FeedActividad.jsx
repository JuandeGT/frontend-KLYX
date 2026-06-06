import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';

// ⚠️ Este componente NO está en la referencia del profesor.
//
// Muestra las últimas ganancias de todos los usuarios en tiempo real.
// El endpoint GET /api/historial-objetos es público (no necesita login).
const FeedActividad = () => {
	const [items, setItems] = useState([]);

	// Pide al servidor la lista de últimos objetos ganados y actualiza el estado.
	const cargar = async () => {
		try {
			const respuesta = await api.get('/historial-objetos');
			setItems(respuesta.data.data ?? []);
		} catch {
			// Si falla no pasa nada — el feed simplemente no aparece, no es crítico
		}
	};

	// ⚠️ setInterval — NO está en la referencia del profesor.
	//
	// ¿Qué es setInterval?
	// Es como un despertador que suena cada X milisegundos.
	// Aquí lo usamos para llamar a "cargar" cada 30 segundos (30000 ms)
	// sin que el usuario tenga que recargar la página.
	//
	// ¿Por qué no usamos WebSockets como haría una app "de verdad"?
	// Los WebSockets son como un cable directo entre el navegador y el servidor:
	// cuando alguien abre una caja, el servidor avisa al instante a todos los clientes.
	// Son más eficientes pero también más complejos de montar en el backend (Laravel).
	// Como aquí solo queremos mostrar los últimos eventos cada poco tiempo,
	// el polling cada 30 segundos es suficiente y mucho más sencillo.
	//
	// El return () => clearInterval(intervalo) es el "apagar el despertador":
	// cuando el componente desaparece de la pantalla, limpiamos el intervalo
	// para que no siga ejecutándose en segundo plano y no cause memory leaks.
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
					// Soporta que el backend devuelva objeto como string o como { nombre, imagen }
					const nombre = typeof item.objeto === 'string'
						? item.objeto
						: (item.objeto?.nombre ?? '—');
					const imagen = item.imagen
						?? (typeof item.objeto === 'object' ? item.objeto?.imagen : null);

					return (
						<div className="feed-card" key={i}>
							<div className="feed-card-img">
								{imagen && <img src={imagen} alt={nombre} />}
							</div>
							<p className="feed-card-nombre">{nombre}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default FeedActividad;
