import React from 'react';

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

// Select de objetos del inventario
const SelectObjeto = ({ inventario, cargando, valor, onChange }) => {
	if (cargando) return <p className="cargando-texto">Cargando inventario...</p>;
	if (inventario.length === 0)
		return <p className="crear-aviso">Tu inventario está vacío. Abre cajas para conseguir objetos.</p>;

	return (
		<select className="crear-select" value={valor} onChange={(e) => onChange(e.target.value)} required>
			<option value="">— Selecciona un objeto —</option>
			{ordenarObjetos(inventario).map((obj) => (
				<option key={obj.id} value={obj.id}>
					{obj.nombre} ({obj.tipo}) — {obj.precio} KC
				</option>
			))}
		</select>
	);
};

export default SelectObjeto;
