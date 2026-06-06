import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import { formatearKC } from '../utils/formatear.js';
import './Cabecera.scss';

const Cabecera = () => {
	const { sesionIniciada, usuario, administrador } = useSesion();

	const esVip = !!usuario?.suscripcion;

	return (
		<header id="cabecera">
				<div className="cabecera-inner">

					{/* Logo */}
					<div className="cabecera-logo">
						<Link to="/">KLYX</Link>
					</div>

					{/* Nav central */}
					<nav className="cabecera-nav">
						<NavLink to="/" end>Inicio</NavLink>
						<NavLink to="/cajas">Cajas</NavLink>
						<NavLink to="/intercambios">Mercado</NavLink>
						{sesionIniciada && <NavLink to="/inventario">Inventario</NavLink>}
					</nav>

					{/* Acciones derecha */}
					<div className="cabecera-acciones">
						{sesionIniciada && usuario ? (
							<>
								{administrador && (
									<Link to="/panel-admin" className="badge-admin">Admin</Link>
								)}

								<Link to="/tienda" className={`badge-kc${esVip ? ' badge-kc-vip' : ''}`}>
									{formatearKC(usuario.saldo ?? 0)}
								</Link>

								<div className="cabecera-usuario">
									{/* Avatar con inicial — borde dorado si es VIP */}
									<Link to="/perfil" className={`usuario-avatar${esVip ? ' usuario-avatar-vip' : ''}`}>
										<span className="avatar-inicial">
											{usuario.nombre?.charAt(0)?.toUpperCase() ?? '?'}
										</span>
									</Link>
								</div>
							</>
						) : (
							<>
								<Link to="/inicio-sesion" className="btn-login">Iniciar sesión</Link>
								<Link to="/registrarse" className="btn-registro">Registrarse</Link>
							</>
						)}
					</div>

				</div>
			</header>
	);
};

export default Cabecera;
