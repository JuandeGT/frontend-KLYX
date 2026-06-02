import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import { formatearKC } from '../utils/formatear.js';
import Confirmacion from './Confirmacion.jsx';
import './Cabecera.scss';

const Cabecera = () => {
	const { sesionIniciada, usuario, administrador, cerrarSesion } = useSesion();
	const [confirmarSalir, setConfirmarSalir] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const esVip = !!usuario?.suscripcion;

	return (
		<>
			{confirmarSalir && (
				<Confirmacion
					mensaje="¿Quieres cerrar la sesión?"
					onConfirmar={() => { setConfirmarSalir(false); cerrarSesion(); }}
					onCancelar={() => setConfirmarSalir(false)}
				/>
			)}

			<header id="cabecera" className={scrolled ? 'scrolled' : ''}>
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
						{sesionIniciada && <NavLink to="/vault">Vault</NavLink>}
					</nav>

					{/* Acciones derecha */}
					<div className="cabecera-acciones">
						{sesionIniciada && usuario ? (
							<>
								{administrador && (
									<Link to="/panel-admin" className="badge-admin">
										⚙ Admin
									</Link>
								)}

								<Link to="/tienda" className={`badge-kc${esVip ? ' badge-kc-vip' : ''}`}>
									{formatearKC(usuario.saldo ?? 0)}
								</Link>

								<div className="cabecera-usuario">
									{/* Avatar con inicial — corona si es VIP */}
									<Link to="/perfil" className={`usuario-avatar${esVip ? ' usuario-avatar-vip' : ''}`}>
										{esVip && <span className="corona-vip">♛</span>}
										<span className="avatar-inicial">
											{usuario.nombre?.charAt(0)?.toUpperCase() ?? '?'}
										</span>
									</Link>

									<button className="btn-logout" onClick={() => setConfirmarSalir(true)}>
										Salir
									</button>
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
		</>
	);
};

export default Cabecera;
