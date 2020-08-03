import { useState } from 'react';

export const useCheckbox = (initial: boolean) => {
	const [checked, setValue] = useState(initial);
	const onChange = (e: React.ChangeEvent<any>) => {
		setValue(!checked);
	};

	return {
		checked,
		onChange,
	};
};
