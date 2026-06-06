// Formatea EUR
const formatearPrecio = (cantidad) => {
	return Number(cantidad).toLocaleString('es-ES', {
		style: 'currency',
		currency: 'EUR',
		useGrouping: true,
	});
};

// Formatea decimal
const formatearDecimal = (cantidad) => {
	return Number(cantidad).toLocaleString('es-ES', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		useGrouping: true,
	});
};

// Formatea fecha formato español
const formatearFecha = (fecha) => {
	if (!fecha) return 'Fecha desconocida';
	const nuevaFecha = new Date(fecha);
	return nuevaFecha.toLocaleDateString('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

// Formatea precio de la web KlyxCoins
const formatearKC = (cantidad) => {
	return `${Number(cantidad).toLocaleString('es-ES')} KC`;
};

export { formatearPrecio, formatearDecimal, formatearFecha, formatearKC };
