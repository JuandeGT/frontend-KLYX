import React, { useState, useEffect } from 'react';
import useAdmin from '../hooks/useAdmin.js';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './PanelAdmin.scss';

// ─────────────────────────────────────────────────────────────────────────────
// Panel principal — tabs: Usuarios / Objetos / Cajas
// ─────────────────────────────────────────────────────────────────────────────
const PanelAdmin = () => {
	const { administrador } = useSesion();
	const [seccion, setSeccion] = useState('dashboard');

	if (!administrador) {
		return <div className="admin-acceso-denegado">Acceso denegado.</div>;
	}

	const TABS = [
		{ id: 'dashboard',    etiqueta: 'Dashboard'      },
		{ id: 'usuarios',     etiqueta: 'Usuarios'       },
		{ id: 'intercambios', etiqueta: 'Intercambios'   },
		{ id: 'oferta',       etiqueta: 'Oferta Semanal' },
		{ id: 'objetos',      etiqueta: 'Objetos'        },
		{ id: 'cajas',        etiqueta: 'Cajas'          },
	];

	return (
		<div className="panel-admin">
			<div className="panel-admin-cabecera">
				<h1>Panel de Administración</h1>
				<p>Gestiona usuarios, objetos y cajas de la plataforma.</p>
			</div>

			<div className="panel-admin-tabs">
				{TABS.map((t) => (
					<button
						key={t.id}
						className={`admin-tab ${seccion === t.id ? 'activo' : ''}`}
						onClick={() => setSeccion(t.id)}
					>
						{t.etiqueta}
					</button>
				))}
			</div>

			<div className="panel-admin-contenido">
				{seccion === 'dashboard'    && <SeccionDashboard />}
				{seccion === 'usuarios'     && <SeccionUsuarios />}
				{seccion === 'intercambios' && <SeccionIntercambiosAdmin />}
				{seccion === 'oferta'       && <SeccionOfertaSemanal />}
				{seccion === 'objetos'      && <SeccionObjetos />}
				{seccion === 'cajas'        && <SeccionCajas />}
			</div>
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN USUARIOS
// ─────────────────────────────────────────────────────────────────────────────
const SeccionUsuarios = () => {
	const admin = useAdmin();
	const { notificar } = useNotificacion();

	const [paginacion, setPaginacion] = useState(null);
	const [pagina, setPagina] = useState(1);
	const [usuarios, setUsuarios] = useState([]);
	const [editando, setEditando] = useState(null);       // usuario siendo editado
	const [historialId, setHistorialId] = useState(null); // usuario cuyo historial se ve
	const [historialTab, setHistorialTab] = useState('cajas');
	const [historialDatos, setHistorialDatos] = useState([]);

	// Formulario de edición
	const [form, setForm] = useState({});

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
		setForm({
			nombre:      user.nombre,
			email:       user.email,
			saldo:       user.saldo,
			suscripcion: user.suscripcion,
			rol:         user.rol?.[0] ?? 'Usuario',
		});
	};

	const guardar = async () => {
		const res = await admin.actualizarUsuario(editando, form);
		if (res !== null) { setEditando(null); cargar(); }
	};

	const eliminar = async (id) => {
		if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
		const res = await admin.eliminarUsuario(id);
		if (res !== null) cargar();
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
						<CampoForm label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
						<CampoForm label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
						<CampoForm label="Saldo (KC)" value={form.saldo} onChange={(v) => setForm({ ...form, saldo: Number(v) })} type="number" />
						<div className="campo-form">
							<label>VIP</label>
							<select value={form.suscripcion ? 'si' : 'no'} onChange={(e) => setForm({ ...form, suscripcion: e.target.value === 'si' })}>
								<option value="no">No</option>
								<option value="si">Sí (+30 días)</option>
							</select>
						</div>
						<div className="campo-form">
							<label>Rol</label>
							<select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
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

			{/* Tabla de usuarios */}
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
									<button className="btn-accion btn-eliminar" onClick={() => eliminar(u.id)}>Eliminar</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Paginación */}
			{paginacion && paginacion.last_page > 1 && (
				<div className="admin-paginacion">
					<button disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>← Anterior</button>
					<span>Página {paginacion.current_page} de {paginacion.last_page}</span>
					<button disabled={pagina >= paginacion.last_page} onClick={() => setPagina(pagina + 1)}>Siguiente →</button>
				</div>
			)}
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN OBJETOS
// ─────────────────────────────────────────────────────────────────────────────
const SeccionObjetos = () => {
	const admin = useAdmin();

	const formVacio = { nombre: '', tipo: 'cuchillo', precio: '', peso: '', longitud: '', descripcion: '', imagen: '' };
	const [objetos, setObjetos] = useState([]);
	const [form, setForm] = useState(formVacio);
	const [editandoId, setEditandoId] = useState(null);
	const [mostrarForm, setMostrarForm] = useState(false);

	const cargar = async () => {
		const data = await admin.getObjetos();
		if (data) setObjetos(data);
	};

	useEffect(() => { cargar(); }, []);

	const abrirNuevo = () => { setForm(formVacio); setEditandoId(null); setMostrarForm(true); };
	const abrirEdicion = (o) => {
		setForm({ nombre: o.nombre, tipo: o.tipo, precio: o.precio, peso: o.peso ?? '', longitud: o.longitud ?? '', descripcion: o.descripcion ?? '', imagen: o.imagen ?? '' });
		setEditandoId(o.id);
		setMostrarForm(true);
	};
	const cancelar = () => { setMostrarForm(false); setEditandoId(null); };

	const guardar = async () => {
		const datos = { ...form, precio: Number(form.precio), peso: Number(form.peso) || 0, longitud: Number(form.longitud) || 0 };
		const res = editandoId
			? await admin.actualizarObjeto(editandoId, datos)
			: await admin.crearObjeto(datos);
		if (res !== null) { cancelar(); cargar(); }
	};

	const eliminar = async (id) => {
		if (!window.confirm('¿Eliminar este objeto?')) return;
		const res = await admin.eliminarObjeto(id);
		if (res !== null) cargar();
	};

	if (admin.cargando && objetos.length === 0) return <Cargando />;

	return (
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Gestión de Objetos</h2>
				<button className="btn-admin-nuevo" onClick={abrirNuevo}>+ Nuevo objeto</button>
			</div>

			{mostrarForm && (
				<div className="admin-form-inline">
					<h3>{editandoId ? 'Editando objeto' : 'Nuevo objeto'}</h3>
					<div className="admin-form-grid">
						<CampoForm label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
						<div className="campo-form">
							<label>Tipo</label>
							<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
								<option value="cuchillo">Cuchillo</option>
								<option value="pegatina">Pegatina</option>
							</select>
						</div>
						<CampoForm label="Precio (KC)" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} type="number" />
						<CampoForm label="Peso (kg)" value={form.peso} onChange={(v) => setForm({ ...form, peso: v })} type="number" />
						<CampoForm label="Longitud (cm)" value={form.longitud} onChange={(v) => setForm({ ...form, longitud: v })} type="number" />
						<CampoForm label="URL imagen" value={form.imagen} onChange={(v) => setForm({ ...form, imagen: v })} />
						<div className="campo-form campo-full">
							<label>Descripción</label>
							<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} />
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
									<button className="btn-accion btn-eliminar" onClick={() => eliminar(o.id)}>Eliminar</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN CAJAS
// ─────────────────────────────────────────────────────────────────────────────
const SeccionCajas = () => {
	const admin = useAdmin();

	const formVacio = { nombre: '', precio: '', imagen: '', vip: false };
	const [cajas, setCajas] = useState([]);
	const [todosObjetos, setTodosObjetos] = useState([]);
	const [form, setForm] = useState(formVacio);
	const [editandoId, setEditandoId] = useState(null);
	const [mostrarForm, setMostrarForm] = useState(false);
	const [gestionandoCajaId, setGestionandoCajaId] = useState(null);
	const [nuevoObjetoId, setNuevoObjetoId] = useState('');
	const [nuevaProbabilidad, setNuevaProbabilidad] = useState('');

	const cargar = async () => {
		const [dataCajas, dataObjetos] = await Promise.all([admin.getCajas(), admin.getObjetos()]);
		if (dataCajas) setCajas(dataCajas);
		if (dataObjetos) setTodosObjetos(dataObjetos);
	};

	useEffect(() => { cargar(); }, []);

	const abrirNuevo = () => { setForm(formVacio); setEditandoId(null); setMostrarForm(true); };
	const abrirEdicion = (c) => {
		setForm({ nombre: c.nombre, precio: c.precio, imagen: c.imagen ?? '', vip: c.vip ?? false });
		setEditandoId(c.id);
		setMostrarForm(true);
	};
	const cancelar = () => { setMostrarForm(false); setEditandoId(null); };

	const guardar = async () => {
		const datos = { ...form, precio: Number(form.precio) };
		const res = editandoId
			? await admin.actualizarCaja(editandoId, datos)
			: await admin.crearCaja(datos);
		if (res !== null) { cancelar(); cargar(); }
	};

	const eliminar = async (id) => {
		if (!window.confirm('¿Eliminar esta caja?')) return;
		const res = await admin.eliminarCaja(id);
		if (res !== null) cargar();
	};

	const añadirObjeto = async () => {
		if (!nuevoObjetoId || !nuevaProbabilidad) return;
		const res = await admin.añadirObjetoACaja(gestionandoCajaId, Number(nuevoObjetoId), Number(nuevaProbabilidad));
		if (res !== null) { setNuevoObjetoId(''); setNuevaProbabilidad(''); cargar(); }
	};

	const quitarObjeto = async (objetoId) => {
		const res = await admin.quitarObjetoDeCaja(gestionandoCajaId, objetoId);
		if (res !== null) cargar();
	};

	const cajaGestionada = cajas.find((c) => c.id === gestionandoCajaId);

	if (admin.cargando && cajas.length === 0) return <Cargando />;

	return (
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Gestión de Cajas</h2>
				<button className="btn-admin-nuevo" onClick={abrirNuevo}>+ Nueva caja</button>
			</div>

			{/* Modal de gestión de objetos de una caja */}
			{gestionandoCajaId && cajaGestionada && (
				<div className="admin-modal-overlay" onClick={() => setGestionandoCajaId(null)}>
					<div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h3>Objetos en «{cajaGestionada.nombre}»</h3>
							<button className="admin-modal-cerrar" onClick={() => setGestionandoCajaId(null)}>✕</button>
						</div>
						<div className="admin-modal-cuerpo">
							{/* Objetos actuales */}
							{(cajaGestionada.objetos ?? []).length === 0 ? (
								<p className="admin-vacio">Esta caja no tiene objetos.</p>
							) : (
								<table className="admin-tabla admin-tabla-compact">
									<thead><tr><th>Objeto</th><th>Tipo</th><th>Precio</th><th>Probabilidad</th><th></th></tr></thead>
									<tbody>
										{cajaGestionada.objetos.map((o) => (
											<tr key={o.id}>
												<td>{o.nombre}</td>
												<td><span className="badge-tipo">{o.tipo}</span></td>
												<td className="td-kc">{formatearKC(o.precio)}</td>
												<td>{o.pivot?.probabilidad ?? '—'}%</td>
												<td><button className="btn-accion btn-eliminar" onClick={() => quitarObjeto(o.id)}>Quitar</button></td>
											</tr>
										))}
									</tbody>
								</table>
							)}

							{/* Añadir objeto */}
							<div className="admin-añadir-objeto">
								<h4>Añadir objeto</h4>
								<div className="admin-añadir-fila">
									<select value={nuevoObjetoId} onChange={(e) => setNuevoObjetoId(e.target.value)}>
										<option value="">— Selecciona objeto —</option>
										{todosObjetos.map((o) => (
											<option key={o.id} value={o.id}>{o.nombre} ({o.tipo})</option>
										))}
									</select>
									<input
										type="number"
										placeholder="Probabilidad %"
										value={nuevaProbabilidad}
										min={0} max={100}
										onChange={(e) => setNuevaProbabilidad(e.target.value)}
									/>
									<button className="btn-admin-guardar" onClick={añadirObjeto} disabled={admin.cargando}>Añadir</button>
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
						<CampoForm label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
						<CampoForm label="Precio (KC)" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} type="number" />
						<CampoForm label="URL imagen" value={form.imagen} onChange={(v) => setForm({ ...form, imagen: v })} />
						<div className="campo-form">
							<label>Requiere VIP</label>
							<select value={form.vip ? 'si' : 'no'} onChange={(e) => setForm({ ...form, vip: e.target.value === 'si' })}>
								<option value="no">No</option>
								<option value="si">Sí</option>
							</select>
						</div>
					</div>
					<div className="admin-form-acciones">
						<button className="btn-admin-cancelar" onClick={cancelar}>Cancelar</button>
						<button className="btn-admin-guardar" onClick={guardar} disabled={admin.cargando}>
							{admin.cargando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear caja')}
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
									<button className="btn-accion btn-editar" onClick={() => abrirEdicion(c)}>Editar</button>
									<button className="btn-accion btn-historial" onClick={() => setGestionandoCajaId(c.id)}>Contenido</button>
									<button className="btn-accion btn-eliminar" onClick={() => eliminar(c.id)}>Eliminar</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN OFERTA SEMANAL
// Carga GET /api/objetos (público) y filtra solo cuchillos.
// El toggle llama a PUT /api/admin/objetos/{id}/oferta (admin).
// Máximo 3 activos simultáneamente — el 422 del backend se notifica automáticamente.
// ─────────────────────────────────────────────────────────────────────────────
const SeccionOfertaSemanal = () => {
	const admin = useAdmin();
	const [objetos, setObjetos] = useState([]);
	const [cargandoLocal, setCargandoLocal] = useState(true);

	const cargar = async () => {
		const data = await admin.getObjetos();
		if (data) {
			// Solo mostramos cuchillos — las pegatinas no aplican para la oferta
			setObjetos(data.filter((o) => o.tipo === 'cuchillo'));
		}
		setCargandoLocal(false);
	};

	useEffect(() => { cargar(); }, []);

	const toggle = async (id) => {
		const actualizado = await admin.toggleOferta(id);
		if (actualizado !== null) {
			// Actualiza solo el objeto afectado en el estado local
			// sin necesidad de recargar la lista completa
			setObjetos((prev) =>
				prev.map((o) => (o.id === actualizado.id ? { ...o, en_oferta: actualizado.en_oferta } : o))
			);
		}
	};

	if (cargandoLocal) return <Cargando />;

	const activos    = objetos.filter((o) => o.en_oferta);
	const inactivos  = objetos.filter((o) => !o.en_oferta);
	const lleno      = activos.length >= 3;

	return (
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Oferta Semanal</h2>
				<span className={`admin-count ${lleno ? 'count-lleno' : ''}`}>
					{activos.length} / 3 activos
				</span>
			</div>

			<p className="admin-oferta-desc">
				Selecciona hasta 3 cuchillos que aparecerán en la sección
				"Selección Semanal" de la landing. Las pegatinas no se muestran aquí.
			</p>

			{/* ── Activos en oferta ── */}
			{activos.length > 0 && (
				<div className="oferta-activos-grid">
					{activos.map((o) => (
						<TarjetaOfertaAdmin
							key={o.id}
							objeto={o}
							onToggle={() => toggle(o.id)}
							activo
						/>
					))}
				</div>
			)}

			{activos.length === 0 && (
				<p className="admin-vacio" style={{ marginBottom: '1.5rem' }}>
					Ningún cuchillo en oferta. Activa hasta 3.
				</p>
			)}

			{/* ── Separador ── */}
			{inactivos.length > 0 && (
				<>
					<h3 className="oferta-subtitulo">Disponibles para activar</h3>
					<div className="admin-tabla-wrapper">
						<table className="admin-tabla">
							<thead>
								<tr>
									<th>Imagen</th>
									<th>Nombre</th>
									<th>Descripción</th>
									<th>Precio</th>
									<th>Acción</th>
								</tr>
							</thead>
							<tbody>
								{inactivos.map((o) => (
									<tr key={o.id}>
										<td>
											{o.imagen
												? <img src={o.imagen} alt={o.nombre} className="oferta-thumb" />
												: <span className="oferta-thumb-vacio">🔪</span>
											}
										</td>
										<td className="td-nombre">{o.nombre}</td>
										<td className="td-muted">{o.descripcion}</td>
										<td className="td-kc">{formatearKC(o.precio)}</td>
										<td>
											<button
												className="btn-accion btn-editar"
												onClick={() => toggle(o.id)}
												disabled={lleno || admin.cargando}
												title={lleno ? 'Desactiva uno antes de añadir otro' : 'Añadir a la oferta'}
											>
												{lleno ? '+ (límite)' : '+ Activar'}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
};

// Tarjeta visual para un cuchillo activo en la oferta
const TarjetaOfertaAdmin = ({ objeto, onToggle, activo }) => (
	<div className={`oferta-tarjeta ${activo ? 'oferta-tarjeta-activa' : ''}`}>
		{objeto.imagen
			? <img src={objeto.imagen} alt={objeto.nombre} className="oferta-tarjeta-img" />
			: <span className="oferta-tarjeta-icono">🔪</span>
		}
		<div className="oferta-tarjeta-info">
			<p className="oferta-tarjeta-nombre">{objeto.nombre}</p>
			<p className="oferta-tarjeta-precio">{formatearKC(objeto.precio)}</p>
		</div>
		<button className="btn-accion btn-eliminar" onClick={onToggle}>
			✕ Desactivar
		</button>
	</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN DASHBOARD — estadísticas globales de la plataforma
// Datos de GET /api/admin/estadisticas
// ─────────────────────────────────────────────────────────────────────────────
const SeccionDashboard = () => {
	const admin = useAdmin();
	const [stats, setStats] = useState(null);

	useEffect(() => {
		admin.getEstadisticas().then((data) => { if (data) setStats(data); });
	}, []);

	if (!stats) return <Cargando />;

	const { usuarios, economia, cajas, intercambios, transacciones, objetos } = stats;
	const totalTrades = intercambios.total || 1; // evita div/0 en barras

	return (
		<div className="dashboard">

			{/* ── KPIs principales ── */}
			<div className="dashboard-kpis">
				<div className="kpi-card">
					<span className="kpi-valor">{usuarios.total}</span>
					<span className="kpi-titulo">Usuarios</span>
					<span className="kpi-sub">{usuarios.vip_activos} VIP · {usuarios.con_saldo} con saldo</span>
				</div>
				<div className="kpi-card kpi-dorado">
					<span className="kpi-valor">{formatearKC(economia.kc_en_circulacion)}</span>
					<span className="kpi-titulo">KC en circulación</span>
					<span className="kpi-sub">Media {formatearKC(economia.kc_media_usuario)} / usuario</span>
				</div>
				<div className="kpi-card">
					<span className="kpi-valor">{cajas.total_aperturas}</span>
					<span className="kpi-titulo">Cajas abiertas</span>
					<span className="kpi-sub">{objetos.total} objetos · {objetos.en_oferta} en oferta</span>
				</div>
				<div className="kpi-card">
					<span className="kpi-valor">{intercambios.total}</span>
					<span className="kpi-titulo">Intercambios</span>
					<span className="kpi-sub">{intercambios.pendientes} pendientes</span>
				</div>
			</div>

			{/* ── Fila central ── */}
			<div className="dashboard-fila2">

				{/* Estado de intercambios con barras visuales */}
				<div className="dashboard-bloque">
					<h3 className="dashboard-bloque-titulo">Intercambios por estado</h3>
					<div className="dashboard-barras">
						{[
							{ label: 'Aceptados',  valor: intercambios.aceptados,  clase: 'barra-exito'   },
							{ label: 'Pendientes', valor: intercambios.pendientes, clase: 'barra-warning' },
							{ label: 'Cancelados', valor: intercambios.cancelados, clase: 'barra-muted'   },
							{ label: 'Rechazados', valor: intercambios.rechazados, clase: 'barra-error'   },
						].map(({ label, valor, clase }) => (
							<div key={label} className="barra-fila">
								<span className="barra-label">{label}</span>
								<div className="barra-track">
									<div
										className={`barra-fill ${clase}`}
										style={{ width: `${Math.round((valor / totalTrades) * 100)}%` }}
									/>
								</div>
								<span className="barra-valor">{valor}</span>
							</div>
						))}
					</div>
				</div>

				{/* Transacciones por tipo */}
				<div className="dashboard-bloque dashboard-bloque-tabla">
					<h3 className="dashboard-bloque-titulo">Transacciones por tipo</h3>
					<table className="admin-tabla admin-tabla-compact dashboard-tabla">
						<thead>
							<tr>
								<th>Tipo</th>
								<th>Nº</th>
								<th>KC movidos</th>
							</tr>
						</thead>
						<tbody>
							{transacciones.map((t) => (
								<tr key={t.tipo}>
									<td>
										<span className={`historial-tipo tipo-${t.tipo}`}>
											{t.tipo.replace(/_/g, ' ')}
										</span>
									</td>
									<td>{t.total}</td>
									<td className={t.suma_kc >= 0 ? 'positivo' : 'negativo'}>
										{t.suma_kc >= 0 ? '+' : ''}{formatearKC(Math.abs(t.suma_kc))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN INTERCAMBIOS ADMIN — todos los trades de la plataforma
// GET /api/admin/intercambios?estado=&page=
// ─────────────────────────────────────────────────────────────────────────────
const ESTADOS_TRADE = [
	{ value: '',           label: 'Todos'      },
	{ value: 'pendiente',  label: 'Pendientes' },
	{ value: 'aceptado',   label: 'Aceptados'  },
	{ value: 'rechazado',  label: 'Rechazados' },
	{ value: 'cancelado',  label: 'Cancelados' },
];

const SeccionIntercambiosAdmin = () => {
	const admin = useAdmin();
	const [intercambios, setIntercambios] = useState([]);
	const [paginacion, setPaginacion]     = useState(null);
	const [pagina, setPagina]             = useState(1);
	const [estado, setEstado]             = useState('');

	const cargar = async (p, e) => {
		const data = await admin.getIntercambiosAdmin(p, e);
		if (data) {
			setIntercambios(data.data ?? data);
			setPaginacion(data);
		}
	};

	// Al cambiar el filtro, vuelve a página 1
	const cambiarEstado = (e) => { setEstado(e); setPagina(1); cargar(1, e); };
	const cambiarPagina = (p) => { setPagina(p); cargar(p, estado); };

	useEffect(() => { cargar(pagina, estado); }, []);

	return (
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Intercambios</h2>
				<span className="admin-count">{paginacion?.total ?? intercambios.length} total</span>
			</div>

			{/* Filtros de estado */}
			<div className="trade-filtros">
				{ESTADOS_TRADE.map(({ value, label }) => (
					<button
						key={value}
						className={`trade-filtro-btn ${estado === value ? 'activo' : ''}`}
						onClick={() => cambiarEstado(value)}
					>
						{label}
					</button>
				))}
			</div>

			{admin.cargando && intercambios.length === 0 ? <Cargando /> : (
				<>
					<div className="admin-tabla-wrapper">
						<table className="admin-tabla">
							<thead>
								<tr>
									<th>Emisor → Receptor</th>
									<th>Ofrece</th>
									<th>Solicita</th>
									<th>Estado</th>
									<th>Fecha</th>
								</tr>
							</thead>
							<tbody>
								{intercambios.length === 0 ? (
									<tr><td colSpan={5} className="admin-vacio">Sin intercambios.</td></tr>
								) : intercambios.map((t) => (
									<tr key={t.id}>
										<td>
											<span className="td-nombre">{t.emisor?.nombre ?? '—'}</span>
											{t.receptor && (
												<span className="td-muted"> → {t.receptor.nombre}</span>
											)}
										</td>
										<td>
											{t.objeto_ofrecido && (
												<div className="trade-objeto">
													{t.objeto_ofrecido.imagen && (
														<img src={t.objeto_ofrecido.imagen} alt="" className="trade-thumb" />
													)}
													<span>{t.objeto_ofrecido.nombre}</span>
												</div>
											)}
											{t.monedas_ofrecidas > 0 && (
												<span className="td-kc">{formatearKC(t.monedas_ofrecidas)}</span>
											)}
											{!t.objeto_ofrecido && !t.monedas_ofrecidas && '—'}
										</td>
										<td>
											{t.objeto_solicitado && (
												<div className="trade-objeto">
													{t.objeto_solicitado.imagen && (
														<img src={t.objeto_solicitado.imagen} alt="" className="trade-thumb" />
													)}
													<span>{t.objeto_solicitado.nombre}</span>
												</div>
											)}
											{t.monedas_solicitadas > 0 && (
												<span className="td-kc">{formatearKC(t.monedas_solicitadas)}</span>
											)}
											{!t.objeto_solicitado && !t.monedas_solicitadas && '—'}
										</td>
										<td>
											<span className={`trade-estado trade-${t.estado}`}>{t.estado}</span>
										</td>
										<td className="td-muted">{formatearFecha(t.created_at)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{paginacion?.last_page > 1 && (
						<div className="admin-paginacion">
							<button disabled={pagina <= 1} onClick={() => cambiarPagina(pagina - 1)}>
								← Anterior
							</button>
							<span>Página {paginacion.current_page} de {paginacion.last_page}</span>
							<button disabled={pagina >= paginacion.last_page} onClick={() => cambiarPagina(pagina + 1)}>
								Siguiente →
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: campo de formulario reutilizable
// ─────────────────────────────────────────────────────────────────────────────
const CampoForm = ({ label, value, onChange, type = 'text' }) => (
	<div className="campo-form">
		<label>{label}</label>
		<input
			type={type}
			value={value ?? ''}
			onChange={(e) => onChange(e.target.value)}
		/>
	</div>
);

export default PanelAdmin;
