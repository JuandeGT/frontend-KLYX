// Dos pestañas:
//   - Mercado público: ofertas de otros usuarios que el autenticado puede aceptar
//   - Mis ofertas: historial de todo lo que el usuario ha publicado
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useIntercambios from '../hooks/useIntercambios.js';
import useSesion from '../hooks/useSesion.js';
import Cargando from './Cargando.jsx';
import TarjetaOferta from './TarjetaOferta.jsx';
import EstadoVacio from './EstadoVacio.jsx';
import './Intercambios.scss';

const Intercambios = () => {
	const { mercado, misOfertas, cargando, aceptarIntercambio, cancelarIntercambio } = useIntercambios();
	const { usuario } = useSesion();

	const [tab, setTab] = useState('mercado');

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
				<button className={`tab-btn ${tab === 'mercado' ? 'activo' : ''}`} onClick={() => setTab('mercado')}>
					Mercado público
					{mercado.length > 0 && <span className="tab-badge">{mercado.length}</span>}
				</button>
				<button className={`tab-btn ${tab === 'enviadas' ? 'activo' : ''}`} onClick={() => setTab('enviadas')}>
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

export default Intercambios;
