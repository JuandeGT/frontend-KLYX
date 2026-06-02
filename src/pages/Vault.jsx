import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { formatearKC } from '../utils/formatear.js';
import Cargando from './Cargando.jsx';
import './Vault.scss';

const Vault = () => {
	const [objetos, setObjetos] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(false);

	const [busqueda, setBusqueda] = useState('');
	// 'nombre' | 'precio-asc' | 'precio-desc' | ''
	const [orden, setOrden] = useState('');

	useEffect(() => {
		const cargarInventario = async () => {
			try {
				const respuesta = await api.get('/mi-inventario');
				setObjetos(respuesta.data.data ?? []);
			} catch {
				setError(true);
			} finally {
				setCargando(false);
			}
		};
		cargarInventario();
	}, []);

	const objetosFiltrados = useMemo(() => {
		let lista = [...objetos];

		if (busqueda.trim()) {
			const q = busqueda.toLowerCase();
			lista = lista.filter(
				(o) => o.nombre?.toLowerCase().includes(q) || o.tipo?.toLowerCase().includes(q)
			);
		}

		if (orden === 'nombre')      lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
		if (orden === 'precio-asc')  lista.sort((a, b) => Number(a.precio) - Number(b.precio));
		if (orden === 'precio-desc') lista.sort((a, b) => Number(b.precio) - Number(a.precio));

		return lista;
	}, [objetos, busqueda, orden]);

	// Alterna el botón de precio: vacío → asc → desc → vacío
	const togglePrecio = () => {
		if (orden === 'precio-asc')  { setOrden('precio-desc'); return; }
		if (orden === 'precio-desc') { setOrden('');            return; }
		setOrden('precio-asc');
	};

	const hayFiltros = busqueda.trim() !== '' || orden !== '';

	const limpiar = () => {
		setBusqueda('');
		setOrden('');
	};

	if (cargando) return <Cargando />;

	return (
		<div className="vault-contenedor">
			<div className="vault-cabecera">
				<div>
					<h1>Mi Vault</h1>
					<p>Tu colección de skins obtenidos en KLYX.</p>
				</div>
				{!error && (
					<span className="vault-contador">
						{hayFiltros
							? `${objetosFiltrados.length} / ${objetos.length}`
							: objetos.length
						} objeto{objetos.length !== 1 ? 's' : ''}
					</span>
				)}
			</div>

			{/* Filtros — solo si hay objetos */}
			{!error && objetos.length > 0 && (
				<div className="vault-filtros">
					<input
						type="text"
						className="vault-busqueda"
						placeholder="Buscar por nombre o tipo…"
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
					/>

					<div className="vault-orden">
						<span className="vault-orden-label">Ordenar:</span>

						{/* Botón A-Z: toggle on/off */}
						<button
							className={`vault-orden-btn${orden === 'nombre' ? ' activo' : ''}`}
							onClick={() => setOrden(orden === 'nombre' ? '' : 'nombre')}
						>
							A–Z
						</button>

						{/* Botón Precio: un solo botón que cicla vacío → ↑ → ↓ → vacío */}
						<button
							className={`vault-orden-btn${orden.startsWith('precio') ? ' activo' : ''}`}
							onClick={togglePrecio}
						>
							Precio{orden === 'precio-asc' ? ' ↑' : orden === 'precio-desc' ? ' ↓' : ''}
						</button>

						{/* Limpiar — siempre visible cuando hay algo activo */}
						{hayFiltros && (
							<button className="vault-orden-btn vault-limpiar" onClick={limpiar}>
								✕ Limpiar
							</button>
						)}
					</div>
				</div>
			)}

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

			{!error && objetos.length > 0 && objetosFiltrados.length === 0 && (
				<div className="vault-estado">
					<span className="vault-estado-icono">🔍</span>
					<p>Ningún objeto coincide con tu búsqueda.</p>
				</div>
			)}

			{!error && objetosFiltrados.length > 0 && (
				<div className="vault-grid">
					{/* key incluye el índice como desempate por si hay objetos con id repetido */}
					{objetosFiltrados.map((objeto, i) => (
						<TarjetaObjeto key={`${objeto.id}-${i}`} objeto={objeto} />
					))}
				</div>
			)}
		</div>
	);
};

const TarjetaObjeto = ({ objeto }) => {
	const navegar = useNavigate();

	const vender = () => navegar('/crear-intercambio', {
		state: { objetoId: objeto.id, tipo: 'venta' }
	});

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
				<button className="btn-vender-vault" onClick={vender}>
					Vender
				</button>
			</div>
		</div>
	);
};

export default Vault;
