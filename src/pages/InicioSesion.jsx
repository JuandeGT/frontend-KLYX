import React from 'react';
import { Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import './InicioSesion.scss';

const InicioSesion = () => {
	const { datosSesion, actualizarDato, iniciarSesion } = useSesion();

	// onSubmit con preventDefault en vez de onClick en el botón:
	// así el formulario también se envía al pulsar Enter en cualquier campo
	const enviarFormulario = (e) => {
		e.preventDefault();
		iniciarSesion();
	};

	return (
		<div className="sesion-contenedor">
			<div className="sesion-card">
				<h1 className="sesion-titulo">Bienvenido de vuelta</h1>
				<p className="sesion-subtitulo">Inicia sesión para acceder a tu cuenta KLYX</p>

				<form className="sesion-form" onSubmit={enviarFormulario}>
					<div className="grupo-input">
						<label htmlFor="email">Correo electrónico</label>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="tu@correo.com"
							value={datosSesion.email}
							onChange={actualizarDato}
							required
						/>
					</div>

					<div className="grupo-input">
						<label htmlFor="password">Contraseña</label>
						<input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							value={datosSesion.password}
							onChange={actualizarDato}
							required
						/>
					</div>

					<button type="submit" className="btn-sesion">
						Iniciar sesión
					</button>
				</form>

				<div className="sesion-pie">
					<p>
						¿No tienes cuenta? <Link to="/registrarse">Regístrate gratis.</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default InicioSesion;
