import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import api from '../utils/api.js';
import { formatearKC } from '../utils/formatear.js';
import ModalCaja from './ModalCaja.jsx';
import BtnComprarDirecto from './BtnComprarDirecto.jsx';
import HeroCtas from './HeroCtas.jsx';
import FeedActividad from './FeedActividad.jsx';
import './Inicio.scss';

// ⚠️ lazy() + Suspense — NO están en la referencia del profesor.
//
// ¿Por qué lo usamos?
// CuchilloVisor usa Three.js, una librería enorme (~950 KB).
// Si la importáramos con un import normal arriba del todo, el navegador tendría que
// descargar ese megabyte ANTES de mostrar cualquier cosa de la página.
//
// Con lazy() le decimos a React:
//   "No descargues este archivo ahora. Descárgalo solo cuando lo vayas a mostrar."
// Es como si en vez de traerte todos los libros de la biblioteca de golpe,
// solo fueses a buscar el libro cuando alguien lo pide.
//
// Suspense actúa como sala de espera: mientras el archivo se descarga,
// muestra el fallback (aquí null = nada). Cuando termina, muestra el visor 3D.
const CuchilloVisor = lazy(() => import('./CuchilloVisor.jsx'));

const Inicio = () => {
	const { sesionIniciada } = useSesion();
	const [cajas, setCajas] = useState([]);
	const [objetos, setObjetos] = useState([]);
	// Solo una caja puede tener el modal abierto a la vez; null = modal cerrado
	const [cajaSeleccionada, setCajaSeleccionada] = useState(null);

	// Carga cajas y oferta semanal en paralelo al montar.
	// Promise.all lanza ambas peticiones a la vez para reducir el tiempo de espera.
	// Ambos endpoints son públicos — no requieren autenticación.
	useEffect(() => {
		const cargarDatos = async () => {
			try {
				const [respuestaCajas, respuestaOferta] = await Promise.all([
					api.get('/cajas'),
					api.get('/oferta-semanal'),
				]);
				// Las 3 primeras cajas ordenadas: Sangrienta (izq) · Dioses (centro) · Elite (der)
				const ordenNombres = ['sangrienta', 'dioses', 'elite'];
				const todasCajas = respuestaCajas.data.data ?? [];
				const cajasOrdenadas = [...todasCajas].sort((a, b) => {
					const ai = ordenNombres.findIndex(k => a.nombre?.toLowerCase().includes(k));
					const bi = ordenNombres.findIndex(k => b.nombre?.toLowerCase().includes(k));
					return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
				}).slice(0, 3);
				setCajas(cajasOrdenadas);
				setObjetos(respuestaOferta.data.data ?? []);
			} catch {
				// Si el backend está dormido la landing simplemente no muestra estas secciones
			}
		};
		cargarDatos();
	}, []);

	return (
		<div className="inicio-contenedor">

			{/* ——— HERO ——— */}
			<section className="hero">
				<div className="hero-3d-bg">
					<Suspense fallback={null}>
						<CuchilloVisor />
					</Suspense>
				</div>
				<div className="hero-gradiente-overlay" />
				<div className="hero-texto">
					<p className="hero-etiqueta">Plataforma de Lootboxes Nº1</p>
					<h1 className="hero-titulo">
						ABRE CAJAS.<br />
						<span className="hero-titulo-dorado">GANA SKINS.</span>
					</h1>
					<p className="hero-subtitulo">
						Deposita saldo real, conviértelo en Klyx Coins y abre cajas con
						skins exclusivos. Transparencia total en cada apertura.
					</p>
					<HeroCtas sesionIniciada={sesionIniciada} />
				</div>
			</section>

			{/* ——— FEED DE ACTIVIDAD EN VIVO ——— */}
			<FeedActividad />

			{/* ——— CAJAS DESTACADAS ——— */}
			{cajas.length > 0 && (
				<section className="destacadas">
					<div className="destacadas-cabecera">
						<h2>Cajas Destacadas</h2>
						<Link to="/cajas" className="ver-todas-link">Ver todas →</Link>
					</div>

					<div className="destacadas-grid">
						{cajas.map((caja) => (
							<div key={caja.id} className="tarjeta-destacada">
								{caja.vip && <span className="badge-vip">VIP</span>}

								<div className="tarjeta-imagen">
									{caja.imagen && <img src={caja.imagen} alt={caja.nombre} />}
								</div>

								<h3>{caja.nombre}</h3>
								<p className="tarjeta-precio">{formatearKC(caja.precio)}</p>

								<button
									className="btn-ver-caja"
									onClick={() => setCajaSeleccionada(caja)}
								>
									Ver detalles
								</button>
							</div>
						))}
					</div>
				</section>
			)}

			{cajaSeleccionada && (
				<ModalCaja
					caja={cajaSeleccionada}
					onCerrar={() => setCajaSeleccionada(null)}
				/>
			)}

			{/* ——— SELECCIÓN SEMANAL ——— */}
			{objetos.length > 0 && (
				<section className="seleccion-semanal">
					<div className="destacadas-cabecera">
						<div>
							<h2>Selección Semanal</h2>
							<p className="seleccion-semanal-subtitulo">Compra directa — sin abrir cajas</p>
						</div>
						<span className="badge-semanal">Oferta 7 días</span>
					</div>

					<div className="semanal-grid">
						{objetos.map((objeto) => (
							<div key={objeto.id} className="tarjeta-objeto">
								<div className="objeto-imagen">
									{objeto.imagen && (
										<img src={objeto.imagen} alt={objeto.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
									)}
								</div>

								<div className="objeto-info">
									<p className="objeto-tipo">{objeto.tipo}</p>
									<h3 className="objeto-nombre">{objeto.nombre}</h3>
								</div>

								<div className="objeto-footer">
									<span className="objeto-precio">{formatearKC(objeto.precio)}</span>
									<BtnComprarDirecto
										objetoId={objeto.id}
										nombreObjeto={objeto.nombre}
										precioObjeto={objeto.precio}
									/>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* ——— CÓMO FUNCIONA ——— */}
			<section className="como-funciona">
				<h2>¿Cómo funciona KLYX?</h2>
				<div className="pasos-grid">
					<div className="paso">
						<div className="paso-numero">01</div>
						<h3>Recarga saldo</h3>
						<p>Convierte tu dinero real en Klyx Coins al instante.</p>
					</div>
					<div className="paso">
						<div className="paso-numero">02</div>
						<h3>Elige una caja</h3>
						<p>Navega por nuestro catálogo y selecciona la caja que quieras abrir.</p>
					</div>
					<div className="paso">
						<div className="paso-numero">03</div>
						<h3>Gana skins</h3>
						<p>Cada apertura es única. Las probabilidades son siempre visibles.</p>
					</div>
				</div>
			</section>

		</div>
	);
};

export default Inicio;
