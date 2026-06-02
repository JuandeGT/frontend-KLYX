import React, { useState } from 'react';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './Perfil.scss';


const Perfil = () => {
	const { usuario, obtenerPerfil, borrarCuenta } = useSesion();
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

	if (!usuario) return null;

	return (
		<div className="perfil-contenedor">
			{confirmarBorrar && (
				<Confirmacion
					mensaje="Esta acción es irreversible. Se eliminarán tu cuenta, inventario y saldo."
					detalle="No podrás recuperar tu cuenta una vez eliminada."
					onConfirmar={() => { setConfirmarBorrar(false); borrarCuenta(); }}
					onCancelar={() => setConfirmarBorrar(false)}
					peligroso
				/>
			)}

			{/* Panel de recarga encima de los datos de perfil */}
			<PanelRecarga onRecarga={obtenerPerfil} />

			{/* Panel VIP — debajo de la recarga, encima del perfil */}
			<PanelVip usuario={usuario} onCompra={obtenerPerfil} />

			<div className="perfil-card">
				{/* ——— Cabecera del perfil ——— */}
				<div className="perfil-avatar-fila">
					<div className="perfil-avatar">
						<span>{usuario.nombre?.charAt(0)?.toUpperCase() ?? '?'}</span>
					</div>
					<div>
						<h1 className="perfil-nombre">{usuario.nombre}</h1>
						<p className="perfil-email">{usuario.email}</p>
					</div>
				</div>

				{/* ——— Stats ——— */}
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

				{/* ——— Formulario de edición ——— */}
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
							<label htmlFor="password">Nueva contraseña <span className="campo-opcional">(opcional)</span></label>
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
					<button className="btn-editar-perfil" onClick={abrirEdicion}>
						Editar perfil
					</button>
				)}
			</div>

			{/* Zona de peligro */}
			<div className="zona-peligro">
				<div className="zona-peligro-texto">
					<h3>Zona de peligro</h3>
					<p>Eliminar la cuenta borrará permanentemente tu perfil, inventario y saldo. Esta acción no se puede deshacer.</p>
				</div>
				<button className="btn-borrar-cuenta" onClick={() => setConfirmarBorrar(true)}>
					Eliminar cuenta
				</button>
			</div>
		</div>
	);
};

// =============================================================================
// PANEL VIP
// Llama a POST /api/comprar-vip para activar la suscripción premium.
// =============================================================================

// Precio en KC y beneficios del plan VIP
const VIP_PRECIO_KC = 1000;
const VIP_BENEFICIOS = [
	'Acceso a cajas exclusivas VIP',
	'Probabilidades mejoradas en cajas estándar',
	'Badge VIP en tu perfil',
	'Soporte prioritario',
];

const PanelVip = ({ usuario, onCompra }) => {
	const { notificar } = useNotificacion();
	const [comprando,  setComprando]  = useState(false);
	const [confirmar,  setConfirmar]  = useState(false);

	// Si ya tiene VIP activo, mostrar estado en lugar del formulario de compra
	const tieneVip = usuario?.suscripcion;
	const saldoSuficiente = (usuario?.saldo ?? 0) >= VIP_PRECIO_KC;

	const pedirConfirmacion = () => {
		if (!saldoSuficiente) {
			notificar('Saldo insuficiente. Recarga Klyx Coins primero.', 'error');
			return;
		}
		setConfirmar(true);
	};

	const comprarVip = async () => {
		setConfirmar(false);
		setComprando(true);
		try {
			// POST /api/comprar-vip — sin body, el backend descuenta KC y activa VIP
			await api.post('/comprar-vip');
			notificar('¡Bienvenido a KLYX VIP! Tu suscripción está activa.');
			await onCompra(); // refresca usuario (saldo + estado VIP)
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo activar el VIP.';
			notificar(msg, 'error');
		} finally {
			setComprando(false);
		}
	};

	return (
		<>
		{confirmar && (
			<Confirmacion
				mensaje="Vas a activar la suscripción VIP por 30 días."
				detalle={`Coste: ${VIP_PRECIO_KC.toLocaleString('es-ES')} KC`}
				onConfirmar={comprarVip}
				onCancelar={() => setConfirmar(false)}
			/>
		)}
		<div className={`vip-card${tieneVip ? ' vip-card-activo' : ''}`}>
			{/* Cabecera */}
			<div className="vip-header">
				<div className="vip-header-texto">
					<h2 className="vip-titulo">
						{tieneVip ? '⭐ VIP Activo' : 'Hazte VIP'}
					</h2>
					<p className="vip-subtitulo">
						{tieneVip
							? `Tu suscripción caduca el ${formatearFecha(usuario.fecha_fin_suscripcion)}`
							: 'Accede a cajas exclusivas y ventajas premium'
						}
					</p>
				</div>
				{tieneVip && <span className="vip-badge-grande">VIP</span>}
			</div>

			{/* Beneficios */}
			<ul className="vip-beneficios">
				{VIP_BENEFICIOS.map((b) => (
					<li key={b} className="vip-beneficio">
						<span className="vip-check">✓</span>
						{b}
					</li>
				))}
			</ul>

			{/* Botón de compra — solo si no tiene VIP */}
			{!tieneVip && (
				<div className="vip-compra">
					<div className="vip-precio">
						<span className="vip-precio-kc">{VIP_PRECIO_KC.toLocaleString('es-ES')} KC</span>
						<span className="vip-precio-periodo">/ 30 días</span>
					</div>
					<button
						className="btn-comprar-vip"
						onClick={pedirConfirmacion}
						disabled={comprando || !saldoSuficiente}
						title={!saldoSuficiente ? `Necesitas ${VIP_PRECIO_KC} KC` : ''}
					>
						{comprando
							? 'Activando...'
							: !saldoSuficiente
								? `Faltan ${(VIP_PRECIO_KC - (usuario?.saldo ?? 0)).toLocaleString('es-ES')} KC`
								: 'Activar VIP — 30 días'
						}
					</button>
				</div>
			)}
		</div>
		</>
	);
};

