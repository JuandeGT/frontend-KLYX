import React, { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import useNotificacion from '../hooks/useNotificacion.js';

const contextoSesion = createContext();

const ProveedorSesion = ({ children }) => {
	const { notificar } = useNotificacion();
	const navegar = useNavigate();

	const sesionInicial = { nombre: '', email: '', password: '' };
	const [datosSesion, setDatosSesion] = useState(sesionInicial);
	const [usuario, setUsuario] = useState(null);
	const [sesionIniciada, setSesionIniciada] = useState(false);
	const [administrador, setAdministrador] = useState(false);
	const [cargando, setCargando] = useState(true);

	// ——— CREAR CUENTA ———
	// Llama a POST /api/registro con nombre, email y password.
	const crearCuenta = async () => {
		try {
			await api.post('/registro', {
				nombre: datosSesion.nombre,
				email: datosSesion.email,
				password: datosSesion.password,
			});
			notificar('Cuenta creada. Ya puedes iniciar sesión.');
			setDatosSesion(sesionInicial);
			navegar('/inicio-sesion');
		} catch (error) {
			const msg = error.response?.data?.message || 'Error al crear la cuenta.';
			notificar(msg, 'error');
		}
	};

	// ——— INICIAR SESIÓN ———
	// 1. POST /api/login → recibe { data: { token, usuario, rol } }
	// 2. Guarda el token en localStorage (el interceptor de api.js lo inyectará en adelante)
	// 3. Llama a obtenerPerfil() para hidratar el estado con los datos completos (saldo, etc.)
	const iniciarSesion = async () => {
		try {
			const respuesta = await api.post('/login', {
				email: datosSesion.email,
				password: datosSesion.password,
			});

			const { token, usuario: usuarioRaw, rol } = respuesta.data.data;

			localStorage.setItem('klyx_token', token);

			const esAdmin = Array.isArray(rol) ? rol.includes('Admin') : rol === 'Admin';
			setUsuario({ ...usuarioRaw, rol });
			setSesionIniciada(true);
			setAdministrador(esAdmin);

			notificar('Sesión iniciada correctamente.');
			setDatosSesion(sesionInicial);
			navegar('/');
		} catch (error) {
			const msg = error.response?.data?.message || 'Credenciales incorrectas.';
			notificar(msg, 'error');
		}
	};

	// ——— CERRAR SESIÓN ———
	// POST /api/logout revoca el token en el servidor (tabla personal_access_tokens).
	// Limpiamos localStorage independientemente de si la petición falla (por si el token ya expiró).
	const cerrarSesion = async () => {
		try {
			await api.post('/logout');
		} catch {
			// El token puede haber expirado; limpiamos igualmente
		} finally {
			localStorage.removeItem('klyx_token');
			setUsuario(null);
			setSesionIniciada(false);
			setAdministrador(false);
			navegar('/');
			notificar('Sesión cerrada correctamente.');
		}
	};

	// ——— OBTENER PERFIL ———
	// Llama a GET /api/perfil para hidratar el estado con los datos actualizados del usuario.
	// Se usa al montar el componente para restaurar la sesión si hay token en localStorage.
	const obtenerPerfil = async () => {
		try {
			const respuesta = await api.get('/perfil');
			const usuarioCompleto = respuesta.data.data;
			const esAdmin = Array.isArray(usuarioCompleto.rol)
				? usuarioCompleto.rol.includes('Admin')
				: usuarioCompleto.rol === 'Admin';

			setUsuario(usuarioCompleto);
			setSesionIniciada(true);
			setAdministrador(esAdmin);
		} catch {
			// Token inválido o expirado: limpiamos
			localStorage.removeItem('klyx_token');
			setSesionIniciada(false);
		} finally {
			setCargando(false);
		}
	};

	// Al montar el proveedor: si hay token guardado, intentamos restaurar la sesión
	// sin obligar al usuario a volver a iniciar sesión tras refrescar la página.
	useEffect(() => {
		const token = localStorage.getItem('klyx_token');
		if (token) {
			obtenerPerfil();
		} else {
			setCargando(false);
		}
	}, []);

	const actualizarDato = (evento) => {
		const { name, value } = evento.target;
		setDatosSesion({ ...datosSesion, [name]: value });
	};

	const datosProveer = {
		crearCuenta,
		iniciarSesion,
		cerrarSesion,
		actualizarDato,
		datosSesion,
		sesionIniciada,
		usuario,
		administrador,
		cargando,
		obtenerPerfil,
	};

	return (
		<contextoSesion.Provider value={datosProveer}>
			{children}
		</contextoSesion.Provider>
	);
};

export default ProveedorSesion;
export { contextoSesion };
