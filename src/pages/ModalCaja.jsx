import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import Confirmacion from '../estructura/Confirmacion.jsx';
import MiniObjeto from './MiniObjeto.jsx';
import './ModalCaja.scss';

// ─────────────────────────────────────────────────────────────────────────────
// ModalCaja — modal de detalle y apertura de caja
//
// Tiene dos vistas controladas por el estado `premio`:
//   null   → Vista normal: imagen caja (izq) + objetos posibles + botón abrir (der)
//   objeto → Vista premio — el estado `paso` controla qué se muestra:
//              'nada'    → esperando (entre que llega el premio y empieza el flash)
//              'flash'   → destello blanco fullscreen 650ms
//              'mostrar' → revela el objeto ganado con animación
//
// Flujo de apertura:
//   clic "Abrir caja" → Confirmacion → POST /api/cajas/{id}/abrir → setPremio → flash → reveal
// ─────────────────────────────────────────────────────────────────────────────
const ModalCaja = ({ caja, onCerrar }) => {
	const navigate = useNavigate();
	const { sesionIniciada, obtenerPerfil } = useSesion();
	const { notificar } = useNotificacion();

	const [detalle,   setDetalle]   = useState(null);
	const [abriendo,  setAbriendo]  = useState(false);
	const [premio,    setPremio]    = useState(null);
	const [confirmar, setConfirmar] = useState(false);
	// 'nada' → 'flash' (destello) → 'mostrar' (objeto visible)
	const [paso, setPaso] = useState('nada');

	useEffect(() => {
		if (Array.isArray(caja.objetos)) { setDetalle(caja); return; }
		api.get(`/cajas/${caja.id}`)
			.then((respuesta) => setDetalle(respuesta.data.data ?? caja))
			.catch(() => setDetalle(caja));
	}, [caja.id]);

	// Cuando llega el premio: primero flash, luego revela el objeto
	useEffect(() => {
		if (!premio) return;
		setPaso('flash');
		const t = setTimeout(() => setPaso('mostrar'), 650);
		return () => clearTimeout(t);
	}, [premio]);

	const pedirConfirmacion = () => {
		if (!sesionIniciada) {
			notificar('Inicia sesión para abrir cajas.', 'error');
			return;
		}
		setConfirmar(true);
	};

	const abrirCaja = async () => {
		setConfirmar(false);
		setAbriendo(true);
		try {
			const respuesta = await api.post(`/cajas/${caja.id}/abrir`);
			await obtenerPerfil();

			const obj = respuesta.data?.data?.premio_obtenido ?? {};

			setPremio({
				id:     obj.id ?? null,
				nombre: obj.nombre ?? obj.name ?? obj.titulo ?? '—',
				tipo:   String(obj.tipo ?? obj.type ?? ''),
				imagen: obj.imagen ?? obj.imagen_url ?? obj.img ?? obj.image ?? null,
				precio: Number(obj.precio ?? obj.price ?? 0),
			});
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo abrir la caja.';
			notificar(msg, 'error');
		} finally {
			setAbriendo(false);
		}
	};

	// Vuelve a la vista de detalles de la misma caja para poder abrirla otra vez
	const abrirOtra = () => {
		setPremio(null);
		setPaso('nada');
	};

	const irAlInventario = () => { onCerrar(); navigate('/inventario'); };

	// Los objetos se muestran de mayor a menor probabilidad para que el usuario
	// vea primero los más comunes. La probabilidad viene del pivot de la tabla caja_objeto.
	const objetosOrdenados = [...(detalle?.objetos ?? [])].sort(
		(a, b) => (b.pivot?.probabilidad ?? 0) - (a.pivot?.probabilidad ?? 0)
	);

	return (
		<>
		{confirmar && (
			<Confirmacion
				mensaje={`Vas a abrir la caja "${caja.nombre}".`}
				detalle={`Coste: ${formatearKC(caja.precio)}`}
				onConfirmar={abrirCaja}
				onCancelar={() => setConfirmar(false)}
			/>
		)}
		<div
			className="modal-caja-overlay"
			// Clic fuera: cierra solo si no hay premio o si ya se muestra
			onClick={premio ? (paso === 'mostrar' ? onCerrar : undefined) : onCerrar}
		>
			<div
				className={`modal-caja${premio ? ' modal-caja-premio' : ''}`}
				onClick={(e) => e.stopPropagation()}
			>
{/* ════════════════════════════════════════════════════════════
				    PANTALLA DE PREMIO
				════════════════════════════════════════════════════════════ */}
				{premio ? (
					<>
						{/* Flash PANTALLA COMPLETA (position:fixed) — tapa todo el viewport
						    mientras dura el destello, nada es visible detrás */}
						{paso === 'flash' && <div className="premio-flash-fullscreen" />}

						{/* Contenido del premio — invisible durante el flash, aparece después */}
						<div className={`premio-contenedor${paso === 'mostrar' ? ' premio-visible' : ''}`}>

							<p className="premio-etiqueta">¡Has conseguido!</p>

							{/* Imagen con rayos y halo */}
							<div className="premio-imagen-wrap">
								<div className="premio-rayos" />
								<div className="premio-imagen">
									{premio.imagen
										? <img src={premio.imagen} alt={premio.nombre} />
										: <span className="premio-icono">🔪</span>
									}
								</div>
							</div>

							<h2 className="premio-nombre">{premio.nombre}</h2>

							{premio.tipo && (
								<span className="premio-tipo">{premio.tipo}</span>
							)}

							{premio.precio > 0 && (
								<p className="premio-precio">{formatearKC(premio.precio)}</p>
							)}

							{/* Dos botones: ir al inventario o volver a los detalles de la caja */}
							<div className="premio-botones">
								<button className="btn-premio-inventario" onClick={irAlInventario}>
									Ver mi inventario
								</button>
								<button className="btn-premio-mas" onClick={abrirOtra}>
									Abrir otra
								</button>
							</div>

							<p className="premio-hint">o toca fuera para cerrar</p>
						</div>
					</>
				) : (
					/* ════════════════════════════════════════════════════════
					   PANTALLA DE DETALLES (2 columnas)
					════════════════════════════════════════════════════════ */
					<>
						<div className="modal-caja-izq">
							<div className="modal-caja-imagen">
								{caja.imagen
									? <img src={caja.imagen} alt={caja.nombre} />
									: <span className="modal-caja-icono">⬡</span>
								}
							</div>
							{caja.vip && <span className="badge-vip-modal">VIP</span>}
							<h2 className="modal-caja-nombre">{caja.nombre}</h2>
							<p className="modal-caja-precio">{formatearKC(caja.precio)}</p>
						</div>

						<div className="modal-caja-der">
							<div className="modal-caja-boton">
								<button
									className="btn-abrir-modal"
									onClick={pedirConfirmacion}
									disabled={abriendo}
								>
									{abriendo ? 'Abriendo...' : '🎲 Abrir caja'}
								</button>
							</div>

							<div className="modal-caja-lista-header">
								<span>Contenido</span>
								{detalle && objetosOrdenados.length > 0 && (
									<span className="modal-caja-count">
										{objetosOrdenados.length} objetos
									</span>
								)}
							</div>

							<div className="modal-caja-contenido">
								{!detalle ? (
									<Cargando />
								) : objetosOrdenados.length === 0 ? (
									<p className="modal-vacio">Sin objetos configurados.</p>
								) : (
									<div className="modal-objetos-grid">
										{objetosOrdenados.map((o) => (
											<MiniObjeto key={o.id} objeto={o} />
										))}
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
		</>
	);
};

export default ModalCaja;
