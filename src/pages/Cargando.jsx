import React from 'react';
import './Cargando.scss';

const Cargando = () => (
	<div className="cargando-contenedor">
		<div className="cargando-logo">
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
