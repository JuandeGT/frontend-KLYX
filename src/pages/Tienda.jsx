import React, { useState } from 'react';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './Tienda.scss';

// =============================================================================
// TIENDA — Recarga de Klyx Coins + activación VIP
// Ruta: /tienda (protegida, requiere sesión)
// Acceso rápido: badge KC del navbar
// =============================================================================

const Tienda = () => {
	const { usuario, obtenerPerfil } = useSesion();
	if (!usuario) return null;

	return (
		<div className="tienda-contenedor">
			<div className="tienda-cabecera">
				<h1>Tienda</h1>
				<p>Recarga Klyx Coins y activa tu suscripción VIP.</p>
			</div>

			<div className="tienda-grid">
				<PanelRecarga onRecarga={obtenerPerfil} />
				<PanelVip usuario={usuario} onCompra={obtenerPerfil} />
			</div>
		</div>
	);
};

// =============================================================================
// PANEL VIP
// =============================================================================
const VIP_PRECIO_KC = 1000;
const VIP_BENEFICIOS = [
	'Acceso a cajas exclusivas VIP',
	'Probabilidades mejoradas en cajas estándar',
	'Badge VIP en tu perfil',
	'Soporte prioritario',
];

const PanelVip = ({ usuario, onCompra }) => {
	const { notificar } = useNotificacion();
	const [comprando, setComprando] = useState(false);
	const [confirmar, setConfirmar] = useState(false);

	const tieneVip = !!usuario?.suscripcion;
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
			await api.post('/comprar-vip');
			notificar('¡Bienvenido a KLYX VIP! Tu suscripción está activa.');
			await onCompra();
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

				<ul className="vip-beneficios">
					{VIP_BENEFICIOS.map((b) => (
						<li key={b} className="vip-beneficio">
							<span className="vip-check">✓</span>
							{b}
						</li>
					))}
				</ul>

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
// ⚠️ Pendiente: integrar pasarela de pago real (Stripe, PayPal, etc.)
// =============================================================================
const PAQUETES = [
	{ kc: 500,   label: '500 KC'    },
	{ kc: 1000,  label: '1.000 KC', popular: true },
	{ kc: 2500,  label: '2.500 KC'  },
	{ kc: 5000,  label: '5.000 KC'  },
	{ kc: 10000, label: '10.000 KC' },
	{ kc: 25000, label: '25.000 KC' },
];

const PanelRecarga = ({ onRecarga }) => {
	const { notificar } = useNotificacion();
	const [seleccionado, setSeleccionado] = useState(null);
	const [custom, setCustom]             = useState('');
	const [procesando, setProcesando]     = useState(false);
	const [confirmar, setConfirmar]       = useState(false);

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
			await api.post('/recargar', { cantidad: cantidadFinal });
			notificar(`+${cantidadFinal.toLocaleString('es-ES')} KC añadidos a tu cuenta.`);
			setSeleccionado(null);
			setCustom('');
			await onRecarga();
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

				<div className="recarga-separador"><span>o introduce otra cantidad</span></div>

				<div className="recarga-custom">
					<input
						type="number"
						className="recarga-input"
						placeholder="Cantidad personalizada en KC…"
						value={custom}
						min={1}
						onChange={(e) => { setCustom(e.target.value); setSeleccionado(null); }}
						onKeyDown={(e) => e.key === 'Enter' && pedirConfirmacion()}
						disabled={procesando}
					/>
					<span className="recarga-input-sufijo">KC</span>
				</div>

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

export default Tienda;
