import React, { useState } from 'react';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './Intercambios.scss';

// Etiquetas de estado en español con clase CSS de color
const ESTADO_INFO = {
	pendiente:  { etiqueta: 'Pendiente',  clase: 'estado-pendiente'  },
	aceptado:   { etiqueta: 'Aceptado',   clase: 'estado-aceptado'   },
	rechazado:  { etiqueta: 'Rechazado',  clase: 'estado-rechazado'  },
	cancelado:  { etiqueta: 'Cancelado',  clase: 'estado-cancelado'  },
};

// Muestra una oferta con su layout "ofrece ↔ pide" y los botones de acción según el modo:
//   'mercado'  → puede aceptar (cualquier usuario ajeno)
//   'recibida' → puede aceptar o rechazar (es el receptor designado)
//   'enviada'  → puede cancelar si sigue pendiente (es el emisor)
const TarjetaOferta = ({ oferta, modo, onAceptar, onRechazar, onCancelar }) => {
	const estado = ESTADO_INFO[oferta.estado] ?? { etiqueta: oferta.estado, clase: '' };
	const [confirmar, setConfirmar] = useState(null);

	const acciones = {
		aceptar:  { mensaje: 'Vas a aceptar este intercambio.',                   detalle: 'Se transferirán los objetos y/o KC entre ambas partes.', fn: onAceptar,  peligroso: false },
		rechazar: { mensaje: 'Vas a rechazar esta oferta.',                        detalle: 'El emisor será notificado del rechazo.',                 fn: onRechazar, peligroso: false },
		cancelar: { mensaje: 'Vas a cancelar tu oferta. Se retirará del mercado.', detalle: 'Esta acción no se puede deshacer.',                      fn: onCancelar, peligroso: true  },
	};

	const confirmarAccion = () => {
		const accion = acciones[confirmar];
		setConfirmar(null);
		accion?.fn?.();
	};

	return (
		<>
			{confirmar && (
				<Confirmacion
					mensaje={acciones[confirmar].mensaje}
					detalle={acciones[confirmar].detalle}
					onConfirmar={confirmarAccion}
					onCancelar={() => setConfirmar(null)}
					peligroso={acciones[confirmar].peligroso}
				/>
			)}
			<div className={`tarjeta-oferta ${oferta.estado !== 'pendiente' ? 'oferta-inactiva' : ''}`}>
				{/* Cabecera: emisor y fecha */}
				<div className="oferta-meta">
					<span className="oferta-emisor">
						{modo === 'enviada' ? 'Tú' : (oferta.emisor?.nombre ?? 'Usuario')}
					</span>
					<div className="oferta-meta-derecha">
						<span className={`oferta-estado ${estado.clase}`}>{estado.etiqueta}</span>
						<span className="oferta-fecha">{formatearFecha(oferta.created_at)}</span>
					</div>
				</div>

				{/* Cuerpo: ofrece ↔ pide */}
				<div className="oferta-cuerpo">
					<div className="oferta-lado">
						<p className="oferta-lado-etiqueta">Ofrece</p>
						{oferta.objeto_ofrecido && (
							<div className="oferta-objeto">
								<div className="oferta-objeto-img">
									{oferta.objeto_ofrecido.imagen && (
										<img src={oferta.objeto_ofrecido.imagen} alt={oferta.objeto_ofrecido.nombre} />
									)}
								</div>
								<div className="oferta-objeto-info">
									<span className="objeto-tipo-mini">{oferta.objeto_ofrecido.tipo}</span>
									<strong>{oferta.objeto_ofrecido.nombre}</strong>
									<span className="objeto-val">{formatearKC(oferta.objeto_ofrecido.precio)}</span>
								</div>
							</div>
						)}
						{oferta.monedas_ofrecidas > 0 && (
							<p className="oferta-kc">+ {formatearKC(oferta.monedas_ofrecidas)}</p>
						)}
						{!oferta.objeto_ofrecido && oferta.monedas_ofrecidas === 0 && (
							<p className="oferta-vacio">—</p>
						)}
					</div>

					<div className="oferta-flecha">⇄</div>

					<div className="oferta-lado">
						<p className="oferta-lado-etiqueta">Pide</p>
						{oferta.objeto_solicitado && (
							<div className="oferta-objeto">
								<div className="oferta-objeto-img">
									{oferta.objeto_solicitado.imagen && (
										<img src={oferta.objeto_solicitado.imagen} alt={oferta.objeto_solicitado.nombre} />
									)}
								</div>
								<div className="oferta-objeto-info">
									<span className="objeto-tipo-mini">{oferta.objeto_solicitado.tipo}</span>
									<strong>{oferta.objeto_solicitado.nombre}</strong>
									<span className="objeto-val">{formatearKC(oferta.objeto_solicitado.precio)}</span>
								</div>
							</div>
						)}
						{oferta.monedas_solicitadas > 0 && (
							<p className="oferta-kc">+ {formatearKC(oferta.monedas_solicitadas)}</p>
						)}
						{!oferta.objeto_solicitado && oferta.monedas_solicitadas === 0 && (
							<p className="oferta-vacio">—</p>
						)}
					</div>
				</div>

				{/* Acciones */}
				{oferta.estado === 'pendiente' && (
					<div className="oferta-acciones">
						{(modo === 'mercado' || modo === 'recibida') && onAceptar && (
							<button className="btn-aceptar" onClick={() => setConfirmar('aceptar')}>
								Aceptar intercambio
							</button>
						)}
						{modo === 'recibida' && onRechazar && (
							<button className="btn-rechazar" onClick={() => setConfirmar('rechazar')}>
								Rechazar
							</button>
						)}
						{modo === 'enviada' && onCancelar && (
							<button className="btn-cancelar-oferta" onClick={() => setConfirmar('cancelar')}>
								Cancelar oferta
							</button>
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default TarjetaOferta;
