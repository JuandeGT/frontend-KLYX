import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import api from '../utils/api.js';
import { formatearKC } from '../utils/formatear.js';
import './Inicio.scss';

// CuchilloVisor usa Three.js (@react-three/fiber) — no está en la referencia base.
// lazy() descarga el bundle de Three.js (~950KB) solo cuando hace falta,
// sin bloquear el First Contentful Paint de la landing.
const CuchilloVisor = lazy(() => import('./CuchilloVisor.jsx'));

// Mapea la descripción del objeto (Común / Rara / Legendaria) a la clase CSS de rareza.
// Las clases añaden el borde de color a la tarjeta (rojo, morado, azul).
const descripcionARareza = (descripcion = '') => {
	const d = descripcion.toLowerCase();
	if (d.includes('legendar')) return 'legendario';
	if (d.includes('rara') || d.includes('raro')) return 'raro';
	return 'especial';
};

// ─── Botón de compra directa ──────────────────────────────────────────────────
// Llama a POST /api/objetos/{id}/comprar-directo con el Bearer token de Sanctum.
const BtnComprarDirecto = ({ objetoId }) => {
	const { sesionIniciada, obtenerPerfil } = useSesion();
	const { notificar } = useNotificacion();
	const [comprando, setComprando] = useState(false);

	const comprar = async () => {
		if (!sesionIniciada) {
			notificar('Inicia sesión para comprar.', 'error');
			return;
		}
		setComprando(true);
		try {
			await api.post(`/objetos/${objetoId}/comprar-directo`);
			notificar('¡Objeto añadido a tu Vault!');
			await obtenerPerfil(); // refresca el saldo KC en la cabecera
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo completar la compra.';
			notificar(msg, 'error');
		} finally {
			setComprando(false);
		}
	};

	return (
		<button className="btn-comprar" onClick={comprar} disabled={comprando}>
			{comprando ? '...' : 'Comprar ahora'}
		</button>
	);
};

// ─── Página de inicio ─────────────────────────────────────────────────────────
const Inicio = () => {
	// Datos reales del backend
	const [cajas, setCajas] = useState([]);
	const [objetos, setObjetos] = useState([]);

	// Carga en paralelo cajas y objetos al montar el componente.
	// Ambos endpoints son públicos (no requieren autenticación).
	useEffect(() => {
		const cargarDatos = async () => {
			try {
				const [resCajas, resObjetos] = await Promise.all([
					api.get('/cajas'),
					api.get('/objetos'),
				]);
				// Solo mostramos las primeras 3 cajas en el destacado
				setCajas((resCajas.data.data ?? []).slice(0, 3));
				// Mostramos los primeros 6 objetos en la selección semanal
				setObjetos((resObjetos.data.data ?? []).slice(0, 6));
			} catch {
				// Si el backend está dormido (Render free tier), la landing
				// simplemente no muestra las secciones de datos, sin romper nada.
			}
		};
		cargarDatos();
	}, []);

	return (
		<div className="inicio-contenedor">

			{/* ——— HERO ——— */}
			<section className="hero">

				{/* Canvas 3D como fondo completo del hero — Three.js Fase 3 */}
				<div className="hero-3d-bg">
					<Suspense fallback={null}>
						<CuchilloVisor />
					</Suspense>
				</div>

				{/* Gradiente para legibilidad del texto sobre el 3D */}
				<div className="hero-gradiente-overlay" />

				{/* Texto flotando sobre el canvas */}
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
					<div className="hero-ctas">
						<Link to="/cajas" className="btn-cta-principal">Explorar cajas</Link>
						<Link to="/registrarse" className="btn-cta-secundario">Crear cuenta gratis</Link>
					</div>
				</div>

			</section>

			{/* ——— STATS ——— */}
			<section className="stats-banda">
				<div className="stat"><strong>+10.000</strong><span>Usuarios activos</span></div>
				<div className="stat"><strong>+500</strong><span>Skins disponibles</span></div>
				<div className="stat"><strong>100%</strong><span>Probabilidades reales</span></div>
				<div className="stat"><strong>24/7</strong><span>Soporte disponible</span></div>
			</section>

			{/* ——— CAJAS DESTACADAS — datos reales de GET /api/cajas ——— */}
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
									{caja.imagen
										? <img src={caja.imagen} alt={caja.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
										: <span className="icono-caja">⬡</span>
									}
								</div>

								<h3>{caja.nombre}</h3>
								<p className="tarjeta-precio">{formatearKC(caja.precio)}</p>

								<Link to="/cajas" className="btn-ver-caja">Ver caja</Link>
							</div>
						))}
					</div>
				</section>
			)}

			{/* ——— SELECCIÓN SEMANAL — datos reales de GET /api/objetos ——— */}
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
							<div
								key={objeto.id}
								className={`tarjeta-objeto rareza-${descripcionARareza(objeto.descripcion)}`}
							>
								<div className="objeto-imagen">
									{objeto.imagen
										? <img src={objeto.imagen} alt={objeto.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
										: <span className="icono-objeto">🔪</span>
									}
								</div>

								<div className="objeto-info">
									<p className="objeto-tipo">{objeto.tipo}</p>
									<h3 className="objeto-nombre">{objeto.nombre}</h3>
								</div>

								<div className="objeto-footer">
									<span className="objeto-precio">{formatearKC(objeto.precio)}</span>
									<BtnComprarDirecto objetoId={objeto.id} />
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
