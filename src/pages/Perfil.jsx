import React, { useState } from 'react';

import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import TarjetaWallet from './TarjetaWallet.jsx';
import './Perfil.scss';

const Perfil = () => {
	const { usuario, obtenerPerfil, borrarCuenta, cerrarSesion } = useSesion();
	const { notificar } = useNotificacion();

	const formularioVacio = { nombre: '', email: '', password: '' };
	const [formulario, setFormulario] = useState(formularioVacio);
	const [editando, setEditando] = useState(false);
	const [guardando, setGuardando] = useState(false);

	const abrirEdicion = () => {
		setFormulario({
			nombre: usuario.nombre ?? '',
			email: usuario.email ?? '',
			password: '',
		});
		setEditando(true);
	};

	const cancelarEdicion = () => {
		setFormulario(formularioVacio);
		setEditando(false);
	};

	const actualizarCampo = (e) => {
		const { name, value } = e.target;
		setFormulario({ ...formulario, [name]: value });
	};

	const guardarPerfil = async (e) => {
		e.preventDefault();
		setGuardando(true);

		try {
			const datos = {};
			if (formulario.nombre && formulario.nombre !== usuario.nombre) datos.nombre = formulario.nombre;
			if (formulario.email && formulario.email !== usuario.email) datos.email = formulario.email;
			if (formulario.password) datos.password = formulario.password;

			if (Object.keys(datos).length === 0) {
				notificar('No has cambiado ningún dato.', 'error');
				return;
			}

			// Api directo, no hay hook porque solo este componente usa este endpoint
			await api.put('/perfil', datos);
			await obtenerPerfil();
			notificar('Perfil actualizado correctamente.');
			setEditando(false);
		} catch (error) {
			const msg = error.response?.data?.message || 'Error al actualizar el perfil.';
			notificar(msg, 'error');
		} finally {
			setGuardando(false);
		}
	};

	const [confirmarBorrar, setConfirmarBorrar] = useState(false);
	const [confirmarSalir, setConfirmarSalir] = useState(false);

	if (!usuario) return null;

	return (
		<div className="perfil-contenedor">
			{confirmarSalir && (
				<Confirmacion
					mensaje="¿Quieres cerrar la sesión?"
					onConfirmar={() => {
						setConfirmarSalir(false);
						cerrarSesion();
					}}
					onCancelar={() => setConfirmarSalir(false)}
				/>
			)}

			{confirmarBorrar && (
				<Confirmacion
					mensaje="Esta acción es irreversible. Se eliminarán tu cuenta, inventario y saldo."
					detalle="No podrás recuperar tu cuenta una vez eliminada."
					onConfirmar={() => {
						setConfirmarBorrar(false);
						borrarCuenta();
					}}
					onCancelar={() => setConfirmarBorrar(false)}
					peligroso
				/>
			)}

			<TarjetaWallet usuario={usuario} />

			<div className="perfil-card">
				<div className="perfil-avatar-fila">
					<div className="perfil-avatar">
						<span>{usuario.nombre?.charAt(0)?.toUpperCase() ?? '?'}</span>
					</div>
					<div>
						<h1 className="perfil-nombre">{usuario.nombre}</h1>
						<p className="perfil-email">{usuario.email}</p>
					</div>
				</div>

				{/* Estadísticas */}
				<div className="perfil-stats">
					<div className="perfil-stat">
						<span className="stat-valor">{formatearKC(usuario.saldo ?? 0)}</span>
						<span className="stat-etiqueta">Saldo</span>
					</div>
					<div className="perfil-stat">
						<span className={`stat-valor ${usuario.suscripcion ? 'vip-activo' : ''}`}>
							{usuario.suscripcion ? 'VIP' : 'Estándar'}
						</span>
						<span className="stat-etiqueta">Plan</span>
					</div>
					{usuario.suscripcion && usuario.fecha_fin_suscripcion && (
						<div className="perfil-stat">
							<span className="stat-valor">{formatearFecha(usuario.fecha_fin_suscripcion)}</span>
							<span className="stat-etiqueta">VIP hasta</span>
						</div>
					)}
				</div>

				{/* Formulario para editar el perfil */}
				{editando ? (
					<form className="perfil-form" onSubmit={guardarPerfil}>
						<h2 className="perfil-form-titulo">Editar perfil</h2>

						<div className="grupo-input">
							<label htmlFor="nombre">Nombre de usuario</label>
							<input
								id="nombre"
								name="nombre"
								type="text"
								value={formulario.nombre}
								onChange={actualizarCampo}
								placeholder="Tu nombre"
							/>
						</div>

						<div className="grupo-input">
							<label htmlFor="email">Correo electrónico</label>
							<input
								id="email"
								name="email"
								type="email"
								value={formulario.email}
								onChange={actualizarCampo}
								placeholder="tu@correo.com"
							/>
						</div>

						<div className="grupo-input">
							<label htmlFor="password">
								Nueva contraseña <span className="campo-opcional">(opcional)</span>
							</label>
							<input
								id="password"
								name="password"
								type="password"
								value={formulario.password}
								onChange={actualizarCampo}
								placeholder="Dejar en blanco para no cambiarla"
							/>
						</div>

						<div className="perfil-acciones">
							<button type="button" className="btn-perfil-cancelar" onClick={cancelarEdicion}>
								Cancelar
							</button>
							<button type="submit" className="btn-perfil-guardar" disabled={guardando}>
								{guardando ? 'Guardando...' : 'Guardar cambios'}
							</button>
						</div>
					</form>
				) : (
					<div className="perfil-acciones-fila">
						<button className="btn-editar-perfil" onClick={abrirEdicion}>
							Editar perfil
						</button>
						<button className="btn-cerrar-sesion-perfil" onClick={() => setConfirmarSalir(true)}>
							Cerrar sesión
						</button>
					</div>
				)}
			</div>

			{/* Eliminar cuenta */}
			<div className="zona-peligro">
				<div className="zona-peligro-cabecera">
					<span className="zona-peligro-icono" aria-hidden="true">
						☠
					</span>
					<div>
						<h3 className="zona-peligro-titulo">Eliminar cuenta</h3>
						<p className="zona-peligro-aviso">Esta acción no se puede deshacer</p>
					</div>
				</div>
				<ul className="zona-peligro-lista">
					<li>Tu perfil y nombre de usuario</li>
					<li>Todo tu inventario de skins</li>
					<li>Tu saldo de Klyx Coins</li>
					<li>Tu historial de intercambios</li>
				</ul>
				<button className="btn-borrar-cuenta" onClick={() => setConfirmarBorrar(true)}>
					<span>Eliminar mi cuenta permanentemente</span>
				</button>
			</div>
		</div>
	);
};

export default Perfil;
