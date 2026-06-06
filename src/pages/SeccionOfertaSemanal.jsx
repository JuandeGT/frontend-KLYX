import React, { useState, useEffect } from 'react';
import useAdminObjetos from '../hooks/useAdminObjetos.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './PanelAdmin.scss';

// Carga GET /api/objetos (público) y filtra solo cuchillos.
// El toggle llama a PUT /api/admin/objetos/{id}/oferta (admin).
// Máximo 3 activos simultáneamente — el 422 del backend se notifica automáticamente.
const SeccionOfertaSemanal = () => {
	const admin = useAdminObjetos();
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
			// Actualiza solo el objeto afectado sin recargar la lista completa
			setObjetos((prev) =>
				prev.map((o) => (o.id === actualizado.id ? { ...o, en_oferta: actualizado.en_oferta } : o))
			);
		}
	};

	if (cargandoLocal) return <Cargando />;

	const activos   = objetos.filter((o) => o.en_oferta);
	const inactivos = objetos.filter((o) => !o.en_oferta);
	const limiteAlcanzado = activos.length >= 3;

	return (
		<div className="admin-seccion">
			<div className="admin-seccion-header">
				<h2>Oferta Semanal</h2>
				<span className={`admin-count ${limiteAlcanzado ? 'count-limiteAlcanzado' : ''}`}>
					{activos.length} / 3 activos
				</span>
			</div>

			<p className="admin-oferta-desc">
				Selecciona hasta 3 cuchillos que aparecerán en la sección "Selección Semanal" de la landing.
			</p>

			{activos.length > 0 && (
				<div className="oferta-activos-grid">
					{activos.map((o) => (
						<TarjetaOfertaAdmin key={o.id} objeto={o} onToggle={() => toggle(o.id)} activo />
					))}
				</div>
			)}

			{activos.length === 0 && (
				<p className="admin-vacio" style={{ marginBottom: '1.5rem' }}>
					Ningún cuchillo en oferta. Activa hasta 3.
				</p>
			)}

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
											{o.imagen && <img src={o.imagen} alt={o.nombre} className="oferta-thumb" />}
										</td>
										<td className="td-nombre">{o.nombre}</td>
										<td className="td-muted">{o.descripcion}</td>
										<td className="td-kc">{formatearKC(o.precio)}</td>
										<td>
											<button
												className="btn-accion btn-editar"
												onClick={() => toggle(o.id)}
												disabled={limiteAlcanzado || admin.cargando}
												title={limiteAlcanzado ? 'Desactiva uno antes de añadir otro' : 'Añadir a la oferta'}
											>
												{limiteAlcanzado ? '+ (límite)' : '+ Activar'}
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
		{objeto.imagen && <img src={objeto.imagen} alt={objeto.nombre} className="oferta-tarjeta-img" />}
		<div className="oferta-tarjeta-info">
			<p className="oferta-tarjeta-nombre">{objeto.nombre}</p>
			<p className="oferta-tarjeta-precio">{formatearKC(objeto.precio)}</p>
		</div>
		<button className="btn-accion btn-eliminar" onClick={onToggle}>
			✕ Desactivar
		</button>
	</div>
);

export default SeccionOfertaSemanal;
