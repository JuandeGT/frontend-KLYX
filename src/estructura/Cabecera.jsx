import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import { formatearKC } from '../utils/formatear.js';
import './Cabecera.scss';

const Cabecera = () => {
	const { sesionIniciada, usuario, administrador } = useSesion();
	const esVip = !!usuario?.suscripcion;

	// Controla si el menú del móvil está desplegado o no
	const [menuAbierto, setMenuAbierto] = useState(false);
	const cerrarMenu = () => setMenuAbierto(false);

	return (
		<header id="cabecera">
			<div className="cabecera-inner">
				<div className="cabecera-logo">
					<Link to="/" onClick={cerrarMenu}>
						KLYX
					</Link>
				</div>

				<nav className={`cabecera-nav${menuAbierto ? ' cabecera-nav-abierta' : ''}`}>
					<NavLink to="/" end onClick={cerrarMenu}>
						Inicio
					</NavLink>
					<NavLink to="/cajas" onClick={cerrarMenu}>
						Cajas
					</NavLink>
					<NavLink to="/intercambios" onClick={cerrarMenu}>
						Mercado
					</NavLink>
					{sesionIniciada && (
						<NavLink to="/inventario" onClick={cerrarMenu}>
							Inventario
						</NavLink>
					)}
				</nav>

				<div className="cabecera-acciones">
					{/* Botón hamburguesa, solo visible en móvil */}
					<button
						className="cabecera-hamburguesa"
						onClick={() => setMenuAbierto((prev) => !prev)}
						aria-label="Abrir menú"
					>
						<span className={menuAbierto ? 'linea linea-arriba-x' : 'linea'} />
						<span className={menuAbierto ? 'linea linea-oculta' : 'linea'} />
						<span className={menuAbierto ? 'linea linea-abajo-x' : 'linea'} />
					</button>
					{sesionIniciada && usuario ? (
						<>
							{administrador && (
								<Link to="/panel-admin" className="badge-admin">
									Admin
								</Link>
							)}

							<Link to="/tienda" className={`badge-kc${esVip ? ' badge-kc-vip' : ''}`}>
								{formatearKC(usuario.saldo ?? 0)}
							</Link>

							<div className="cabecera-usuario">
								<Link to="/perfil" className={`usuario-avatar${esVip ? ' usuario-avatar-vip' : ''}`}>
									<span className="avatar-inicial">{usuario.nombre?.charAt(0)?.toUpperCase() ?? '?'}</span>
								</Link>
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
			</div>
		</header>
	);
};

export default Cabecera;
