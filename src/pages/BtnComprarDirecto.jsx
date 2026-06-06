import React, { useState } from 'react';
import useSesion from '../hooks/useSesion.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';

// Botón de compra directa de la Selección Semanal.
// Llama a POST /api/objetos/{id}/comprar-directo con el Bearer token de Sanctum.
const BtnComprarDirecto = ({ objetoId, nombreObjeto, precioObjeto }) => {
	const { sesionIniciada, obtenerPerfil } = useSesion();
	const { notificar } = useNotificacion();
	const [comprando, setComprando] = useState(false);
	const [confirmar, setConfirmar] = useState(false);

	const pedirConfirmacion = () => {
		if (!sesionIniciada) {
			notificar('Inicia sesión para comprar.', 'error');
			return;
		}
		setConfirmar(true);
	};

	const comprar = async () => {
		setConfirmar(false);
		setComprando(true);
		try {
			await api.post(`/objetos/${objetoId}/comprar-directo`);
			notificar('¡Objeto añadido a tu Inventario!');
			await obtenerPerfil();
		} catch (error) {
			const msg = error.response?.data?.message || 'No se pudo completar la compra.';
			notificar(msg, 'error');
		} finally {
			setComprando(false);
		}
	};

	return (
		<>
			{confirmar && (
				<Confirmacion
					mensaje={`Vas a comprar "${nombreObjeto}".`}
					detalle={`Coste: ${formatearKC(precioObjeto)}`}
					onConfirmar={comprar}
					onCancelar={() => setConfirmar(false)}
				/>
			)}
			<button className="btn-comprar" onClick={pedirConfirmacion} disabled={comprando}>
				{comprando ? '...' : 'Comprar ahora'}
			</button>
		</>
	);
};

export default BtnComprarDirecto;
