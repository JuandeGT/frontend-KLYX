import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import './Registrarse.scss';

const Registrarse = () => {
	const { datosSesion, actualizarDato, crearCuenta } = useSesion();
	const { notificar } = useNotificacion();
	// confirmarPassword es estado LOCAL — nunca se envía al backend.
	// Solo sirve para validar en cliente que el usuario no ha cometido una errata.
	const [confirmarPassword, setConfirmarPassword] = useState('');

	// Solo muestra el error si el segundo campo tiene algo escrito (UX: no molestar al inicio)
	const noCoinciden = confirmarPassword.length > 0 && datosSesion.password !== confirmarPassword;

	const enviarFormulario = (e) => {
		e.preventDefault();
		// Segunda línea de defensa por si el botón quedó habilitado con un estado inconsistente
		if (datosSesion.password !== confirmarPassword) {
			notificar('Las contraseñas no coinciden.', 'error');
			return;
		}
		crearCuenta();
	};

	return (
		<div className="sesion-contenedor">
			<div className="sesion-card">
				<h1 className="sesion-titulo">Crear cuenta</h1>
				<p className="sesion-subtitulo">Únete a KLYX y empieza a ganar skins</p>

				<form className="sesion-form" onSubmit={enviarFormulario}>
					<div className="grupo-input">
						<label htmlFor="nombre">Nombre de usuario</label>
						<input
							id="nombre"
							name="nombre"
							type="text"
							placeholder="TuNombre"
							value={datosSesion.nombre}
							onChange={actualizarDato}
							required
						/>
					</div>

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
							placeholder="Mínimo 8 caracteres"
							value={datosSesion.password}
							onChange={actualizarDato}
							required
						/>
					</div>

					<div className="grupo-input">
						<label htmlFor="confirmarPassword">
							Repetir contraseña
							{noCoinciden && (
								<span className="campo-error-inline"> — No coinciden</span>
							)}
						</label>
						<input
							id="confirmarPassword"
							name="confirmarPassword"
							type="password"
							placeholder="Repite tu contraseña"
							value={confirmarPassword}
							onChange={(e) => setConfirmarPassword(e.target.value)}
							className={noCoinciden ? 'input-error' : ''}
							required
						/>
					</div>

					<button type="submit" className="btn-sesion" disabled={noCoinciden}>
						Crear cuenta
					</button>
				</form>

				<div className="sesion-pie">
					<p>¿Ya tienes cuenta? <Link to="/inicio-sesion">Inicia sesión.</Link></p>
				</div>
			</div>
		</div>
	);
};

export default Registrarse;
