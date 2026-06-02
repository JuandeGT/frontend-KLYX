import React from 'react';
import ReactDOM from 'react-dom';
import './Confirmacion.scss';

// Usa createPortal para renderizar siempre en document.body.
// Esto evita que el overlay quede atrapado dentro de un ancestro con
// CSS transform (ej: tarjetas con hover translateY), que rompería position:fixed.
// peligroso=true → botón de confirmar en rojo (para acciones destructivas como borrar cuenta)
const Confirmacion = ({ mensaje, detalle, onConfirmar, onCancelar, peligroso = false }) =>
	ReactDOM.createPortal(
		<div className="conf-overlay" onClick={onCancelar}>
			<div className="conf-card" onClick={(e) => e.stopPropagation()}>
				<div className={`conf-icono${peligroso ? ' conf-icono-peligro' : ''}`}>
					{peligroso ? '🗑' : '⚠'}
				</div>
				<h2 className="conf-titulo">¿Estás seguro?</h2>
				<p className="conf-mensaje">{mensaje}</p>
				{detalle && <p className={`conf-detalle${peligroso ? ' conf-detalle-peligro' : ''}`}>{detalle}</p>}
				<div className="conf-botones">
					<button className="conf-btn conf-btn-cancelar" onClick={onCancelar}>
						Cancelar
					</button>
					<button
						className={`conf-btn ${peligroso ? 'conf-btn-peligroso' : 'conf-btn-confirmar'}`}
						onClick={onConfirmar}
					>
						{peligroso ? 'Sí, eliminar' : 'Confirmar'}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);

export default Confirmacion;
