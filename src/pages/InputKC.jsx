import React from 'react';

// Input numérico para introducir cantidad en Klyx Coins, con sufijo "KC" visual.
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

export default InputKC;
