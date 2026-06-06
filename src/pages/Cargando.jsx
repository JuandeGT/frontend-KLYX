// Pantalla de carga que aparece al cambiar de pestaña o mientras se verifica la sesión.
// Anima las 4 letras "KLYX" en ola dorada con retrasos escalonados (animationDelay),
// más una barra de luz que barre de izquierda a derecha.
// style={{ animationDelay }} es un estilo inline necesario porque el delay varía por índice
// — no se puede expresar como clase CSS fija sin generar 4 clases distintas.
import React from 'react';
import './Cargando.scss';

const Cargando = () => (
	<div className="cargando-contenedor">
		<div className="cargando-logo">
			{/* split + map para animar cada letra independientemente con su propio delay */}
			{'KLYX'.split('').map((letra, i) => (
				<span key={i} style={{ animationDelay: `${i * 0.14}s` }}>{letra}</span>
			))}
		</div>
		<div className="cargando-barra">
			<div className="cargando-barra-luz" />
		</div>
	</div>
);

export default Cargando;
