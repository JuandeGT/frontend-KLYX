import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ProveerNotificaciones from './contexts/ProveerNotificaciones.jsx';
import ProveedorSesion from './contexts/ProveedorSesion.jsx';
import ProveedorIntercambios from './contexts/ProveedorIntercambios.jsx';
import App from './App.jsx';
import './styles/index.scss';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<ProveerNotificaciones>
				{/* ProveedorSesion va dentro de ProveerNotificaciones para poder
				    llamar a notificar() desde las funciones de login/registro */}
				<ProveedorSesion>
					{/* ProveedorIntercambios depende de la sesión para cargar datos del mercado */}
					<ProveedorIntercambios>
						<App />
					</ProveedorIntercambios>
				</ProveedorSesion>
			</ProveerNotificaciones>
		</BrowserRouter>
	</StrictMode>
);
