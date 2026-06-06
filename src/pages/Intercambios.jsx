// Página del mercado de intercambios. Organizada en 3 pestañas:
//   - Mercado público: ofertas de otros usuarios que el autenticado puede aceptar
//   - Recibidas: ofertas directas dirigidas específicamente al usuario actual
//   - Mis ofertas: historial de todo lo que el usuario ha publicado
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useIntercambios from '../hooks/useIntercambios.js';
import useSesion from '../hooks/useSesion.js';
import Cargando from './Cargando.jsx';
import TarjetaOferta from './TarjetaOferta.jsx';
import './Intercambios.scss';

const Intercambios = () => {
	const { mercado, misOfertas, cargando, aceptarIntercambio, rechazarIntercambio, cancelarIntercambio } = useIntercambios();
	const { usuario } = useSesion();

	const [tab, setTab] = useState('mercado');

	// Filtramos misOfertas para separar recibidas (soy receptor) de enviadas (soy emisor).
	// La API devuelve ambas mezcladas en /mis-intercambios para evitar dos peticiones.
	// o.emisor_id !== usuario?.id es imposible que sea false si receptor_id === usuario?.id
	// (nadie puede ser emisor y receptor a la vez), así que se elimina la condición redundante
	const ofertasRecibidas = misOfertas.filter(
		(o) => o.receptor_id === usuario?.id && o.estado === 'pendiente'
	);
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

// EstadoVacio se mantiene aquí por ser un helper muy pequeño exclusivo de esta página
const EstadoVacio = ({ mensaje }) => (
	<div className="intercambios-vacio">
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
