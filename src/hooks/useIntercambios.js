import { useContext } from 'react';
import { contextoIntercambios } from '../contexts/ProveedorIntercambios.jsx';

const useIntercambios = () => {
	const contexto = useContext(contextoIntercambios);

	if (!contexto) {
		throw new Error('El hook useIntercambios debe ser utilizado dentro de <ProveedorIntercambios>.');
	}

	return contexto;
};

export default useIntercambios;
