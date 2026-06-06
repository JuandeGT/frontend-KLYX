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
			notificar(error.response?.data?.message || 'Error al crear la cuenta.', 'error');
		}
	};

	// El login devuelve el token, lo guardamos en el localStorage para usarlo luego y obtenemos el perfil
	const iniciarSesion = async () => {
		try {
			const respuesta = await api.post('/login', {
				email: datosSesion.email,
				password: datosSesion.password,
			});

			// respuesta.data.data: Axios guarda el cuerpo HTTP en .data y Laravel lo envuelve además en { data: ... } por eso hay que hacer .data.data
			const { token, usuario: datosUsuario, rol } = respuesta.data.data;

			localStorage.setItem('klyx_token', token);

			const esAdmin = Array.isArray(rol) ? rol.includes('Admin') : rol === 'Admin';
			setUsuario({ ...datosUsuario, rol });
			setSesionIniciada(true);
			setAdministrador(esAdmin);

			notificar('Sesión iniciada correctamente.');
			setDatosSesion(sesionInicial);
			navegar('/');
		} catch (error) {
			notificar(error.response?.data?.message || 'Credenciales incorrectas.', 'error');
		}
	};

	const limpiarSesion = (mensaje) => {
		localStorage.removeItem('klyx_token');
		setUsuario(null);
		setSesionIniciada(false);
		setAdministrador(false);
		navegar('/');
		notificar(mensaje);
	};

	// Limpiamos el token de localStorage
	const cerrarSesion = async () => {
		try {
			await api.post('/logout');
		} catch {
			// El token puede haber expirado, lo limpiamos igualmente
		} finally {
			limpiarSesion('Sesión cerrada correctamente.');
		}
	};

	const borrarCuenta = async () => {
		try {
			await api.delete('/cuenta');
		} catch {
			// Si el servidor falla igualmente limpiamos el localStorage
		} finally {
			limpiarSesion('Cuenta eliminada correctamente.');
		}
	};

	const obtenerPerfil = async () => {
		try {
			const respuesta = await api.get('/perfil');
			// respuesta.data.data: mismo motivo que en iniciarSesion
			const usuarioCompleto = respuesta.data.data;
			const esAdmin = Array.isArray(usuarioCompleto.rol)
				? usuarioCompleto.rol.includes('Admin')
				: usuarioCompleto.rol === 'Admin';

			setUsuario(usuarioCompleto);
			setSesionIniciada(true);
			setAdministrador(esAdmin);
		} catch {
			localStorage.removeItem('klyx_token');
			setSesionIniciada(false);
		} finally {
			setCargando(false);
		}
	};

	// Al montar el proveedor comprobamos si hay token guardado, si lo hay restauramos la sesión sin obligar al usuario a volver a iniciar sesión tras refrescar la página
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
		borrarCuenta,
		actualizarDato,
		datosSesion,
		sesionIniciada,
		usuario,
		administrador,
		cargando,
		obtenerPerfil,
	};

	return <contextoSesion.Provider value={datosProveer}>{children}</contextoSesion.Provider>;
};

export default ProveedorSesion;
export { contextoSesion };
