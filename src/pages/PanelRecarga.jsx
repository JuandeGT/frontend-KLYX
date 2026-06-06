import React, { useState } from 'react';
import useNotificacion from '../hooks/useNotificacion.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './Tienda.scss';

// Panel de recarga de Klyx Coins.
// ⚠️ MODO DE PRUEBA: las recargas son simuladas, sin pasarela de pago real.
// En producción habría que integrar Stripe / PayPal antes de acreditar las monedas.
const PanelRecarga = ({ onRecarga }) => {
	const { notificar } = useNotificacion();
	const [paqueteSeleccionado, setSeleccionado] = useState(null);
	const [cantidadPersonalizada, setCustom]             = useState('');
	const [procesando, setProcesando]     = useState(false);
	const [confirmar, setConfirmar]       = useState(false);

	const cantidadFinal = paqueteSeleccionado ?? (cantidadPersonalizada ? Number(cantidadPersonalizada) : 0);

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
						<strong>Modo de prueba</strong> — Las recargas son simuladas. Falta integrar una pasarela de pago real.
					</span>
				</div>

				<div className="recarga-header">
					<h2 className="recarga-titulo">Recargar Klyx Coins</h2>
					<p className="recarga-subtitulo">Elige el paquete que más te convenga</p>
				</div>

				{/* Paquetes de KC disponibles */}
				<div className="recarga-paquetes">
					<button className={`recarga-paquete${paqueteSeleccionado === 500 ? ' activo' : ''}`} onClick={() => { setSeleccionado(500); setCustom(''); }} disabled={procesando}>
						<span className="recarga-paquete-kc">500 KC</span>
					</button>
					<button className={`recarga-paquete popular${paqueteSeleccionado === 1000 ? ' activo' : ''}`} onClick={() => { setSeleccionado(1000); setCustom(''); }} disabled={procesando}>
						<span className="recarga-badge-popular">Más popular</span>
						<span className="recarga-paquete-kc">1.000 KC</span>
					</button>
					<button className={`recarga-paquete${paqueteSeleccionado === 2500 ? ' activo' : ''}`} onClick={() => { setSeleccionado(2500); setCustom(''); }} disabled={procesando}>
						<span className="recarga-paquete-kc">2.500 KC</span>
					</button>
					<button className={`recarga-paquete${paqueteSeleccionado === 5000 ? ' activo' : ''}`} onClick={() => { setSeleccionado(5000); setCustom(''); }} disabled={procesando}>
						<span className="recarga-paquete-kc">5.000 KC</span>
					</button>
					<button className={`recarga-paquete${paqueteSeleccionado === 10000 ? ' activo' : ''}`} onClick={() => { setSeleccionado(10000); setCustom(''); }} disabled={procesando}>
						<span className="recarga-paquete-kc">10.000 KC</span>
					</button>
					<button className={`recarga-paquete${paqueteSeleccionado === 25000 ? ' activo' : ''}`} onClick={() => { setSeleccionado(25000); setCustom(''); }} disabled={procesando}>
						<span className="recarga-paquete-kc">25.000 KC</span>
					</button>
				</div>

				<div className="recarga-separador"><span>o introduce otra cantidad</span></div>

				<div className="recarga-cantidadPersonalizada">
					<input
						type="number"
						className="recarga-input"
						placeholder="Cantidad personalizada en KC…"
						value={cantidadPersonalizada}
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

export default PanelRecarga;
