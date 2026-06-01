import React, { useEffect, useState } from 'react';
import api from '../utils/api.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './Vault.scss';

const Vault = () => {
	const [objetos, setObjetos] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const cargarInventario = async () => {
			try {
				const respuesta = await api.get('/mi-inventario');
				setObjetos(respuesta.data.data);
			} catch {
				setError(true);
			} finally {
				setCargando(false);
			}
		};

		cargarInventario();
	}, []);

	if (cargando) return <Cargando />;

	return (
		<div className="vault-contenedor">
			<div className="vault-cabecera">
				<div>
					<h1>Mi Vault</h1>
					<p>Tu colección de skins obtenidos en KLYX.</p>
				</div>
				{!error && (
					<span className="vault-contador">{objetos.length} objeto{objetos.length !== 1 ? 's' : ''}</span>
				)}
			</div>

			{error && (
				<div className="vault-estado">
					<span className="vault-estado-icono">⚠️</span>
					<p>No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.</p>
				</div>
			)}

			{!error && objetos.length === 0 && (
				<div className="vault-estado">
					<span className="vault-estado-icono">📦</span>
					<p>Tu vault está vacío. ¡Abre una caja para conseguir tu primer skin!</p>
				</div>
			)}

			{!error && objetos.length > 0 && (
				<div className="vault-grid">
					{objetos.map((objeto) => (
						<TarjetaObjeto key={objeto.id} objeto={objeto} />
					))}
				</div>
			)}
		</div>
	);
};

const TarjetaObjeto = ({ objeto }) => {
	return (
		<div className="tarjeta-objeto-vault">
			<div className="objeto-imagen-vault">
				{objeto.imagen
					? <img src={objeto.imagen} alt={objeto.nombre} />
					: <span className="objeto-icono">🔪</span>
				}
			</div>

			<div className="objeto-info-vault">
				{objeto.tipo && (
					<span className="objeto-tipo-badge">{objeto.tipo}</span>
				)}
				<h3 className="objeto-nombre-vault">{objeto.nombre}</h3>
				{objeto.precio > 0 && (
					<p className="objeto-precio-vault">{formatearKC(objeto.precio)}</p>
				)}
			</div>
		</div>
	);
};

export default Vault;
