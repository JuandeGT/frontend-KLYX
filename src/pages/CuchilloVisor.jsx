// ============================================================
// THREE.JS / REACT THREE FIBER — Librería 3D
// Estas importaciones NO están en el archivo de referencia del profesor.
//
// - @react-three/fiber : renderer React para Three.js (Canvas, useFrame)
// - @react-three/drei  : helpers de alto nivel (useGLTF, Center)
// - three (Color)      : clase de color de Three.js, usada para fijar el fondo de la escena
// ============================================================
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
// Color es una clase de Three.js para representar colores. No está en la referencia base.
// Se usa aquí para fijar scene.background a negro en el callback onCreated.
import { Color } from 'three';

const MODEL_PATH = '/models/KarambitRainbow.glb';

// ——— Componente interno: carga y anima el karambit ———
const Cuchillo = () => {
	const { scene } = useGLTF(MODEL_PATH);
	const grupoRef = useRef();

	// useFrame: ejecuta la animación cada frame (requestAnimationFrame de R3F)
	useFrame((state, delta) => {
		if (!grupoRef.current) return;
		grupoRef.current.rotation.y += delta * 0.5;
		grupoRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.07;
	});

	return (
		// Center: centra el modelo en su posición local, luego se desplaza a la derecha.
		<Center position={[1.2, 0.15, 0]}>
			<group
				ref={grupoRef}
				scale={[2.5, 2.5, 2.5]}
				rotation={[0.1, 0.5, 0]}
			>
				<primitive object={scene} />
			</group>
		</Center>
	);
};

// ——— Componente exportado: Canvas full-hero ———
const CuchilloVisor = () => {
	return (
		<Canvas
			gl={{ antialias: true }}
			onCreated={({ gl, scene }) => {
				gl.setClearColor('#080808', 1);
				scene.background = new Color('#080808');
			}}
			// Cámara centrada en X pero ligeramente mirando a la derecha.
			// El karambit está desplazado a la derecha con position en el grupo.
			camera={{ position: [0, 0.2, 4], fov: 60 }}
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
		>
			{/* Ambiente oscuro y dramático */}
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
				distance={12}
			/>

			{/* Luz blanca brillante desde arriba: activa el rainbow del filo */}
			<pointLight
				position={[2, 6, 2]}
				intensity={3}
				color="#ffffff"
				distance={14}
			/>

			{/* Contraluz trasero azul: silueta dramática */}
			<pointLight
				position={[0, -1, -4]}
				intensity={1}
				color="#0a1830"
				distance={10}
			/>

			<Suspense fallback={null}>
				<Cuchillo />
			</Suspense>
		</Canvas>
	);
};

useGLTF.preload(MODEL_PATH);

export default CuchilloVisor;
