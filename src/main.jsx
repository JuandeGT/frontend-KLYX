import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ProveedorNotificaciones from './contexts/ProveedorNotificaciones.jsx';
import ProveedorSesion from './contexts/ProveedorSesion.jsx';
import ProveedorIntercambios from './contexts/ProveedorIntercambios.jsx';
import App from './App.jsx';
import './styles/index.scss';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<ProveedorNotificaciones>
				{/* ProveedorSesion va dentro de ProveedorNotificaciones para poder
				    llamar a notificar() desde las funciones de login/registro */}
				<ProveedorSesion>
					{/* ProveedorIntercambios depende de la sesión para cargar datos del mercado */}
					<ProveedorIntercambios>
						<App />
					</ProveedorIntercambios>
				</ProveedorSesion>
			</ProveedorNotificaciones>
		</BrowserRouter>
	</StrictMode>
);
