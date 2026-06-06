import React, { useEffect, useState } from 'react';
// ⚠️ useLocation — NO está en la referencia del profesor.
//
// ¿Qué es location.state?
// Cuando navegas de una página a otra con React Router, puedes llevar una "nota" escondida.
// Es como pasarle un papelito al siguiente componente al cambiar de clase:
// "oye, el usuario quería vender el objeto con id 42".
//
// En TarjetaInventario hay un botón "Vender" que hace:
//   navegar('/crear-intercambio', { state: { objetoId: 42, tipo: 'venta' } })
//
// Y aquí, en CrearIntercambio, lo recogemos con:
//   const estadoNavegacion = location.state ?? {};
//
// Así el formulario aparece ya con ese objeto preseleccionado, sin que el usuario
// tenga que buscarlo otra vez.
// Si el usuario entra directamente a /crear-intercambio (sin venir del Inventario),
// location.state es null y el ?? {} lo convierte en un objeto vacío para no romper nada.
import { useNavigate, useLocation } from 'react-router-dom';
import useIntercambios from '../hooks/useIntercambios.js';
import useNotificacion from '../hooks/useNotificacion.js';
import { formatearKC } from '../utils/formatear.js';
import api from '../utils/api.js';
import Confirmacion from '../estructura/Confirmacion.jsx';
import './CrearIntercambio.scss';

const CrearIntercambio = () => {
	const { crearIntercambio } = useIntercambios();
	const { notificar } = useNotificacion();
	const navegar = useNavigate();
	const location = useLocation();

	const [inventario, setInventario] = useState([]);
	const [cargandoInv, setCargandoInv] = useState(true);
	// Objetos del catálogo global (todos los objetos del juego) para el select de "pide"
	const [objetosMercado, setObjetosMercado] = useState([]);
	const [cargandoMercado, setCargandoMercado] = useState(true);

	// Formulario — puede llegar pre-rellenado desde el Inventario via location.state
	const estadoNavegacion = location.state ?? {};
	const [objetoOfrecidoId, setObjetoOfrecidoId] = useState(String(estadoNavegacion.objetoId ?? ''));
	const [monedasOfrecidas, setMonedasOfrecidas] = useState(0);
	const [objetoSolicitadoId, setObjetoSolicitadoId] = useState('');
	const [monedasSolicitadas, setMonedasSolicitadas] = useState(0);

	// El tipo puede venir pre-seleccionado desde el Inventario ('venta').
	// Si no, por defecto es 'venta' que es el caso más habitual.
	const [tipo, setTipo] = useState(estadoNavegacion.tipo ?? 'venta');
	const [enviando, setEnviando] = useState(false);
	const [confirmar, setConfirmar] = useState(false);

	// Carga inventario propio y catálogo global en paralelo con Promise.all
	useEffect(() => {
		const cargarDatos = async () => {
			await Promise.all([
				api.get('/mi-inventario')
					.then((respuesta) => setInventario(respuesta.data.data ?? []))
					.catch(() => notificar('No se pudo cargar tu inventario.', 'error'))
					.finally(() => setCargandoInv(false)),
				api.get('/objetos')
					.then((respuesta) => setObjetosMercado(respuesta.data.data ?? []))
					.catch(() => {})  // silencioso: el select quedará vacío
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

		// Validaciones básicas en cliente
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

		// Validaciones superadas → abrimos confirmación
		setConfirmar(true);
	};

	const publicarOferta = async () => {
		setConfirmar(false);
		setEnviando(true);
		// El formulario no puede cambiar mientras el modal de confirmación está visible,
		// así que leemos el estado directamente en vez de guardarlo en un estado extra
		const creado = await crearIntercambio({
			objeto_ofrecido_id:   objetoOfrecidoId   || null,
			monedas_ofrecidas:    Number(monedasOfrecidas),
			objeto_solicitado_id: objetoSolicitadoId || null,
			monedas_solicitadas:  Number(monedasSolicitadas),
		});
		setEnviando(false);
		if (creado) navegar('/intercambios');
	};

	const etiquetaTipo = { venta: 'Venta (objeto → KC)', trueque: 'Trueque (objeto → objeto)', compra: 'Compra (KC → objeto)' };

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

				{/* Selector de tipo */}
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
					{/* ——— VENTA ——— */}
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
								<InputKC
									valor={monedasSolicitadas}
									onChange={setMonedasSolicitadas}
								/>
							</SeccionForm>
						</>
					)}

					{/* ——— TRUEQUE ——— */}
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

					{/* ——— COMPRA ——— */}
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
						<button
							type="button"
							className="btn-crear-cancelar"
							onClick={() => navegar('/intercambios')}
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="btn-crear-publicar"
							disabled={enviando}
						>
							{enviando ? 'Publicando...' : 'Publicar oferta'}
						</button>
					</div>
				</form>
			</div>
		</div>
		</>
	);
};

// ——— Sub-componentes del formulario ———

// Orden: cuchillos primero, pegatinas después, resto al final; dentro de cada grupo A-Z
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

const SeccionForm = ({ titulo, children }) => (
	<div className="seccion-form">
		<label className="seccion-label">{titulo}</label>
		{children}
	</div>
);

const SelectObjeto = ({ inventario, cargando, valor, onChange }) => {
	if (cargando) return <p className="cargando-texto">Cargando inventario...</p>;
	if (inventario.length === 0) return (
		<p className="crear-aviso">Tu inventario está vacío. Abre cajas para conseguir objetos.</p>
	);

	return (
		<select
			className="crear-select"
			value={valor}
			onChange={(e) => onChange(e.target.value)}
			required
		>
			<option value="">— Selecciona un objeto —</option>
			{ordenarObjetos(inventario).map((obj) => (
				<option key={obj.id} value={obj.id}>
					{obj.nombre} ({obj.tipo}) — {obj.precio} KC
				</option>
			))}
		</select>
	);
};

// Select con todos los objetos del catálogo global (para "pide" en trueque y compra)
const SelectObjetosMercado = ({ objetos, cargando, valor, onChange }) => {
	if (cargando) return <p className="cargando-texto">Cargando catálogo...</p>;
	if (objetos.length === 0) return (
		<p className="crear-aviso">No hay objetos disponibles en el catálogo.</p>
	);

	return (
		<select
			className="crear-select"
			value={valor}
			onChange={(e) => onChange(e.target.value)}
			required
		>
			<option value="">— Selecciona un objeto —</option>
			{ordenarObjetos(objetos).map((obj) => (
				<option key={obj.id} value={obj.id}>
					{obj.nombre} ({obj.tipo}) — {formatearKC(obj.precio)}
				</option>
			))}
		</select>
	);
};

const InputKC = ({ valor, onChange, max }) => (
	<div className="input-kc-wrapper">
		<input
			type="number"
			className="crear-input"
			value={valor}
			min={0}
			max={max}
			onChange={(e) => onChange(e.target.value)}
			placeholder="0"
		/>
		<span className="input-kc-sufijo">KC</span>
	</div>
);

export default CrearIntercambio;
