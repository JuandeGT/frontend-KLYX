import React from 'react';
import ReactDOM from 'react-dom';
import './Confirmacion.scss';

// ⚠️ NO está en la referencia del profesor.
//
// ¿Qué hace createPortal?
// Normalmente en React un componente se "monta" dentro de su componente padre en el HTML.
// createPortal hace una excepción: monta este componente directamente en document.body
// (fuera de toda la estructura de la página), aunque en el código JSX esté dentro de otra cosa.
//
// ¿Por qué lo necesitamos?
// position:fixed se supone que fija algo en la pantalla... pero si algún contenedor
// padre tiene CSS transform (por ejemplo una tarjeta con hover translateY(-4px)),
// position:fixed deja de funcionar y el overlay aparece en sitios raros.
// Al renderizar en document.body no hay ningún padre con transform que nos moleste.
//
// Podríamos quitar el portal y usar un <div> normal, pero si el modal se abre
// dentro de una tarjeta con hover el overlay se descuadraría.
//
// Props:
//   mensaje    — texto principal (ej: "Vas a eliminar este usuario")
//   detalle    — texto secundario más pequeño (opcional)
//   onConfirmar — función que se llama al pulsar Confirmar
//   onCancelar  — función que se llama al pulsar Cancelar o el fondo
//   peligroso   — si es true, el botón de confirmar sale en rojo y dice "Sí, eliminar"
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
