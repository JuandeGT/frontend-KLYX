import Cabecera from './estructura/Cabecera.jsx';
import Contenido from './estructura/Contenido.jsx';
import Pie from './estructura/Pie.jsx';
import Notificaciones from './estructura/Notificaciones.jsx';
import Rutas from './routes/Rutas.jsx';

function App() {
	return (
		<>
			<Cabecera />
			<Notificaciones />
			<Contenido>
				<Rutas />
			</Contenido>
			<Pie />
		</>
	);
}

export default App;
