// THREE.JS / REACT THREE FIBER — Librería 3D
// - @react-three/fiber : renderer React para Three.js (Canvas, useFrame)
// - @react-three/drei  : helpers de alto nivel (useGLTF, Center)
// - three (Color)      : clase de color de Three.js, usada para fijar el fondo de la escena
import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
// Color es una clase de Three.js para representar colores
import { Color } from 'three';

// Ruta al modelo 3D
const MODEL_PATH = '/models/KarambitRainbow.glb';

// Componente interno: carga y anima el karambit
const Cuchillo = ({ esMobile }) => {
	// useGLTF carga el archivo .glb y devuelve la escena Three.js lista para renderizar
	const { scene } = useGLTF(MODEL_PATH);

	// useRef persiste la referencia al grupo 3D entre renders sin provocar re-renders
	// Es la forma de acceder al objeto Three.js directamente desde el bucle de animación
	const grupoRef = useRef();

	// useFrame se ejecuta cada frame (como requestAnimationFrame)
	// delta = tiempo en segundos desde el frame anterior multiplicarlo por la velocidad, garantiza que la animación vaya igual de rápida independientemente del framerate
	useFrame((state, delta) => {
		if (!grupoRef.current) return;
		// Rotación continua en el eje Y (giro lateral)
		grupoRef.current.rotation.y += delta * 0.5;
		// Oscilación suave en el eje X
		grupoRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.07;
	});

	return (
		// Center centra el modelo
		<Center position={esMobile ? [0, 0, 0] : [1.2, 0.15, 0]}>
			<group ref={grupoRef} scale={[2.5, 2.5, 2.5]} rotation={[0.1, 0.5, 0]}>
				{/* primitive renderiza la escena GLB tal cual, sin convertirla en JSX */}
				<primitive object={scene} />
			</group>
		</Center>
	);
};

// Componente exportado: Canvas full-hero
const CuchilloVisor = () => {
	// useEffect + useState para detectar si es móvil
	const [esMobile, setIsMobile] = useState(() => window.innerWidth < 768);
	useEffect(() => {
		const fn = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', fn, { passive: true });
		return () => window.removeEventListener('resize', fn);
	}, []);

	return (
		<Canvas
			gl={{ antialias: true }}
			onCreated={({ gl, scene }) => {
				// Fijamos el fondo negro del renderer y de la escena para que coincida con el fondo CSS del hero y no haya parpadeo al cargar
				gl.setClearColor('#080808', 1);
				scene.background = new Color('#080808');
			}}
			camera={{ position: [0, 0.2, 4], fov: 60 }}
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
		>
			{/* Luz ambiental */}
			<ambientLight intensity={0.2} color="#fff8ee" />

			{/* Luz principal */}
			<directionalLight position={[1, 4, 4]} intensity={4} color="#ffffff" />

			<pointLight position={[-2, 2, 3]} intensity={2.5} color="#c9a227" distance={12} />

			{/* Luz blanca brillante desde arriba */}
			<pointLight position={[2, 6, 2]} intensity={3} color="#ffffff" distance={14} />

			<pointLight position={[0, -1, -4]} intensity={1} color="#0a1830" distance={10} />

			<Suspense fallback={null}>
				<Cuchillo esMobile={esMobile} />
			</Suspense>
		</Canvas>
	);
};

// Precarga el modelo GLB antes de que el componente se monte
// Al estar fuera del componente se ejecuta una sola vez al importar el módulo, evitando que el modelo tarde en aparecer la primera vez que se abre la página
useGLTF.preload(MODEL_PATH);

export default CuchilloVisor;
