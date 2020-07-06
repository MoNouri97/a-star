import React from 'react';

import './node.css';
import { INode } from './NodeInterface';

interface Props {
	data: INode;
	mouseDown: (row: number, col: number) => void;
	mouseUp: () => void;
	mouseEnter: (row: number, col: number) => void;
}

export const Node: React.FC<Props> = ({
	data,
	mouseDown,
	mouseUp,
	mouseEnter,
}) => {
	return (
		<div
			className={`node ${data.type}`}
			onMouseDown={() => mouseDown(data.row, data.col)}
			onMouseUp={() => mouseUp()}
			onMouseEnter={() => mouseEnter(data.row, data.col)}
		></div>
	);
};
