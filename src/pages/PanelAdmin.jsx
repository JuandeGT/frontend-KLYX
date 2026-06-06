import React, { useState } from 'react';
import useSesion from '../hooks/useSesion.js';
import SeccionDashboard from './SeccionDashboard.jsx';
import SeccionUsuarios from './SeccionUsuarios.jsx';
import SeccionObjetos from './SeccionObjetos.jsx';
import SeccionCajas from './SeccionCajas.jsx';
import SeccionOfertaSemanal from './SeccionOfertaSemanal.jsx';
import SeccionIntercambiosAdmin from './SeccionIntercambiosAdmin.jsx';
import './PanelAdmin.scss';

const PanelAdmin = () => {
	const { administrador } = useSesion();
	const [seccion, setSeccion] = useState('dashboard');

	if (!administrador) {
		return <div className="admin-acceso-denegado">Acceso denegado.</div>;
	}

	return (
		<div className="panel-admin">
			<div className="panel-admin-cabecera">
				<h1>Panel de Administración</h1>
				<p>Gestiona usuarios, objetos y cajas de la plataforma.</p>
			</div>

			{/* Navegación entre secciones */}
			<div className="panel-admin-tabs">
				<button
					className={`admin-tab ${seccion === 'dashboard' ? 'activo' : ''}`}
					onClick={() => setSeccion('dashboard')}
				>
					Dashboard
				</button>
				<button
					className={`admin-tab ${seccion === 'usuarios' ? 'activo' : ''}`}
					onClick={() => setSeccion('usuarios')}
				>
					Usuarios
				</button>
				<button
					className={`admin-tab ${seccion === 'intercambios' ? 'activo' : ''}`}
					onClick={() => setSeccion('intercambios')}
				>
					Intercambios
				</button>
				<button className={`admin-tab ${seccion === 'oferta' ? 'activo' : ''}`} onClick={() => setSeccion('oferta')}>
					Oferta Semanal
				</button>
				<button className={`admin-tab ${seccion === 'objetos' ? 'activo' : ''}`} onClick={() => setSeccion('objetos')}>
					Objetos
				</button>
				<button className={`admin-tab ${seccion === 'cajas' ? 'activo' : ''}`} onClick={() => setSeccion('cajas')}>
					Cajas
				</button>
			</div>

			{/* Contenido de las secciones */}
			<div className="panel-admin-contenido">
				{seccion === 'dashboard' && <SeccionDashboard />}
				{seccion === 'usuarios' && <SeccionUsuarios />}
				{seccion === 'intercambios' && <SeccionIntercambiosAdmin />}
				{seccion === 'oferta' && <SeccionOfertaSemanal />}
				{seccion === 'objetos' && <SeccionObjetos />}
				{seccion === 'cajas' && <SeccionCajas />}
			</div>
		</div>
	);
};

export default PanelAdmin;
