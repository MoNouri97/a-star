import React from 'react';

import './node.css';
import { INode } from './NodeInterface';

interface Props {
	data: INode;
	mouseDown: (row: number, col: number) => void;
	mouseUp: (row: number, col: number) => void;
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
			style={data.delay ? { animationDelay: data.delay + 'ms' } : {}}
			className={`node ${data.type}`}
			onMouseDown={(event) => {
				event.preventDefault();
				mouseDown(data.row, data.col);
			}}
			onMouseUp={() => mouseUp(data.row, data.col)}
			onMouseEnter={() => mouseEnter(data.row, data.col)}
		></div>
	);
};
