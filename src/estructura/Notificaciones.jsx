import React from 'react';
import useNotificacion from '../hooks/useNotificacion.js';
import './Notificaciones.scss';

const Notificaciones = () => {
	const { notificaciones } = useNotificacion();

	if (notificaciones.length === 0) return null;

	return (
		<div className="notificaciones-contenedor">
			{notificaciones.map((item) => (
				<div key={item.id} className={`alerta alerta-${item.tipo}`}>
					<div className="alerta-icono">
						{/* SVGs en linea para evitar las librerías de iconos */}
						{item.tipo === 'error' ? (
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
						) : (
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						)}
					</div>

					<div className="alerta-contenido">
						<div className="alerta-mensaje">{item.mensaje}</div>
					</div>

					{/* Sin botón para cerrar la notificación, se cierra sola a los 3 segundos */}
					<div className="alerta-barra" style={{ animationDuration: '3000ms' }} />
				</div>
			))}
		</div>
	);
};

export default Notificaciones;
