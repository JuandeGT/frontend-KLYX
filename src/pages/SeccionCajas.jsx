import React, { useState, useEffect } from 'react';
import useAdminCajas from '../hooks/useAdminCajas.js';
import CampoForm from './CampoForm.jsx';
import useAdminObjetos from '../hooks/useAdminObjetos.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './PanelAdmin.scss';

const SeccionCajas = () => {
	const { getCajas, actualizarCaja, crearCaja, eliminarCaja, añadirObjetoACaja, quitarObjetoDeCaja, cargando } = useAdminCajas();
	const { getObjetos } = useAdminObjetos();

	const formVacio = { nombre: '', precio: '', imagen: '', vip: false };
	const [cajas, setCajas] = useState([]);
	const [todosObjetos, setTodosObjetos] = useState([]);
	const [formulario, setFormulario] = useState(formVacio);
	const [editandoId, setEditandoId] = useState(null);
	const [mostrarForm, setMostrarForm] = useState(false);
	const [gestionandoCajaId, setGestionandoCajaId] = useState(null);
	const [confirmarEliminarId, setConfirmarEliminarId] = useState(null);
	const [nuevoObjetoId, setNuevoObjetoId] = useState('');
	const [nuevaProbabilidad, setNuevaProbabilidad] = useState('');

	const cargar = async () => {
		// Promise.all carga cajas y objetos en paralelo
		const [dataCajas, dataObjetos] = await Promise.all([getCajas(), getObjetos()]);
		if (dataCajas) setCajas(dataCajas);
		if (dataObjetos) setTodosObjetos(dataObjetos);
	};

	useEffect(() => {
		cargar();
	}, []);

	const abrirNuevo = () => {
		setFormulario(formVacio);
		setEditandoId(null);
		setMostrarForm(true);
	};

	const abrirEdicion = (c) => {
		setFormulario({ nombre: c.nombre, precio: c.precio, imagen: c.imagen ?? '', vip: c.vip ?? false });
		setEditandoId(c.id);
		setMostrarForm(true);
	};

	const cancelar = () => {
		setMostrarForm(false);
		setEditandoId(null);
	};

	const guardar = async () => {
		const datos = { ...formulario, precio: Number(formulario.precio) };
		const respuesta = editandoId
			? await actualizarCaja(editandoId, datos)
			: await crearCaja(datos);
		if (respuesta !== null) {
			cancelar();
			cargar();
		}
	};

	const eliminar = async () => {
		const respuesta = await eliminarCaja(confirmarEliminarId);
		setConfirmarEliminarId(null);
		if (respuesta !== null) cargar();
	};

	const añadirObjeto = async () => {
		if (!nuevoObjetoId || !nuevaProbabilidad) return;
		const respuesta = await añadirObjetoACaja(
			gestionandoCajaId,
			Number(nuevoObjetoId),
			Number(nuevaProbabilidad),
		);
		if (respuesta !== null) {
			setNuevoObjetoId('');
			setNuevaProbabilidad('');
			cargar();
		}
	};

	const quitarObjeto = async (objetoId) => {
		const respuesta = await quitarObjetoDeCaja(gestionandoCajaId, objetoId);
		if (respuesta !== null) cargar();
	};

	const cajaGestionada = cajas.find((c) => c.id === gestionandoCajaId);

	if (cargando && cajas.length === 0) return <Cargando />;

	return (
		<>
			{confirmarEliminarId && (
				<Confirmacion
					mensaje="Vas a eliminar esta caja permanentemente."
					detalle="Se eliminará del catálogo y todos sus objetos asociados."
					onConfirmar={eliminar}
					onCancelar={() => setConfirmarEliminarId(null)}
					peligroso
				/>
			)}
			<div className="admin-seccion">
				<div className="admin-seccion-header">
					<h2>Gestión de Cajas</h2>
					<button className="btn-admin-nuevo" onClick={abrirNuevo}>
						+ Nueva caja
					</button>
				</div>

				{/* Gestión de objetos de una caja */}
				{gestionandoCajaId && cajaGestionada && (
					<div className="admin-modal-overlay" onClick={() => setGestionandoCajaId(null)}>
						<div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
							<div className="admin-modal-header">
								<h3>Objetos en «{cajaGestionada.nombre}»</h3>
								<button className="admin-modal-cerrar" onClick={() => setGestionandoCajaId(null)}>
									✕
								</button>
							</div>
							<div className="admin-modal-cuerpo">
								{(cajaGestionada.objetos ?? []).length === 0 ? (
									<p className="admin-vacio">Esta caja no tiene objetos.</p>
								) : (
									<table className="admin-tabla admin-tabla-compact">
										<thead>
											<tr>
												<th>Objeto</th>
												<th>Tipo</th>
												<th>Precio</th>
												<th>Probabilidad</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{cajaGestionada.objetos.map((o) => (
												<tr key={o.id}>
													<td>{o.nombre}</td>
													<td>
														<span className="badge-tipo">{o.tipo}</span>
													</td>
													<td className="td-kc">{formatearKC(o.precio)}</td>
													<td>{o.pivot?.probabilidad ?? '—'}%</td>
													<td>
														<button className="btn-accion btn-eliminar" onClick={() => quitarObjeto(o.id)}>
															Quitar
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
								<div className="admin-añadir-objeto">
									<h4>Añadir objeto</h4>
									<div className="admin-añadir-fila">
										<select value={nuevoObjetoId} onChange={(e) => setNuevoObjetoId(e.target.value)}>
											<option value="">— Selecciona objeto —</option>
											{todosObjetos.map((o) => (
												<option key={o.id} value={o.id}>
													{o.nombre} ({o.tipo})
												</option>
											))}
										</select>
										<input
											type="number"
											placeholder="Probabilidad %"
											value={nuevaProbabilidad}
											min={0}
											max={100}
											onChange={(e) => setNuevaProbabilidad(e.target.value)}
										/>
										<button className="btn-admin-guardar" onClick={añadirObjeto} disabled={cargando}>
											Añadir
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{mostrarForm && (
					<div className="admin-form-inline">
						<h3>{editandoId ? 'Editando caja' : 'Nueva caja'}</h3>
						<div className="admin-form-grid">
							<CampoForm
								label="Nombre"
								value={formulario.nombre}
								onChange={(v) => setFormulario({ ...formulario, nombre: v })}
							/>
							<CampoForm
								label="Precio (KC)"
								value={formulario.precio}
								onChange={(v) => setFormulario({ ...formulario, precio: v })}
								type="number"
							/>
							<CampoForm
								label="URL imagen"
								value={formulario.imagen}
								onChange={(v) => setFormulario({ ...formulario, imagen: v })}
							/>
							<div className="campo-form">
								<label>Requiere VIP</label>
								<select
									value={formulario.vip ? 'si' : 'no'}
									onChange={(e) => setFormulario({ ...formulario, vip: e.target.value === 'si' })}
								>
									<option value="no">No</option>
									<option value="si">Sí</option>
								</select>
							</div>
						</div>
						<div className="admin-form-acciones">
							<button className="btn-admin-cancelar" onClick={cancelar}>
								Cancelar
							</button>
							<button className="btn-admin-guardar" onClick={guardar} disabled={cargando}>
								{cargando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear caja'}
							</button>
						</div>
					</div>
				)}

				<div className="admin-tabla-wrapper">
					<table className="admin-tabla">
						<thead>
							<tr>
								<th>Nombre</th>
								<th>Precio</th>
								<th>VIP</th>
								<th>Objetos</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{cajas.map((c) => (
								<tr key={c.id}>
									<td className="td-nombre">{c.nombre}</td>
									<td className="td-kc">{formatearKC(c.precio)}</td>
									<td>{c.vip ? <span className="badge-vip-mini">VIP</span> : '—'}</td>
									<td className="td-muted">{(c.objetos ?? []).length} objetos</td>
									<td className="td-acciones">
										<button className="btn-accion btn-editar" onClick={() => abrirEdicion(c)}>
											Editar
										</button>
										<button className="btn-accion btn-historial" onClick={() => setGestionandoCajaId(c.id)}>
											Contenido
										</button>
										<button className="btn-accion btn-eliminar" onClick={() => setConfirmarEliminarId(c.id)}>
											Eliminar
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default SeccionCajas;
