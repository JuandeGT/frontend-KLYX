import React, { useState, useEffect } from 'react';
import useAdminEstadisticas from '../hooks/useAdminEstadisticas.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './PanelAdmin.scss';

const SeccionDashboard = () => {
	const { getEstadisticas } = useAdminEstadisticas();
	const [estadisticas, setEstadisticas] = useState(null);

	useEffect(() => {
		getEstadisticas().then((data) => { if (data) setEstadisticas(data); });
	}, []);

	if (!estadisticas) return <Cargando />;

	const { usuarios, economia, cajas, intercambios, transacciones, objetos } = estadisticas;
	const totalIntercambios = intercambios.total || 1; // evita división por cero en barras

	return (
		<div className="dashboard">

			{/* KPIs principales */}
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

			<div className="dashboard-fila2">
				{/* Estado de intercambios con barras visuales */}
				<div className="dashboard-bloque">
					<h3 className="dashboard-bloque-titulo">Intercambios por estado</h3>
					<div className="dashboard-barras">
						<div className="barra-fila">
							<span className="barra-label">Aceptados</span>
							<div className="barra-track">
								<div className="barra-fill barra-exito" style={{ width: `${Math.round((intercambios.aceptados / totalIntercambios) * 100)}%` }} />
							</div>
							<span className="barra-valor">{intercambios.aceptados}</span>
						</div>
						<div className="barra-fila">
							<span className="barra-label">Pendientes</span>
							<div className="barra-track">
								<div className="barra-fill barra-warning" style={{ width: `${Math.round((intercambios.pendientes / totalIntercambios) * 100)}%` }} />
							</div>
							<span className="barra-valor">{intercambios.pendientes}</span>
						</div>
						<div className="barra-fila">
							<span className="barra-label">Cancelados</span>
							<div className="barra-track">
								<div className="barra-fill barra-muted" style={{ width: `${Math.round((intercambios.cancelados / totalIntercambios) * 100)}%` }} />
							</div>
							<span className="barra-valor">{intercambios.cancelados}</span>
						</div>
						<div className="barra-fila">
							<span className="barra-label">Rechazados</span>
							<div className="barra-track">
								<div className="barra-fill barra-error" style={{ width: `${Math.round((intercambios.rechazados / totalIntercambios) * 100)}%` }} />
							</div>
							<span className="barra-valor">{intercambios.rechazados}</span>
						</div>
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

export default SeccionDashboard;
