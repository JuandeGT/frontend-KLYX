import React, { useState } from 'react';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearFecha } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './Tienda.scss';

const VIP_PRECIO_KC = 1000;

const VIP_BENEFICIOS = ['Acceso a cajas exclusivas VIP', 'Badge VIP en tu perfil', 'Soporte prioritario'];

// El backend descuenta 1000 KC y activa la suscripción poniendo la fecha de fin de suscripción en 30 días
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
			// Api directo, no hay hook porque solo este componente usa este endpoint
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
						<h2 className="vip-titulo">{tieneVip ? 'VIP Activo' : 'Hazte VIP'}</h2>
						<p className="vip-subtitulo">
							{tieneVip
								? `Tu suscripción caduca el ${formatearFecha(usuario.fecha_fin_suscripcion)}`
								: 'Accede a cajas exclusivas y ventajas premium'}
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
									: 'Activar VIP — 30 días'}
						</button>
					</div>
				)}
			</div>
		</>
	);
};

export default PanelVip;
