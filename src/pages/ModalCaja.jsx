import React, { useEffect, useState } from 'react';
import api from '../utils/api.js';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './ModalCaja.scss';

// ─────────────────────────────────────────────────────────────────────────────
// ModalCaja — muestra detalles de la caja + lista de contenido + botón abrir.
// Después de abrir con éxito, cambia a la pantalla del premio.
//
// Props:
//   caja     — objeto caja (id, nombre, precio, imagen, vip)
//   onCerrar — callback para cerrar el modal
// ─────────────────────────────────────────────────────────────────────────────
const ModalCaja = ({ caja, onCerrar }) => {
	const { sesionIniciada, obtenerPerfil } = useSesion();
	const { notificar } = useNotificacion();

	// detalle = null → cargando; detalle = {} → datos del GET /api/cajas/{id}
	const [detalle, setDetalle] = useState(null);
	const [abriendo, setAbriendo] = useState(false);
	// premio !== null → muestra la pantalla de resultado
	const [premio, setPremio] = useState(null);

	// Al montar, carga el detalle de la caja para obtener objetos + probabilidades.
	// Si la caja ya viene con el array "objetos" (panel admin), lo reutiliza.
	useEffect(() => {
		if (Array.isArray(caja.objetos)) {
			setDetalle(caja);
			return;
		}
		// GET /api/cajas/{id} — ruta pública, devuelve objetos con pivot.probabilidad
		api.get(`/cajas/${caja.id}`)
			.then((res) => setDetalle(res.data.data ?? caja))
			.catch(() => setDetalle(caja));
	}, [caja.id]);

	const abrirCaja = async () => {
		if (!sesionIniciada) {
			notificar('Inicia sesión para abrir cajas.', 'error');
			return;
		}
		setAbriendo(true);
		try {
			const res = await api.post(`/cajas/${caja.id}/abrir`);
			await obtenerPerfil(); // refresca saldo KC en cabecera
			setPremio(res.data.data);
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo abrir la caja.';
			notificar(msg, 'error');
		} finally {
			setAbriendo(false);
		}
	};

	const objetos   = detalle?.objetos ?? [];
	const cuchillos = objetos.filter((o) => o.tipo === 'cuchillo');
	const pegatinas = objetos.filter((o) => o.tipo === 'pegatina');

	return (
		<div className="modal-caja-overlay" onClick={onCerrar}>
			<div
				className={`modal-caja ${premio ? 'modal-caja-premio' : ''}`}
				onClick={(e) => e.stopPropagation()}
			>
				<button className="modal-caja-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>

				{/* ── PANTALLA DE PREMIO ── */}
				{premio ? (
					<div className="premio-contenedor">
						<p className="premio-etiqueta">¡Has conseguido!</p>
						<div className="premio-imagen">
							{premio.imagen
								? <img src={premio.imagen} alt={premio.nombre} />
								: <span className="premio-icono">🔪</span>
							}
						</div>
						<h2 className="premio-nombre">{premio.nombre}</h2>
						{premio.tipo && <span className="premio-tipo">{premio.tipo}</span>}
						{premio.precio > 0 && (
							<p className="premio-precio">{formatearKC(premio.precio)}</p>
						)}
						<button className="btn-premio-cerrar" onClick={onCerrar}>
							Ver mi Vault
						</button>
					</div>
				) : (
					/* ── PANTALLA DE DETALLES ── */
					<>
						{/* Columna izquierda — imagen y datos de la caja */}
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

						{/* Columna derecha — botón de apertura + lista de objetos */}
						<div className="modal-caja-der">
							<button
								className="btn-abrir-modal"
								onClick={abrirCaja}
								disabled={abriendo}
							>
								{abriendo ? 'Abriendo...' : '🎲 Abrir caja'}
							</button>

							<div className="modal-caja-contenido">
								{!detalle ? (
									<Cargando />
								) : objetos.length === 0 ? (
									<p className="modal-vacio">Esta caja aún no tiene objetos configurados.</p>
								) : (
									<>
										{cuchillos.length > 0 && (
											<GrupoObjetos titulo="Cuchillos" objetos={cuchillos} />
										)}
										{pegatinas.length > 0 && (
											<GrupoObjetos titulo="Pegatinas" objetos={pegatinas} />
										)}
									</>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const GrupoObjetos = ({ titulo, objetos }) => (
	<div className="modal-grupo">
		<p className="modal-grupo-titulo">{titulo}</p>
		<div className="modal-lista">
			{objetos.map((o) => (
				<div key={o.id} className="modal-objeto-fila">
					<div className="modal-objeto-img">
						{o.imagen
							? <img src={o.imagen} alt={o.nombre} />
							: <span className="modal-objeto-icono">🔪</span>
						}
					</div>
					<div className="modal-objeto-info">
						<span className="modal-objeto-nombre">{o.nombre}</span>
						<span className="modal-objeto-precio">{formatearKC(o.precio)}</span>
					</div>
					<span className="modal-objeto-prob">
						{o.pivot?.probabilidad ?? '?'}%
					</span>
				</div>
			))}
		</div>
	</div>
);

export default ModalCaja;
