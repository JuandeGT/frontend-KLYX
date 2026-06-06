import React from 'react';

// Envoltorio de sección del formulario
const SeccionForm = ({ titulo, children }) => (
	<div className="seccion-form">
		<label className="seccion-label">{titulo}</label>
		{children}
	</div>
);

export default SeccionForm;
