import React, { useState } from 'react';

import './Grid.css';
import { Node } from './node/Node';
import { INode } from './node/NodeInterface';
import { aStar } from '../Algorithm/A*';

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
				if (row === H / 2 && col === 1) currentRow[col].type = 'start';
				if (row === H / 2 && col === W - 2) currentRow[col].type = 'end';
			}
			grid.push(currentRow);
		}
		return grid;
	};

	const createNode = (row: number, col: number) => {
		const node: INode = {
			col,
			row,
			type: '', // [wall,visited (closed), calculated (open) , '' (basic),start,end]
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
	const [start, setStart] = useState(grid[H / 2][1]);
	const [end, setEnd] = useState(grid[H / 2][W - 2]);
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
	const handleVisualize = () => {
		const path = aStar([...grid], start, end, setGrid);

		if (path === undefined) {
			return;
		}
		const shortestPath = constructPath(path[path.length - 1]);

		let finalDelay = 0;
		setGrid(
			grid.map((gRow) =>
				gRow.map((gNode) => {
					const res = inPath(gNode, path);
					if (res !== null) {
						gNode.type = res.type + '';
						gNode.delay = res.delay;
						gNode.previous = res.previous;
						finalDelay = res.delay > finalDelay ? res.delay : finalDelay;
					}
					return gNode;
				}),
			),
		);
		setTimeout(() => {
			setGrid(
				grid.map((gRow) =>
					gRow.map((gNode) => {
						const i = shortestPath.indexOf(gNode);
						if (i > -1) {
							gNode.type = 'path';
							gNode.delay = i * 100;
						}
						return gNode;
					}),
				),
			);
		}, finalDelay + 500);
	};
	const inPath = (node: INode, path: INode[]) => {
		for (let i = 0; i < path.length; i++) {
			const n = path[i];
			if (n.col === node.col && n.row === node.row)
				return { previous: n.previous, type: n.type, delay: i * 50 };
		}
		return null;
	};
	const constructPath = (node: INode) => {
		let path = [node];
		let current = path[0];
		while (current != start) {
			const parent = current.previous;
			if (parent === null) {
				return path;
			}
			current = grid[parent.row][parent.col];
			path = [current, ...path];
			console.log(current.row, current.col);
		}
		return path;
	};

	return (
		<div
			className='grid'
			onMouseUp={handleMouseUpOrLeave}
			onMouseLeave={handleMouseUpOrLeave}
		>
			<div className='btn-row'>
				<button onClick={handleVisualize}>Visualize</button>
			</div>
			<div className='btn-row'>
				<button
					onClick={() => {
						setGrid(getInitialGrid());
					}}
				>
					Clear
				</button>
			</div>
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
