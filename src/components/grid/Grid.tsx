import React, { useState } from 'react';

import './Grid.css';
import { Node } from './node/Node';
import { INode } from './node/NodeInterface';

// grid size
const W = 30;
const H = 20;

export const Grid = () => {
	// Helpers
	const getInitialGrid = () => {
		const grid = [];
		for (let row = 0; row < H; row++) {
			const currentRow = [];
			for (let col = 0; col < W; col++) {
				currentRow.push(createNode(row, col));
			}
			grid.push(currentRow);
		}
		return grid;
	};

	const createNode = (row: number, col: number) => {
		const node: INode = {
			col,
			row,
			type: '', // [wall,visited (closed), calculated (open) , '' (basic)]
			gCost: Infinity,
			hCost: Infinity,
			fCost: Infinity,
			previous: null,
		};

		return node;
	};

	const toggleWall = (row: number, col: number) => {
		setGrid(
			grid.map((gRow) =>
				gRow.map((gNode) => {
					if (gNode.col !== col || gNode.row !== row) return gNode;

					if (gNode.type === 'wall') gNode.type = '';
					else if (gNode.type === '') gNode.type = 'wall';

					return gNode;
				}),
			),
		);
	};

	// state
	const [grid, setGrid] = useState(getInitialGrid());
	const [mouseIsPressed, setMouseIsPressed] = useState(false);

	// events
	const handleMouseDown = (row: number, col: number) => {
		setMouseIsPressed(true);
		toggleWall(row, col);
	};
	const handleMouseUpOrLeave = () => {
		setMouseIsPressed(false);
	};
	const handleMouseEnter = (row: number, col: number) => {
		if (!mouseIsPressed) return;

		toggleWall(row, col);
	};

	return (
		<div
			className='grid'
			onMouseUp={handleMouseUpOrLeave}
			onMouseLeave={handleMouseUpOrLeave}
		>
			{grid.map((row, i) => (
				<div className='row' key={i}>
					{row.map((node, j) => {
						return (
							<Node
								data={node}
								mouseDown={handleMouseDown}
								mouseUp={handleMouseUpOrLeave}
								mouseEnter={handleMouseEnter}
								key={i + ',' + j}
							></Node>
						);
					})}
				</div>
			))}
		</div>
	);
};
