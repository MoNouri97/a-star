import React, { useState, useRef, useEffect } from 'react';

import './Grid.css';
import { Node } from './node/Node';
import { INode, equalNodes } from './node/NodeInterface';
import { aStar } from '../Algorithm/A*';

// grid size
const W = 30;
const H = 20;

export const Grid = () => {
	// Helpers
	const getInitialGrid = (defaultPoints: boolean = true) => {
		const grid = [];
		for (let row = 0; row < H; row++) {
			const currentRow = [];
			for (let col = 0; col < W; col++) {
				currentRow.push(createNode(row, col));
				if (defaultPoints) {
					if (row === H / 2 && col === 1) currentRow[col].type = 'start';
					if (row === H / 2 && col === W - 2) currentRow[col].type = 'end';
				}
			}
			grid.push(currentRow);
		}
		return grid;
	};

	const createNode = (row: number, col: number) => {
		const node: INode = {
			col,
			row,
			type: ' ', // [wall,visited (closed), calculated (open) , '' (basic),start,end]
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

					if (gNode.type === 'wall') gNode.type = ' ';
					else if (gNode.type === ' ') gNode.type = 'wall';

					console.log(gNode);
					return gNode;
				}),
			),
		);
	};
	const placeSpecialNode = (
		row: number,
		col: number,
		type: string = 'start',
	) => {
		start.current = grid[row][col];
		setGrid(
			grid.map((gRow) =>
				gRow.map((gNode) => {
					if ((gNode.col !== col || gNode.row !== row) && gNode.type === type) {
						gNode.type = ' ';
						return gNode;
					}
					if (gNode.col !== col || gNode.row !== row) return gNode;

					gNode.type = type;
					start.current = gNode;
					return gNode;
				}),
			),
		);
	};

	/**
	 * used to copy data from the result of the algorithm to the grid
	 */
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
		while (current !== start.current) {
			const parent = current.previous;
			if (parent === null) {
				return path;
			}
			current = grid[parent.row][parent.col];
			path = [current, ...path];
		}
		return path;
	};

	const clearGrid = () => {
		const cleanGrid = getInitialGrid(false);
		setGrid(
			grid.map((row, i) =>
				row.map((node, j) => {
					node = cleanGrid[i][j];

					if (equalNodes(node, start.current)) node.type = 'start';
					if (equalNodes(node, end.current)) node.type = 'end';

					return node;
				}),
			),
		);
	};
	const clearGridKeepWalls = () => {
		const cleanGrid = getInitialGrid(false);
		setGrid(
			grid.map((row, i) =>
				row.map((node, j) => {
					if (node.type !== 'wall') {
						node = cleanGrid[i][j];
					}
					if (equalNodes(node, start.current)) node.type = 'start';
					if (equalNodes(node, end.current)) node.type = 'end';

					return node;
				}),
			),
		);
	};

	// events
	const handleMouseDown = (row: number, col: number) => {
		setMouseIsPressed(true);

		if (grid[row][col].type === 'start') {
			setCursor('start');
			return;
		}

		if (cursor === 'wall') {
			toggleWall(row, col);
			return;
		}
	};
	const handleMouseUpOrLeave = () => {
		setMouseIsPressed(false);
	};
	const handleMouseUp = (row: number, col: number) => {
		if (cursor === 'start') {
			placeSpecialNode(row, col);
			setCursor('wall');
		}
		setMouseIsPressed(false);
	};

	const handleMouseEnter = (row: number, col: number) => {
		if (!mouseIsPressed) return;
		if (cursor === 'wall') {
			toggleWall(row, col);
		}
		if (cursor === 'start') placeSpecialNode(row, col);
	};
	const handleVisualize = () => {
		const cloneGrid = grid.map((row) => row.map((node) => node));
		// get the closed path
		const path = aStar(cloneGrid, start.current, end.current);
		if (path === undefined) {
			return;
		}

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
					// keep the end node
					if (equalNodes(gNode, end.current)) {
						gNode.type = 'end';
					}
					return gNode;
				}),
			),
		);
		if (!equalNodes(path[path.length - 1], end.current)) return;

		const shortestPath = constructPath(path[path.length - 2]);
		// animate shortest path
		setTimeout(() => {
			setGrid(
				grid.map((gRow) =>
					gRow.map((gNode) => {
						const i = shortestPath.indexOf(gNode);
						if (i > -1) {
							if (gNode.type !== 'start' && gNode.type !== 'end') {
								gNode.type = 'path';
								gNode.delay = i * 100;
							}
						}
						return gNode;
					}),
				),
			);
		}, finalDelay + 500);
	};

	// state
	const [grid, setGrid] = useState(getInitialGrid());
	const start = useRef(grid[H / 2][1]);
	const end = useRef(grid[H / 2][W - 2]);
	const [mouseIsPressed, setMouseIsPressed] = useState(false);
	const [cursor, setCursor] = useState('wall');

	useEffect(() => {
		console.log('changed');
	}, [grid]);

	return (
		<div
			className='grid'
			onMouseUp={handleMouseUpOrLeave}
			onMouseLeave={handleMouseUpOrLeave}
		>
			<div className='btn-row'>
				<button onClick={handleVisualize}>Visualize</button>
				<button onClick={clearGrid}>Clear</button>
				<button onClick={clearGridKeepWalls}>Reset</button>
			</div>
			{grid.map((row, i) => (
				<div className='row' key={i}>
					{row.map((node, j) => {
						return (
							<Node
								data={node}
								mouseDown={handleMouseDown}
								mouseUp={handleMouseUp}
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
