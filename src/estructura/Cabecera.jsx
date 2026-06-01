import React from 'react';
// NavLink es un componente de react-router-dom que añade automáticamente la clase
// "active" al enlace que coincide con la ruta actual. No aparece en la referencia base
// pero es necesario para resaltar la sección activa en la navbar.
import { NavLink, Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import { formatearKC } from '../utils/formatear.js';
import './Cabecera.scss';

const Cabecera = () => {
	const { sesionIniciada, usuario, administrador, cerrarSesion } = useSesion();

	return (
		<header id="cabecera">
			<div className="cabecera-logo">
				<Link to="/">KLYX</Link>
			</div>

			<nav className="cabecera-nav">
				<NavLink to="/" end>Inicio</NavLink>
				<NavLink to="/cajas">Cajas</NavLink>
				<NavLink to="/intercambios">Mercado</NavLink>
				{sesionIniciada && <NavLink to="/vault">Vault</NavLink>}
			</nav>

			<div className="cabecera-acciones">
				{sesionIniciada && usuario ? (
					<>
						{administrador && (
							<Link to="/panel-admin" className="badge-admin">⚙ Admin</Link>
						)}
						{/* Muestra el saldo real del usuario en Klyx Coins */}
						<span className="badge-kc">{formatearKC(usuario.saldo ?? 0)}</span>

						<div className="cabecera-usuario">
							{/* Nombre clickable que lleva al perfil del usuario */}
							<Link to="/perfil" className="usuario-nombre">{usuario.nombre}</Link>
							<button className="btn-logout" onClick={cerrarSesion}>
								Salir
							</button>
						</div>
					</>
				) : (
					<>
						<Link to="/inicio-sesion" className="btn-login">
							Iniciar sesión
						</Link>
						<Link to="/registrarse" className="btn-registro">
							Registrarse
						</Link>
					</>
				)}
			</div>
		</header>
	);
};

export default Cabecera;
