import React from 'react';

// Campo de formulario reutilizable: label + input de texto
// Usado en SeccionCajas, SeccionObjetos y SeccionUsuarios
const CampoForm = ({ label, value, onChange, type = 'text' }) => (
	<div className="campo-form">
		<label>{label}</label>
		<input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
	</div>
);

export default CampoForm;
