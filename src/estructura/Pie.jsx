import React from 'react';
import { Link } from 'react-router-dom';
import './Pie.scss';

const Pie = () => {
	return (
		<footer className="pie-pagina">
			<div className="pie-contenido">
				<div className="pie-marca">
					<span className="pie-logo">KLYX</span>
					<p className="pie-slogan">Abre cajas. Gana skins. Intercambia.</p>
				</div>

				<div className="pie-links">
					<div className="pie-grupo">
						<h4>Plataforma</h4>
						<Link to="/cajas">Cajas</Link>
						<Link to="/intercambios">Mercado</Link>
						<Link to="/inventario">Mi Inventario</Link>
					</div>
					<div className="pie-grupo">
						<h4>Cuenta</h4>
						<Link to="/perfil">Mi Perfil</Link>
						<Link to="/registrarse">Registrarse</Link>
						<Link to="/inicio-sesion">Iniciar sesión</Link>
					</div>
				</div>
			</div>

			<div className="pie-inferior">
				<p>© 2026 <strong>KLYX</strong> — Todos los derechos reservados.</p>
				<p className="pie-aviso">Las probabilidades de apertura son siempre visibles y auditables.</p>
			</div>
		</footer>
	);
};

export default Pie;