// =============================================================================
// PANEL DE RECARGA — MODO DE PRUEBA
// -----------------------------------------------------------------------------
// ⚠️  PENDIENTE: integrar pasarela de pago real (Stripe, PayPal, etc.)
//     Por ahora el botón añade KC directamente llamando a POST /api/depositar
//     sin ningún cobro real. En producción, este flujo debe pasar por un
//     proveedor de pagos que verifique el cobro antes de acreditar las monedas.
// =============================================================================

// Paquetes de KC disponibles { kc, label, popular }
const PAQUETES = [
	{ kc: 500,    label: '500 KC'    },
	{ kc: 1000,   label: '1.000 KC', popular: true },
	{ kc: 2500,   label: '2.500 KC'  },
	{ kc: 5000,   label: '5.000 KC'  },
	{ kc: 10000,  label: '10.000 KC' },
	{ kc: 25000,  label: '25.000 KC' },
];

const PanelRecarga = ({ onRecarga }) => {
	const { notificar } = useNotificacion();
	const [seleccionado, setSeleccionado] = useState(null); // kc del paquete activo
	const [custom, setCustom]             = useState('');   // cantidad personalizada
	const [procesando, setProcesando]     = useState(false);
	const [confirmar,  setConfirmar]      = useState(false);

	// Cantidad final: paquete seleccionado o valor del campo personalizado
	const cantidadFinal = seleccionado ?? (custom ? Number(custom) : 0);

	const pedirConfirmacion = () => {
		if (!cantidadFinal || cantidadFinal <= 0) {
			notificar('Selecciona un paquete o introduce una cantidad.', 'error');
			return;
		}
		setConfirmar(true);
	};

	const recargar = async () => {
		setConfirmar(false);
		setProcesando(true);
		try {
			// ⚠️ PRUEBA: llama directamente al backend sin pasarela de pago real
			await api.post('/recargar', { cantidad: cantidadFinal });
			notificar(`+${cantidadFinal.toLocaleString('es-ES')} KC añadidos a tu cuenta.`);
			setSeleccionado(null);
			setCustom('');
			await onRecarga(); // refresca saldo en cabecera y perfil
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo completar la recarga.';
			notificar(msg, 'error');
		} finally {
			setProcesando(false);
		}
	};

	return (
		<>
		{confirmar && (
			<Confirmacion
				mensaje={`Vas a añadir ${cantidadFinal.toLocaleString('es-ES')} KC a tu cuenta.`}
				detalle="(Modo de prueba — sin cobro real)"
				onConfirmar={recargar}
				onCancelar={() => setConfirmar(false)}
			/>
		)}
		<div className="recarga-card">
			{/* Aviso de modo prueba — muy visible */}
			<div className="recarga-aviso-prueba">
				<span className="recarga-aviso-icono">⚠️</span>
				<span>
					<strong>Modo de prueba</strong> — Las recargas son simuladas.
					Falta integrar una pasarela de pago real.
				</span>
			</div>

			<div className="recarga-header">
				<h2 className="recarga-titulo">Recargar Klyx Coins</h2>
				<p className="recarga-subtitulo">Elige el paquete que más te convenga</p>
			</div>

			{/* Grid de paquetes */}
			<div className="recarga-paquetes">
				{PAQUETES.map(({ kc, label, popular }) => (
					<button
						key={kc}
						className={`recarga-paquete${seleccionado === kc ? ' activo' : ''}${popular ? ' popular' : ''}`}
						onClick={() => { setSeleccionado(kc); setCustom(''); }}
						disabled={procesando}
					>
						{popular && <span className="recarga-badge-popular">Más popular</span>}
						<span className="recarga-paquete-kc">{label}</span>
					</button>
				))}
			</div>

			{/* Separador o */}
			<div className="recarga-separador">
				<span>o introduce otra cantidad</span>
			</div>

			{/* Input personalizado */}
			<div className="recarga-custom">
				<input
					type="number"
					className="recarga-input"
					placeholder="Cantidad personalizada en KC…"
					value={custom}
					min={1}
					onChange={(e) => { setCustom(e.target.value); setSeleccionado(null); }}
					onKeyDown={(e) => e.key === 'Enter' && recargar()}
					disabled={procesando}
				/>
				<span className="recarga-input-sufijo">KC</span>
			</div>

			{/* Botón de confirmar */}
			<button
				className="recarga-btn-confirmar"
				onClick={pedirConfirmacion}
				disabled={procesando || !cantidadFinal}
			>
				{procesando
					? 'Procesando…'
					: cantidadFinal
						? `Añadir ${cantidadFinal.toLocaleString('es-ES')} KC`
						: 'Selecciona un paquete'
				}
			</button>
		</div>
		</>
	);
};

export default Perfil;
