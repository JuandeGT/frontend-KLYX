import React, { useState, useEffect } from 'react';
import useAdminObjetos from '../hooks/useAdminObjetos.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './PanelAdmin.scss';

const SeccionObjetos = () => {
	const admin = useAdminObjetos();

	const formVacio = { nombre: '', tipo: 'cuchillo', precio: '', peso: '', longitud: '', descripcion: '', imagen: '' };
	const [objetos, setObjetos] = useState([]);
	const [formulario, setFormulario] = useState(formVacio);
	const [editandoId, setEditandoId] = useState(null);
	const [mostrarForm, setMostrarForm] = useState(false);
	const [confirmarEliminarId, setConfirmarEliminarId] = useState(null);

	const cargar = async () => {
		const data = await admin.getObjetos();
		if (data) setObjetos(data);
	};

	useEffect(() => { cargar(); }, []);

	const abrirNuevo = () => { setFormulario(formVacio); setEditandoId(null); setMostrarForm(true); };

	const abrirEdicion = (o) => {
		setFormulario({ nombre: o.nombre, tipo: o.tipo, precio: o.precio, peso: o.peso ?? '', longitud: o.longitud ?? '', descripcion: o.descripcion ?? '', imagen: o.imagen ?? '' });
		setEditandoId(o.id);
		setMostrarForm(true);
	};

	const cancelar = () => { setMostrarForm(false); setEditandoId(null); };

	const guardar = async () => {
		const datos = { ...formulario, precio: Number(formulario.precio), peso: Number(formulario.peso) || 0, longitud: Number(formulario.longitud) || 0 };
		const respuesta = editandoId
			? await admin.actualizarObjeto(editandoId, datos)
			: await admin.crearObjeto(datos);
		if (respuesta !== null) { cancelar(); cargar(); }
	};

	const eliminar = async () => {
		const respuesta = await admin.eliminarObjeto(confirmarEliminarId);
		setConfirmarEliminarId(null);
		if (respuesta !== null) cargar();
	};

	if (admin.cargando && objetos.length === 0) return <Cargando />;

	return (
		<>
		{confirmarEliminarId && (
			<Confirmacion
				mensaje="Vas a eliminar este objeto permanentemente."
				detalle="Se eliminará del catálogo y de todas las cajas."
				onConfirmar={eliminar}
				onCancelar={() => setConfirmarEliminarId(null)}
				peligroso
			/>
		)}
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Gestión de Objetos</h2>
				<button className="btn-admin-nuevo" onClick={abrirNuevo}>+ Nuevo objeto</button>
			</div>

			{mostrarForm && (
				<div className="admin-form-inline">
					<h3>{editandoId ? 'Editando objeto' : 'Nuevo objeto'}</h3>
					<div className="admin-form-grid">
						<CampoForm label="Nombre" value={formulario.nombre} onChange={(v) => setFormulario({ ...formulario, nombre: v })} />
						<div className="campo-form">
							<label>Tipo</label>
							<select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}>
								<option value="cuchillo">Cuchillo</option>
								<option value="pegatina">Pegatina</option>
							</select>
						</div>
						<CampoForm label="Precio (KC)" value={formulario.precio} onChange={(v) => setFormulario({ ...formulario, precio: v })} type="number" />
						<CampoForm label="Peso (kg)" value={formulario.peso} onChange={(v) => setFormulario({ ...formulario, peso: v })} type="number" />
						<CampoForm label="Longitud (cm)" value={formulario.longitud} onChange={(v) => setFormulario({ ...formulario, longitud: v })} type="number" />
						<CampoForm label="URL imagen" value={formulario.imagen} onChange={(v) => setFormulario({ ...formulario, imagen: v })} />
						<div className="campo-form campo-full">
							<label>Descripción</label>
							<textarea value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} rows={3} />
						</div>
					</div>
					<div className="admin-form-acciones">
						<button className="btn-admin-cancelar" onClick={cancelar}>Cancelar</button>
						<button className="btn-admin-guardar" onClick={guardar} disabled={admin.cargando}>
							{admin.cargando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear objeto')}
						</button>
					</div>
				</div>
			)}

			<div className="admin-tabla-wrapper">
				<table className="admin-tabla">
					<thead>
						<tr>
							<th>ID</th>
							<th>Nombre</th>
							<th>Tipo</th>
							<th>Precio</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{objetos.map((o) => (
							<tr key={o.id}>
								<td className="td-muted td-id">#{o.id}</td>
								<td className="td-nombre">{o.nombre}</td>
								<td><span className="badge-tipo">{o.tipo}</span></td>
								<td className="td-kc">{formatearKC(o.precio)}</td>
								<td className="td-acciones">
									<button className="btn-accion btn-editar" onClick={() => abrirEdicion(o)}>Editar</button>
									<button className="btn-accion btn-eliminar" onClick={() => setConfirmarEliminarId(o.id)}>Eliminar</button>
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

const CampoForm = ({ label, value, onChange, type = 'text' }) => (
	<div className="campo-form">
		<label>{label}</label>
		<input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
	</div>
);

export default SeccionObjetos;
