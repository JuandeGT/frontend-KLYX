import React from 'react';
import { Routes, Route } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import Inicio from '../pages/Inicio.jsx';
import InicioSesion from '../pages/InicioSesion.jsx';
import Registrarse from '../pages/Registrarse.jsx';
import ListadoCajas from '../pages/ListadoCajas.jsx';
import Inventario from '../pages/Inventario.jsx';
import Perfil from '../pages/Perfil.jsx';
import Intercambios from '../pages/Intercambios.jsx';
import CrearIntercambio from '../pages/CrearIntercambio.jsx';
import PanelAdmin from '../pages/PanelAdmin.jsx';
import Tienda from '../pages/Tienda.jsx';
import Cargando from '../pages/Cargando.jsx';
import Error from '../pages/Error.jsx';

const Rutas = () => {
	const { cargando, sesionIniciada, administrador } = useSesion();

	if (cargando) return <Cargando />;

	return (
		<Routes>
			<Route path="/" element={<Inicio />} />
			<Route path="/inicio-sesion" element={<InicioSesion />} />
			<Route path="/registrarse" element={<Registrarse />} />
			<Route path="/cajas" element={<ListadoCajas />} />
			<Route path="/intercambios" element={<Intercambios />} />

			{sesionIniciada && (
				<>
					<Route path="/inventario" element={<Inventario />} />
					<Route path="/perfil" element={<Perfil />} />
					<Route path="/tienda" element={<Tienda />} />
					<Route path="/crear-intercambio" element={<CrearIntercambio />} />
					{administrador && <Route path="/panel-admin" element={<PanelAdmin />} />}
				</>
			)}

			<Route path="*" element={<Error />} />
		</Routes>
	);
};

export default Rutas;
