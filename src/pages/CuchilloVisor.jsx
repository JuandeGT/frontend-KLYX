// ============================================================
// THREE.JS / REACT THREE FIBER — Librería 3D
// Estas importaciones NO están en el archivo de referencia del profesor.
//
// - @react-three/fiber : renderer React para Three.js (Canvas, useFrame)
// - @react-three/drei  : helpers de alto nivel (useGLTF, Center)
// - three (Color)      : clase de color de Three.js, usada para fijar el fondo de la escena
// ============================================================
import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
// Color es una clase de Three.js para representar colores. No está en la referencia base.
// Se usa aquí para fijar scene.background a negro en el callback onCreated.
import { Color } from 'three';

// Ruta al modelo 3D dentro de /public — accesible como asset estático en Vite
const MODEL_PATH = '/models/KarambitRainbow.glb';

// ——— Componente interno: carga y anima el karambit ———
// En móvil (< 768px) se centra el modelo; en escritorio se desplaza a la derecha
// para dejar espacio al texto del hero sin que se superpongan.
const Cuchillo = ({ esMobile }) => {
	// useGLTF carga el archivo .glb y devuelve la escena Three.js lista para renderizar
	const { scene } = useGLTF(MODEL_PATH);

	// useRef persiste la referencia al grupo 3D entre renders sin provocar re-renders.
	// Es la forma de acceder al objeto Three.js directamente desde el bucle de animación.
	const grupoRef = useRef();

	// useFrame se ejecuta cada frame (como requestAnimationFrame).
	// delta = tiempo en segundos desde el frame anterior — multiplicarlo por la velocidad
	// garantiza que la animación vaya igual de rápida independientemente del framerate.
	useFrame((state, delta) => {
		if (!grupoRef.current) return;
		// Rotación continua en Y (giro lateral)
		grupoRef.current.rotation.y += delta * 0.5;
		// Oscilación suave en X usando seno del tiempo transcurrido — efecto "flotación"
		grupoRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.07;
	});

	return (
		// Center centra el modelo en su bounding box antes de aplicar el desplazamiento
		<Center position={esMobile ? [0, 0, 0] : [1.2, 0.15, 0]}>
			<group
				ref={grupoRef}
				scale={[2.5, 2.5, 2.5]}       // escala uniforme — el modelo original es pequeño
				rotation={[0.1, 0.5, 0]}       // orientación inicial: leve inclinación para que se vea el filo
			>
				{/* primitive renderiza la escena GLB tal cual, sin convertirla en JSX */}
				<primitive object={scene} />
			</group>
		</Center>
	);
};

// ——— Componente exportado: Canvas full-hero ———
const CuchilloVisor = () => {
	// useEffect + useState para detectar si es móvil y reaccionar a resize.
	// No está en la referencia base: necesario para adaptar la posición 3D al viewport.
	// { passive: true } mejora el rendimiento del scroll al indicar al navegador
	// que el listener no llamará a preventDefault().
	const [esMobile, setIsMobile] = useState(() => window.innerWidth < 768);
	useEffect(() => {
		const fn = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', fn, { passive: true });
		return () => window.removeEventListener('resize', fn);
	}, []);

	return (
		<Canvas
			gl={{ antialias: true }}   // suavizado de bordes del modelo
			onCreated={({ gl, scene }) => {
				// Fijamos el fondo negro del renderer y de la escena para que coincida
				// con el fondo CSS del hero y no haya parpadeo al cargar
				gl.setClearColor('#080808', 1);
				scene.background = new Color('#080808');
			}}
			// Cámara en Z=4 mirando al origen. fov=60 da una perspectiva natural.
			// El karambit está desplazado lateralmente con position en <Center>.
			camera={{ position: [0, 0.2, 4], fov: 60 }}
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
		>
			{/* Luz ambiental muy tenue — ilumina igual por todos lados para que nada quede negro puro */}
			<ambientLight intensity={0.2} color="#fff8ee" />

			{/* Luz principal frontal-alta: revela los detalles del karambit */}
			<directionalLight
				position={[1, 4, 4]}
				intensity={4}
				color="#ffffff"
			/>

			{/* Luz dorada izquierda: acento KLYX sobre el mango */}
			<pointLight
				position={[-2, 2, 3]}
				intensity={2.5}
				color="#c9a227"
				distance={12}   // la luz se atenúa a 0 a partir de esta distancia
			/>

			{/* Luz blanca brillante desde arriba: activa el efecto rainbow del filo */}
			<pointLight
				position={[2, 6, 2]}
				intensity={3}
				color="#ffffff"
				distance={14}
			/>

			{/* Contraluz trasero azul muy oscuro: crea silueta y separación del fondo */}
			<pointLight
				position={[0, -1, -4]}
				intensity={1}
				color="#0a1830"
				distance={10}
			/>

			{/* Suspense muestra null mientras el GLB se descarga — sin spinner para no distraer */}
			<Suspense fallback={null}>
				<Cuchillo esMobile={esMobile} />
			</Suspense>
		</Canvas>
	);
};

// Precarga el modelo GLB antes de que el componente se monte.
// Al estar fuera del componente se ejecuta una sola vez al importar el módulo,
// evitando que el modelo tarde en aparecer la primera vez que se abre la página.
useGLTF.preload(MODEL_PATH);

export default CuchilloVisor;
