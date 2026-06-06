import React from 'react';
import { Link } from 'react-router-dom';

// Botones del hero, cambian según si el usuario tiene sesión iniciada o no
const BotonesHero = ({ sesionIniciada }) => (
	<div className="hero-ctas">
		<Link to="/cajas" className="btn-cta-principal">
			Explorar cajas
		</Link>
		{sesionIniciada ? (
			<Link to="/inventario" className="btn-cta-secundario">
				Mi Inventario →
			</Link>
		) : (
			<Link to="/registrarse" className="btn-cta-secundario">
				Crear cuenta gratis
			</Link>
		)}
	</div>
);

export default BotonesHero;
