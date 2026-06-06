import React, { useEffect, useState } from 'react';
// location.state: Cuando navegas de una página a otra con React Router, puedes llevar una "nota" escondida.
// Es como pasarle un papelito al siguiente componente al cambiar de clase
// En TarjetaInventario hay un botón "Vender" que hace:
//   navegar('/crear-intercambio', { state: { objetoId: 42, tipo: 'venta' } })
// Y aquí, en CrearIntercambio, lo recogemos con:
//   const estadoNavegacion = location.state ?? {};
//
// Así el formulario aparece ya con ese objeto preseleccionado, sin que el usuario tenga que buscarlo otra vez.
// Si el usuario entra directamente a /crear-intercambio (sin venir del Inventario), location.state es null y el ?? {} lo convierte en un objeto vacío para no romper nada.
import { useNavigate, useLocation } from 'react-router-dom';
import useIntercambios from '../hooks/useIntercambios.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import SeccionForm from './SeccionForm.jsx';
import SelectObjeto from './SelectObjeto.jsx';
import SelectObjetosMercado from './SelectObjetosMercado.jsx';
import InputKC from './InputKC.jsx';
import './CrearIntercambio.scss';

const CrearIntercambio = () => {
	const { crearIntercambio } = useIntercambios();
	const { notificar } = useNotificacion();
	const navegar = useNavigate();
	const location = useLocation();

	const [inventario, setInventario] = useState([]);
	const [cargandoInv, setCargandoInv] = useState(true);
	const [objetosMercado, setObjetosMercado] = useState([]);
	const [cargandoMercado, setCargandoMercado] = useState(true);

	// Formulario, puede llegar pre-rellenado desde el inventario via location.state
	const estadoNavegacion = location.state ?? {};
	const [objetoOfrecidoId, setObjetoOfrecidoId] = useState(String(estadoNavegacion.objetoId ?? ''));
	const [monedasOfrecidas, setMonedasOfrecidas] = useState(0);
	const [objetoSolicitadoId, setObjetoSolicitadoId] = useState('');
	const [monedasSolicitadas, setMonedasSolicitadas] = useState(0);

	// El tipo puede venir pre-seleccionado desde el inventario
	const [tipo, setTipo] = useState(estadoNavegacion.tipo ?? 'venta');
	const [enviando, setEnviando] = useState(false);
	const [confirmar, setConfirmar] = useState(false);

	// Carga inventario propio y catálogo global en paralelo con Promise.all
	useEffect(() => {
		const cargarDatos = async () => {
			// Api directo, no hay hook porque solo este componente usa este endpoint
			await Promise.all([
				api
					.get('/mi-inventario')
					.then((respuesta) => setInventario(respuesta.data.data ?? []))
					.catch(() => notificar('No se pudo cargar tu inventario.', 'error'))
					.finally(() => setCargandoInv(false)),
				api
					.get('/objetos')
					.then((respuesta) => setObjetosMercado(respuesta.data.data ?? []))
					.catch(() => {})
					.finally(() => setCargandoMercado(false)),
			]);
		};
		cargarDatos();
	}, []);

	const resetForm = () => {
		setObjetoOfrecidoId('');
		setMonedasOfrecidas(0);
		setObjetoSolicitadoId('');
		setMonedasSolicitadas(0);
	};

	const cambiarTipo = (nuevoTipo) => {
		setTipo(nuevoTipo);
		resetForm();
	};

	const enviarFormulario = (e) => {
		e.preventDefault();

		if (tipo === 'venta' && !objetoOfrecidoId) {
			notificar('Selecciona el objeto que quieres vender.', 'error');
			return;
		}
		if (tipo === 'venta' && monedasSolicitadas <= 0) {
			notificar('Indica cuántas Klyx Coins quieres recibir.', 'error');
			return;
		}
		if (tipo === 'trueque' && !objetoOfrecidoId) {
			notificar('Selecciona el objeto que ofreces.', 'error');
			return;
		}
		if (tipo === 'trueque' && !objetoSolicitadoId) {
			notificar('Introduce el ID del objeto que solicitas.', 'error');
			return;
		}
		if (tipo === 'compra' && monedasOfrecidas <= 0) {
			notificar('Indica cuántas Klyx Coins ofreces.', 'error');
			return;
		}
		if (tipo === 'compra' && !objetoSolicitadoId) {
			notificar('Introduce el ID del objeto que deseas comprar.', 'error');
			return;
		}

		setConfirmar(true);
	};

	const publicarOferta = async () => {
		setConfirmar(false);
		setEnviando(true);
		const creado = await crearIntercambio({
			objeto_ofrecido_id: objetoOfrecidoId || null,
			monedas_ofrecidas: Number(monedasOfrecidas),
			objeto_solicitado_id: objetoSolicitadoId || null,
			monedas_solicitadas: Number(monedasSolicitadas),
		});
		setEnviando(false);
		if (creado) navegar('/intercambios');
	};

	const etiquetaTipo = {
		venta: 'Venta (objeto → KC)',
		trueque: 'Trueque (objeto → objeto)',
		compra: 'Compra (KC → objeto)',
	};

	return (
		<>
			{confirmar && (
				<Confirmacion
					mensaje={`Vas a publicar una oferta de tipo "${etiquetaTipo[tipo]}".`}
					detalle="La oferta será visible para todos los usuarios del mercado."
					onConfirmar={publicarOferta}
					onCancelar={() => setConfirmar(false)}
				/>
			)}
			<div className="crear-intercambio-contenedor">
				<div className="crear-intercambio-card">
					<h1 className="crear-titulo">Nueva oferta</h1>
					<p className="crear-subtitulo">Elige el tipo de intercambio y configura los términos.</p>

					<div className="tipo-selector">
						<button
							type="button"
							className={`tipo-btn ${tipo === 'venta' ? 'activo' : ''}`}
							onClick={() => cambiarTipo('venta')}
						>
							<span className="tipo-icono">💰</span>
							<strong>Venta</strong>
							<small>Objeto → KC</small>
						</button>
						<button
							type="button"
							className={`tipo-btn ${tipo === 'trueque' ? 'activo' : ''}`}
							onClick={() => cambiarTipo('trueque')}
						>
							<span className="tipo-icono">⇄</span>
							<strong>Trueque</strong>
							<small>Objeto → Objeto</small>
						</button>
						<button
							type="button"
							className={`tipo-btn ${tipo === 'compra' ? 'activo' : ''}`}
							onClick={() => cambiarTipo('compra')}
						>
							<span className="tipo-icono">🛒</span>
							<strong>Compra</strong>
							<small>KC → Objeto</small>
						</button>
					</div>

					<form className="crear-form" onSubmit={enviarFormulario}>
						{tipo === 'venta' && (
							<>
								<SeccionForm titulo="Objeto que ofreces">
									<SelectObjeto
										inventario={inventario}
										cargando={cargandoInv}
										valor={objetoOfrecidoId}
										onChange={setObjetoOfrecidoId}
									/>
								</SeccionForm>

								<SeccionForm titulo="KC que solicitas a cambio">
									<InputKC valor={monedasSolicitadas} onChange={setMonedasSolicitadas} />
								</SeccionForm>
							</>
						)}

						{tipo === 'trueque' && (
							<>
								<SeccionForm titulo="Objeto que ofreces">
									<SelectObjeto
										inventario={inventario}
										cargando={cargandoInv}
										valor={objetoOfrecidoId}
										onChange={setObjetoOfrecidoId}
									/>
								</SeccionForm>

								<SeccionForm titulo="KC adicionales que ofreces (0 = ninguna)">
									<InputKC valor={monedasOfrecidas} onChange={setMonedasOfrecidas} />
								</SeccionForm>

								<SeccionForm titulo="Objeto que solicitas a cambio">
									<SelectObjetosMercado
										objetos={objetosMercado}
										cargando={cargandoMercado}
										valor={objetoSolicitadoId}
										onChange={setObjetoSolicitadoId}
									/>
								</SeccionForm>

								<SeccionForm titulo="KC adicionales que pides (0 = ninguna)">
									<InputKC valor={monedasSolicitadas} onChange={setMonedasSolicitadas} />
								</SeccionForm>
							</>
						)}

						{tipo === 'compra' && (
							<>
								<SeccionForm titulo="KC que ofreces">
									<InputKC valor={monedasOfrecidas} onChange={setMonedasOfrecidas} />
								</SeccionForm>

								<SeccionForm titulo="Objeto que deseas comprar">
									<SelectObjetosMercado
										objetos={objetosMercado}
										cargando={cargandoMercado}
										valor={objetoSolicitadoId}
										onChange={setObjetoSolicitadoId}
									/>
								</SeccionForm>
							</>
						)}

						<div className="crear-acciones">
							<button type="button" className="btn-crear-cancelar" onClick={() => navegar('/intercambios')}>
								Cancelar
							</button>
							<button type="submit" className="btn-crear-publicar" disabled={enviando}>
								{enviando ? 'Publicando...' : 'Publicar oferta'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
};

export default CrearIntercambio;
