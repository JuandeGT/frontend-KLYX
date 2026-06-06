import React from 'react';
import { formatearKC } from '../utils/formatear.js';

// Ordena: cuchillos primero, pegatinas después, dentro de cada grupo A-Z
const ordenarObjetos = (lista) => {
	const prioridad = (tipo = '') => {
		const t = tipo.toLowerCase();
		if (t.includes('cuchillo')) return 0;
		if (t.includes('pegatina')) return 1;
		return 2;
	};
	return [...lista].sort((a, b) => {
		const diff = prioridad(a.tipo) - prioridad(b.tipo);
		return diff !== 0 ? diff : a.nombre.localeCompare(b.nombre, 'es');
	});
};

// Select con todos los objetos del catálogo
const SelectObjetosMercado = ({ objetos, cargando, valor, onChange }) => {
	if (cargando) return <p className="cargando-texto">Cargando catálogo...</p>;
	if (objetos.length === 0) return <p className="crear-aviso">No hay objetos disponibles en el catálogo.</p>;

	return (
		<select className="crear-select" value={valor} onChange={(e) => onChange(e.target.value)} required>
			<option value="">— Selecciona un objeto —</option>
			{ordenarObjetos(objetos).map((obj) => (
				<option key={obj.id} value={obj.id}>
					{obj.nombre} ({obj.tipo}) — {formatearKC(obj.precio)}
				</option>
			))}
		</select>
	);
};

export default SelectObjetosMercado;
