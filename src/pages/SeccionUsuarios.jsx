import React, { useState, useEffect } from 'react';
import useAdminUsuarios from '../hooks/useAdminUsuarios.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './PanelAdmin.scss';

const SeccionUsuarios = () => {
	const admin = useAdminUsuarios();

	const [paginacion, setPaginacion] = useState(null);
	const [pagina, setPagina] = useState(1);
	const [usuarios, setUsuarios] = useState([]);
	const [editando, setEditando] = useState(null);
	const [historialId, setHistorialId] = useState(null);
	const [historialTab, setHistorialTab] = useState('cajas');
	const [historialDatos, setHistorialDatos] = useState([]);
	const [formulario, setFormulario] = useState({});
	const [confirmarEliminarId, setConfirmarEliminarId] = useState(null);

	const cargar = async (p = pagina) => {
		const data = await admin.getUsuarios(p);
		if (data) {
			setUsuarios(data.data ?? data);
			setPaginacion(data);
		}
	};

	useEffect(() => { cargar(pagina); }, [pagina]);

	const abrirEdicion = (user) => {
		setEditando(user.id);
		setFormulario({
			nombre:      user.nombre,
			email:       user.email,
			saldo:       user.saldo,
			suscripcion: user.suscripcion,
			rol:         user.rol?.[0] ?? 'Usuario',
		});
	};

	const guardar = async () => {
		const respuesta = await admin.actualizarUsuario(editando, formulario);
		if (respuesta !== null) { setEditando(null); cargar(); }
	};

	const eliminar = async () => {
		const respuesta = await admin.eliminarUsuario(confirmarEliminarId);
		setConfirmarEliminarId(null);
		if (respuesta !== null) cargar();
	};

	const verHistorial = async (id, tipo = 'cajas') => {
		setHistorialId(id);
		setHistorialTab(tipo);
		const datos = tipo === 'cajas'
			? await admin.getHistorialCajasUsuario(id)
			: await admin.getHistorialTransaccionesUsuario(id);
		setHistorialDatos(datos ?? []);
	};

	const cambiarHistorialTab = async (tipo) => {
		setHistorialTab(tipo);
		const datos = tipo === 'cajas'
			? await admin.getHistorialCajasUsuario(historialId)
			: await admin.getHistorialTransaccionesUsuario(historialId);
		setHistorialDatos(datos ?? []);
	};

	if (admin.cargando && usuarios.length === 0) return <Cargando />;

	return (
		<>
		{confirmarEliminarId && (
			<Confirmacion
				mensaje="Vas a eliminar este usuario permanentemente."
				detalle="Se borrarán su perfil, inventario y saldo."
				onConfirmar={eliminar}
				onCancelar={() => setConfirmarEliminarId(null)}
				peligroso
			/>
		)}
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Gestión de Usuarios</h2>
				<span className="admin-count">{paginacion?.total ?? usuarios.length} usuarios</span>
			</div>

			{/* Modal de historial */}
			{historialId && (
				<div className="admin-modal-overlay" onClick={() => setHistorialId(null)}>
					<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>Historial del usuario</h3>
							<button className="admin-modal-cerrar" onClick={() => setHistorialId(null)}>✕</button>
						</div>
						<div className="admin-modal-tabs">
							<button className={historialTab === 'cajas' ? 'activo' : ''} onClick={() => cambiarHistorialTab('cajas')}>Cajas abiertas</button>
							<button className={historialTab === 'transacciones' ? 'activo' : ''} onClick={() => cambiarHistorialTab('transacciones')}>Transacciones</button>
						</div>
						<div className="admin-modal-cuerpo">
							{historialDatos.length === 0 ? (
								<p className="admin-vacio">Sin registros.</p>
							) : historialTab === 'cajas' ? (
								historialDatos.map((h) => (
									<div key={h.id} className="historial-fila">
										<span>{h.caja?.nombre ?? '—'}</span>
										<span className="historial-objeto">{h.objeto?.nombre ?? '—'}</span>
										<span className="historial-fecha">{formatearFecha(h.created_at)}</span>
									</div>
								))
							) : (
								historialDatos.map((t) => (
									<div key={t.id} className="historial-fila">
										<span className={`historial-tipo tipo-${t.tipo}`}>{t.tipo}</span>
										<span className={t.cantidad >= 0 ? 'positivo' : 'negativo'}>
											{t.cantidad >= 0 ? '+' : ''}{formatearKC(t.cantidad)}
										</span>
										<span className="historial-desc">{t.descripcion}</span>
										<span className="historial-fecha">{formatearFecha(t.created_at)}</span>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			)}

			{/* Formulario de edición inline */}
			{editando && (
				<div className="admin-form-inline">
					<h3>Editando usuario</h3>
					<div className="admin-form-grid">
						<CampoForm label="Nombre" value={formulario.nombre} onChange={(v) => setFormulario({ ...formulario, nombre: v })} />
						<CampoForm label="Email" value={formulario.email} onChange={(v) => setFormulario({ ...formulario, email: v })} type="email" />
						<CampoForm label="Saldo (KC)" value={formulario.saldo} onChange={(v) => setFormulario({ ...formulario, saldo: Number(v) })} type="number" />
						<div className="campo-form">
							<label>VIP</label>
							<select value={formulario.suscripcion ? 'si' : 'no'} onChange={(e) => setFormulario({ ...formulario, suscripcion: e.target.value === 'si' })}>
								<option value="no">No</option>
								<option value="si">Sí (+30 días)</option>
							</select>
						</div>
						<div className="campo-form">
							<label>Rol</label>
							<select value={formulario.rol} onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}>
								<option value="Usuario">Usuario</option>
								<option value="Admin">Admin</option>
							</select>
						</div>
					</div>
					<div className="admin-form-acciones">
						<button className="btn-admin-cancelar" onClick={() => setEditando(null)}>Cancelar</button>
						<button className="btn-admin-guardar" onClick={guardar} disabled={admin.cargando}>
							{admin.cargando ? 'Guardando...' : 'Guardar cambios'}
						</button>
					</div>
				</div>
			)}

			<div className="admin-tabla-wrapper">
				<table className="admin-tabla">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Email</th>
							<th>Saldo</th>
							<th>VIP</th>
							<th>Rol</th>
							<th>Registro</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{usuarios.map((u) => (
							<tr key={u.id}>
								<td className="td-nombre">{u.nombre}</td>
								<td className="td-muted">{u.email}</td>
								<td className="td-kc">{formatearKC(u.saldo)}</td>
								<td>
									{u.suscripcion
										? <span className="badge-vip-mini">VIP</span>
										: <span className="badge-normal">—</span>
									}
								</td>
								<td>
									<span className={`badge-rol ${u.rol?.[0] === 'Admin' ? 'rol-admin' : 'rol-usuario'}`}>
										{u.rol?.[0] ?? 'Usuario'}
									</span>
								</td>
								<td className="td-muted">{formatearFecha(u.created_at)}</td>
								<td className="td-acciones">
									<button className="btn-accion btn-editar" onClick={() => abrirEdicion(u)}>Editar</button>
									<button className="btn-accion btn-historial" onClick={() => verHistorial(u.id)}>Historial</button>
									<button className="btn-accion btn-eliminar" onClick={() => setConfirmarEliminarId(u.id)}>Eliminar</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{paginacion && paginacion.last_page > 1 && (
				<div className="admin-paginacion">
					<button disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>← Anterior</button>
					<span>Página {paginacion.current_page} de {paginacion.last_page}</span>
					<button disabled={pagina >= paginacion.last_page} onClick={() => setPagina(pagina + 1)}>Siguiente →</button>
				</div>
			)}
		</div>
		</>
	);
};

// Helper: campo de formulario reutilizable dentro de esta sección
const CampoForm = ({ label, value, onChange, type = 'text' }) => (
	<div className="campo-form">
		<label>{label}</label>
		<input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
	</div>
);

export default SeccionUsuarios;
