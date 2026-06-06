import React, { useState, useEffect } from 'react';
import useAdminIntercambios from '../hooks/useAdminIntercambios.js';
import { formatearKC, formatearFecha } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './PanelAdmin.scss';

const SeccionIntercambiosAdmin = () => {
	const { getIntercambiosAdmin, cargando } = useAdminIntercambios();
	const [intercambios, setIntercambios] = useState([]);
	const [paginacion, setPaginacion] = useState(null);
	const [pagina, setPagina] = useState(1);
	const [estado, setEstado] = useState('');

	const cargar = async (p, e) => {
		const data = await getIntercambiosAdmin(p, e);
		if (data) {
			setIntercambios(data.data ?? data);
			setPaginacion(data);
		}
	};

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
				<button className={`trade-filtro-btn ${estado === '' ? 'activo' : ''}`} onClick={() => cambiarEstado('')}>Todos</button>
				<button className={`trade-filtro-btn ${estado === 'pendiente' ? 'activo' : ''}`} onClick={() => cambiarEstado('pendiente')}>Pendientes</button>
				<button className={`trade-filtro-btn ${estado === 'aceptado' ? 'activo' : ''}`} onClick={() => cambiarEstado('aceptado')}>Aceptados</button>
				<button className={`trade-filtro-btn ${estado === 'rechazado' ? 'activo' : ''}`} onClick={() => cambiarEstado('rechazado')}>Rechazados</button>
				<button className={`trade-filtro-btn ${estado === 'cancelado' ? 'activo' : ''}`} onClick={() => cambiarEstado('cancelado')}>Cancelados</button>
			</div>

			{cargando && intercambios.length === 0 ? <Cargando /> : (
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
											{t.receptor && <span className="td-muted"> → {t.receptor.nombre}</span>}
										</td>
										<td>
											{t.objeto_ofrecido && (
												<div className="trade-objeto">
													{t.objeto_ofrecido.imagen && <img src={t.objeto_ofrecido.imagen} alt="" className="trade-thumb" />}
													<span>{t.objeto_ofrecido.nombre}</span>
												</div>
											)}
											{t.monedas_ofrecidas > 0 && <span className="td-kc">{formatearKC(t.monedas_ofrecidas)}</span>}
											{!t.objeto_ofrecido && !t.monedas_ofrecidas && '—'}
										</td>
										<td>
											{t.objeto_solicitado && (
												<div className="trade-objeto">
													{t.objeto_solicitado.imagen && <img src={t.objeto_solicitado.imagen} alt="" className="trade-thumb" />}
													<span>{t.objeto_solicitado.nombre}</span>
												</div>
											)}
											{t.monedas_solicitadas > 0 && <span className="td-kc">{formatearKC(t.monedas_solicitadas)}</span>}
											{!t.objeto_solicitado && !t.monedas_solicitadas && '—'}
										</td>
										<td><span className={`trade-estado trade-${t.estado}`}>{t.estado}</span></td>
										<td className="td-muted">{formatearFecha(t.created_at)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{paginacion?.last_page > 1 && (
						<div className="admin-paginacion">
							<button disabled={pagina <= 1} onClick={() => cambiarPagina(pagina - 1)}>← Anterior</button>
							<span>Página {paginacion.current_page} de {paginacion.last_page}</span>
							<button disabled={pagina >= paginacion.last_page} onClick={() => cambiarPagina(pagina + 1)}>Siguiente →</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default SeccionIntercambiosAdmin;
