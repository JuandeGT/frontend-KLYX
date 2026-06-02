import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useSesion from '../hooks/useSesion.js';
import Inicio from '../pages/Inicio.jsx';
import InicioSesion from '../pages/InicioSesion.jsx';
import Registrarse from '../pages/Registrarse.jsx';
import ListadoCajas from '../pages/ListadoCajas.jsx';
import Vault from '../pages/Vault.jsx';
import Perfil from '../pages/Perfil.jsx';
import Intercambios from '../pages/Intercambios.jsx';
import CrearIntercambio from '../pages/CrearIntercambio.jsx';
import PanelAdmin from '../pages/PanelAdmin.jsx';
import Tienda from '../pages/Tienda.jsx';
import Cargando from '../pages/Cargando.jsx';
import Error from '../pages/Error.jsx';

// Ruta protegida: redirige a /inicio-sesion si no hay sesión activa
const RutaProtegida = ({ element }) => {
	const { sesionIniciada } = useSesion();
	return sesionIniciada ? element : <Navigate to="/inicio-sesion" replace />;
};

// Ruta solo para Admin: redirige a / si el usuario no es administrador
const RutaAdmin = ({ element }) => {
	const { sesionIniciada, administrador } = useSesion();
	if (!sesionIniciada) return <Navigate to="/inicio-sesion" replace />;
	if (!administrador)  return <Navigate to="/" replace />;
	return element;
};

const Rutas = () => {
	const { cargando } = useSesion();

	// Mientras se verifica el token guardado (GET /api/perfil), mostramos spinner
	if (cargando) return <Cargando />;

	return (
		<Routes>
			{/* Rutas públicas */}
			<Route path="/"              element={<Inicio />} />
			<Route path="/inicio-sesion" element={<InicioSesion />} />
			<Route path="/registrarse"   element={<Registrarse />} />
			<Route path="/cajas"         element={<ListadoCajas />} />
			<Route path="/intercambios"  element={<Intercambios />} />

			{/* Rutas protegidas (cualquier usuario autenticado) */}
			<Route path="/vault"             element={<RutaProtegida element={<Vault />} />} />
			<Route path="/perfil"            element={<RutaProtegida element={<Perfil />} />} />
			<Route path="/tienda"            element={<RutaProtegida element={<Tienda />} />} />
			<Route path="/crear-intercambio" element={<RutaProtegida element={<CrearIntercambio />} />} />

			{/* Panel de administración — solo rol Admin */}
			<Route path="/panel-admin" element={<RutaAdmin element={<PanelAdmin />} />} />

			<Route path="*" element={<Error />} />
		</Routes>
	);
};

export default Rutas;
