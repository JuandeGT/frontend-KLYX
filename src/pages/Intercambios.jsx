import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useIntercambios from '../hooks/useIntercambios.js';
import useSesion from '../hooks/useSesion.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './Intercambios.scss';

// Etiquetas de estado en español con color
const ESTADO_INFO = {
	pendiente:  { etiqueta: 'Pendiente',  clase: 'estado-pendiente'  },
	aceptado:   { etiqueta: 'Aceptado',   clase: 'estado-aceptado'   },
	rechazado:  { etiqueta: 'Rechazado',  clase: 'estado-rechazado'  },
	cancelado:  { etiqueta: 'Cancelado',  clase: 'estado-cancelado'  },
};

const Intercambios = () => {
	const { mercado, misOfertas, cargando, aceptarIntercambio, rechazarIntercambio, cancelarIntercambio } = useIntercambios();
	const { usuario } = useSesion();

	const [tab, setTab] = useState('mercado');

	// Ofertas directas que he recibido (estoy en receptor_id) y que están pendientes
	const ofertasRecibidas = misOfertas.filter(
		(o) => o.receptor_id === usuario?.id && o.emisor_id !== usuario?.id && o.estado === 'pendiente'
	);
	// Ofertas que yo he enviado (soy emisor)
	const ofertasEnviadas = misOfertas.filter((o) => o.emisor_id === usuario?.id);

	if (cargando) return <Cargando />;

	return (
		<div className="intercambios-contenedor">
			<div className="intercambios-cabecera">
				<div>
					<h1>Mercado de Intercambios</h1>
					<p>Compra, vende e intercambia skins con otros jugadores.</p>
				</div>
				<Link to="/crear-intercambio" className="btn-nueva-oferta">
					+ Nueva oferta
				</Link>
			</div>

			{/* Tabs */}
			<div className="intercambios-tabs">
				<button
					className={`tab-btn ${tab === 'mercado' ? 'activo' : ''}`}
					onClick={() => setTab('mercado')}
				>
					Mercado público
					{mercado.length > 0 && <span className="tab-badge">{mercado.length}</span>}
				</button>
				<button
					className={`tab-btn ${tab === 'recibidas' ? 'activo' : ''}`}
					onClick={() => setTab('recibidas')}
				>
					Recibidas
					{ofertasRecibidas.length > 0 && (
						<span className="tab-badge tab-badge-alerta">{ofertasRecibidas.length}</span>
					)}
				</button>
				<button
					className={`tab-btn ${tab === 'enviadas' ? 'activo' : ''}`}
					onClick={() => setTab('enviadas')}
				>
					Mis ofertas
					{ofertasEnviadas.length > 0 && <span className="tab-badge">{ofertasEnviadas.length}</span>}
				</button>
			</div>

			{/* Contenido de cada tab */}
			{tab === 'mercado' && (
				<div className="intercambios-lista">
					{mercado.length === 0 ? (
						<EstadoVacio mensaje="No hay ofertas públicas en este momento. ¡Sé el primero en publicar!" />
					) : (
						mercado.map((oferta) => (
							<TarjetaOferta
								key={oferta.id}
								oferta={oferta}
								modo="mercado"
								onAceptar={() => aceptarIntercambio(oferta.id)}
							/>
						))
					)}
				</div>
			)}

			{tab === 'recibidas' && (
				<div className="intercambios-lista">
					{ofertasRecibidas.length === 0 ? (
						<EstadoVacio mensaje="No tienes ofertas directas pendientes." />
					) : (
						ofertasRecibidas.map((oferta) => (
							<TarjetaOferta
								key={oferta.id}
								oferta={oferta}
								modo="recibida"
								onAceptar={() => aceptarIntercambio(oferta.id)}
								onRechazar={() => rechazarIntercambio(oferta.id)}
							/>
						))
					)}
				</div>
			)}

			{tab === 'enviadas' && (
				<div className="intercambios-lista">
					{ofertasEnviadas.length === 0 ? (
						<EstadoVacio mensaje="Aún no has publicado ninguna oferta." />
					) : (
						ofertasEnviadas.map((oferta) => (
							<TarjetaOferta
								key={oferta.id}
								oferta={oferta}
								modo="enviada"
								onCancelar={oferta.estado === 'pendiente' ? () => cancelarIntercambio(oferta.id) : null}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
};

// ——— Tarjeta de oferta ———
const TarjetaOferta = ({ oferta, modo, onAceptar, onRechazar, onCancelar }) => {
	const estado = ESTADO_INFO[oferta.estado] ?? { etiqueta: oferta.estado, clase: '' };

	return (
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
				{/* Lo que ofrece */}
				<div className="oferta-lado">
					<p className="oferta-lado-etiqueta">Ofrece</p>
					{oferta.objeto_ofrecido && (
						<div className="oferta-objeto">
							<span className="objeto-tipo-mini">{oferta.objeto_ofrecido.tipo}</span>
							<strong>{oferta.objeto_ofrecido.nombre}</strong>
							<span className="objeto-val">{formatearKC(oferta.objeto_ofrecido.precio)}</span>
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

				{/* Lo que pide */}
				<div className="oferta-lado">
					<p className="oferta-lado-etiqueta">Pide</p>
					{oferta.objeto_solicitado && (
						<div className="oferta-objeto">
							<span className="objeto-tipo-mini">{oferta.objeto_solicitado.tipo}</span>
							<strong>{oferta.objeto_solicitado.nombre}</strong>
							<span className="objeto-val">{formatearKC(oferta.objeto_solicitado.precio)}</span>
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
						<button className="btn-aceptar" onClick={onAceptar}>
							Aceptar intercambio
						</button>
					)}
					{modo === 'recibida' && onRechazar && (
						<button className="btn-rechazar" onClick={onRechazar}>
							Rechazar
						</button>
					)}
					{modo === 'enviada' && onCancelar && (
						<button className="btn-cancelar-oferta" onClick={onCancelar}>
							Cancelar oferta
						</button>
					)}
				</div>
			)}
		</div>
	);
};

const EstadoVacio = ({ mensaje }) => (
	<div className="intercambios-vacio">
		{/* SVG en lugar de emoji para mantener la estética monocromática dorada */}
		<svg className="intercambios-vacio-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
			<path d="M7 16V4m0 0L3 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
		<p>{mensaje}</p>
		<Link to="/crear-intercambio" className="btn-nueva-oferta-vacio">
			Crear una oferta
		</Link>
	</div>
);

export default Intercambios;
