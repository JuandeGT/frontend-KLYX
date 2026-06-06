import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatearKC } from '../utils/formatear.js';
import './Inventario.scss';

const TarjetaInventario = ({ objeto }) => {
	const navegar = useNavigate();

	// Al pulsar en vender navega al mercado con el formulario iniciado con ese objeto ya elegido y tipo venta
	const vender = () =>
		navegar('/crear-intercambio', {
			state: { objetoId: objeto.id, tipo: 'venta' },
		});

	return (
		<div className="tarjeta-objeto-inventario">
			<div className="objeto-imagen-inventario">{objeto.imagen && <img src={objeto.imagen} alt={objeto.nombre} />}</div>

			<div className="objeto-info-inventario">
				{objeto.tipo && <span className="objeto-tipo-badge">{objeto.tipo}</span>}
				<h3 className="objeto-nombre-inventario">{objeto.nombre}</h3>
				{objeto.precio > 0 && <p className="objeto-precio-inventario">{formatearKC(objeto.precio)}</p>}
				<button className="btn-vender-inventario" onClick={vender}>
					Vender
				</button>
			</div>
		</div>
	);
};

export default TarjetaInventario;
