// Inventario personal del usuario. Muestra todos los objetos obtenidos al abrir cajas.
// Incluye filtro por nombre/tipo y orden (A-Z, precio ↑↓) calculados en memoria con useMemo.
// useMemo: no está en la referencia base — evita recalcular el filtrado en cada render.
// Solo recalcula cuando cambian objetos, busqueda u orden.
import React, { useEffect, useState, useMemo } from 'react';
import api from '../utils/api.js';
import Cargando from './Cargando.jsx';
import TarjetaInventario from './TarjetaInventario.jsx';
import './Inventario.scss';

const Inventario = () => {
	const [objetos, setObjetos] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(false);

	const [busqueda, setBusqueda] = useState('');
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
			const texto = busqueda.toLowerCase();
			lista = lista.filter(
				(o) => o.nombre?.toLowerCase().includes(texto) || o.tipo?.toLowerCase().includes(texto)
			);
		}

		if (orden === 'nombre')      lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
		if (orden === 'precio-asc')  lista.sort((a, b) => Number(a.precio) - Number(b.precio));
		if (orden === 'precio-desc') lista.sort((a, b) => Number(b.precio) - Number(a.precio));

		return lista;
	}, [objetos, busqueda, orden]);

	// Ciclo del botón "Precio": sin orden → ascendente → descendente → sin orden
	const togglePrecio = () => {
		if (orden === 'precio-asc')  { setOrden('precio-desc'); return; }
		if (orden === 'precio-desc') { setOrden('');            return; }
		setOrden('precio-asc');
	};

	const hayFiltros = busqueda.trim() !== '' || orden !== '';

	const limpiar = () => { setBusqueda(''); setOrden(''); };

	if (cargando) return <Cargando />;

	return (
		<div className="inventario-contenedor">
			<div className="inventario-cabecera">
				<div>
					<h1>Mi Inventario</h1>
					<p>Tu colección de skins obtenidos en KLYX.</p>
				</div>
				{!error && (
					<span className="inventario-contador">
						{hayFiltros
							? `${objetosFiltrados.length} / ${objetos.length}`
							: objetos.length
						} objeto{objetos.length !== 1 ? 's' : ''}
					</span>
				)}
			</div>

			{/* Filtros — solo si hay objetos */}
			{!error && objetos.length > 0 && (
				<div className="inventario-filtros">
					<input
						type="text"
						className="inventario-busqueda"
						placeholder="Buscar por nombre o tipo…"
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
					/>

					<div className="inventario-orden">
						<span className="inventario-orden-label">Ordenar:</span>

						<button
							className={`inventario-orden-btn${orden === 'nombre' ? ' activo' : ''}`}
							onClick={() => setOrden(orden === 'nombre' ? '' : 'nombre')}
						>
							A–Z
						</button>

						<button
							className={`inventario-orden-btn${orden.startsWith('precio') ? ' activo' : ''}`}
							onClick={togglePrecio}
						>
							Precio{orden === 'precio-asc' ? ' ↑' : orden === 'precio-desc' ? ' ↓' : ''}
						</button>

						{hayFiltros && (
							<button className="inventario-orden-btn inventario-limpiar" onClick={limpiar}>
								✕ Limpiar
							</button>
						)}
					</div>
				</div>
			)}

			{error && (
				<div className="inventario-estado">
					<span className="inventario-estado-icono">⚠️</span>
					<p>No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.</p>
				</div>
			)}

			{!error && objetos.length === 0 && (
				<div className="inventario-estado">
					<span className="inventario-estado-icono">📦</span>
					<p>Tu inventario está vacío. ¡Abre una caja para conseguir tu primer skin!</p>
				</div>
			)}

			{!error && objetos.length > 0 && objetosFiltrados.length === 0 && (
				<div className="inventario-estado">
					<span className="inventario-estado-icono">🔍</span>
					<p>Ningún objeto coincide con tu búsqueda.</p>
				</div>
			)}

			{!error && objetosFiltrados.length > 0 && (
				<div className="inventario-grid">
					{/* key incluye el índice como desempate por si hay objetos con id repetido */}
					{objetosFiltrados.map((objeto, i) => (
						<TarjetaInventario key={`${objeto.id}-${i}`} objeto={objeto} />
					))}
				</div>
			)}
		</div>
	);
};

export default Inventario;
