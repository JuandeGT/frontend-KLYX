// Formatea un número como moneda EUR (ej: 1.250,00 €)
const formatearPrecio = (cantidad) => {
	return Number(cantidad).toLocaleString('es-ES', {
		style: 'currency',
		currency: 'EUR',
		useGrouping: true,
	});
};

// Formatea un número con decimales opcionales (ej: 1.250,5)
const formatearDecimal = (cantidad) => {
	return Number(cantidad).toLocaleString('es-ES', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		useGrouping: true,
	});
};

// Formatea una fecha ISO a formato legible en español (ej: 4 de mayo de 2026)
const formatearFecha = (fecha) => {
	if (!fecha) return 'Fecha desconocida';
	const nuevaFecha = new Date(fecha);
	return nuevaFecha.toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

// Formatea un número como Klyx Coins (ej: 1.250 KC)
const formatearKC = (cantidad) => {
	return `${Number(cantidad).toLocaleString('es-ES')} KC`;
};

export { formatearPrecio, formatearDecimal, formatearFecha, formatearKC };
