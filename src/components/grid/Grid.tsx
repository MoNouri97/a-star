import React, { useState, useRef, useEffect } from 'react';

import './Grid.css';
import { Node } from './node/Node';
import { INode, equalNodes } from './node/NodeInterface';
import { aStar } from '../Algorithm/A*';

// grid size
const W = 40;
const H = 20;
// cursor and nodes
const START = 'start';
const END = 'end';
const WALL = 'wall';

export const Grid = () => {
	// Helpers
	const getInitialGrid = (defaultPoints: boolean = true) => {
		const grid = [];
		for (let row = 0; row < H; row++) {
			const currentRow = [];
			for (let col = 0; col < W; col++) {
				currentRow.push(createNode(row, col));
				if (defaultPoints) {
					if (row === H / 2 && col === 1) currentRow[col].type = START;
					if (row === H / 2 && col === W - 2) currentRow[col].type = END;
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

					if (gNode.type === WALL) gNode.type = ' ';
					else if (gNode.type === ' ') gNode.type = WALL;
					return gNode;
				}),
			),
		);
	};

	const placeSpecialNode = (row: number, col: number, type: string = START) => {
		console.log('place', type);

		setGrid(
			grid.map((gRow) =>
				gRow.map((gNode) => {
					if ((gNode.col !== col || gNode.row !== row) && gNode.type === type) {
						gNode.type = ' ';
						return gNode;
					}
					if (gNode.type !== ' ') return gNode;
					if (gNode.col !== col || gNode.row !== row) return gNode;

					gNode.type = type;
					if (type === START) start.current = gNode;
					if (type === END) end.current = gNode;
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

					if (equalNodes(node, start.current)) node.type = START;
					if (equalNodes(node, end.current)) node.type = END;

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
					if (node.type !== WALL) {
						node = cleanGrid[i][j];
					}
					if (equalNodes(node, start.current)) node.type = START;
					if (equalNodes(node, end.current)) node.type = END;

					return node;
				}),
			),
		);
	};

	// events
	const handleMouseDown = (row: number, col: number) => {
		setMouseIsPressed(true);

		if (grid[row][col].type === START) {
			setCursor(START);
			return;
		}
		if (grid[row][col].type === END) {
			setCursor(END);
			return;
		}

		if (cursor === WALL) {
			toggleWall(row, col);
			return;
		}
	};
	const handleMouseUpOrLeave = () => {
		setMouseIsPressed(false);
	};
	const handleMouseUp = (row: number, col: number) => {
		if (cursor === START) {
			placeSpecialNode(row, col, START);
			setCursor(WALL);
		}
		if (cursor === END) {
			placeSpecialNode(row, col, END);
			setCursor(WALL);
		}
		setMouseIsPressed(false);
	};

	const handleMouseEnter = (row: number, col: number) => {
		if (!mouseIsPressed) return;

		if (cursor === WALL) toggleWall(row, col);
		if (cursor === START) placeSpecialNode(row, col, START);
		if (cursor === END) placeSpecialNode(row, col, END);
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
						gNode.type = END;
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
							if (gNode.type !== START && gNode.type !== END) {
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
	const [cursor, setCursor] = useState(WALL);

	return (
		<div
			className='layout'
			onMouseUp={handleMouseUpOrLeave}
			onMouseLeave={handleMouseUpOrLeave}
		>
			<div className='main'>
				<div className='right-side'>
					<div className='hero is-light'>
						<div className='container'>
							<div className='hero-body'>
								<h1 className='title'>A* Pathfinding</h1>
								<h2 className='subtitle'>Visualizer</h2>
							</div>
						</div>
					</div>
					<div className='btn-section box'>
						<div className='btn' onClick={handleVisualize}>
							Visualize
						</div>
						<div className='btn' onClick={clearGrid}>
							Clear
						</div>
						<div className='btn' onClick={clearGridKeepWalls}>
							Reset
						</div>
					</div>
				</div>

				<div className='grid box' style={{ width: W * 26 + 'px' }}>
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
			</div>
		</div>
	);
};
