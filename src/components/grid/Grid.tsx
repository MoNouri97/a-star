import React, { useState, useRef, ChangeEvent } from 'react';

import './Grid.css';
import { Node } from './node/Node';
import { INode, equalNodes, createNode } from './node/NodeInterface';
import { aStar } from '../Algorithm/A*';
import { randomWalls } from '../Algorithm/RandomWalls';
import { useCheckbox } from '../useCheckbox';

// grid size
const W = 40;
const H = 20;
// cursor and nodes
const START = 'start';
const END = 'end';
const WALL = 'wall';
// animation Speed
const SLOW_SPEED = {
	SEARCH: 50,
	PATH: 100,
};
const FAST_SPEED = {
	SEARCH: 20,
	PATH: 50,
};

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

	const toggleWall = (row: number, col: number) => {
		setGrid(
			grid.map(gRow =>
				gRow.map(gNode => {
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
			grid.map(gRow =>
				gRow.map(gNode => {
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
				return {
					previous: n.previous,
					type: n.type,
					delay: i * searchSpeed.current,
				};
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
		setGrid(
			grid.map((row, i) =>
				row.map((node, j) => {
					node = createNode(i, j);

					if (equalNodes(node, start.current)) node.type = START;
					if (equalNodes(node, end.current)) node.type = END;

					return node;
				}),
			),
		);
		setPathFound(false);
	};
	const clearGridKeepWalls = () => {
		setGrid(
			grid.map((row, i) =>
				row.map((node, j) => {
					if (node.type !== WALL) {
						node = createNode(i, j);
					}
					if (equalNodes(node, start.current)) node.type = START;
					if (equalNodes(node, end.current)) node.type = END;

					return node;
				}),
			),
		);
		setPathFound(false);
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
		const cloneGrid = grid.map(row => row.map(node => node));
		// get the closed path
		console.log(allowDiag);

		const path = aStar(
			cloneGrid,
			start.current,
			end.current,
			allowDiag.checked,
		);
		if (path === undefined) {
			return;
		}

		let finalDelay = 0;
		setGrid(
			grid.map(gRow =>
				gRow.map(gNode => {
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
		setPathFound(true);
		if (!equalNodes(path[path.length - 1], end.current)) {
			alert('no path found');
			return;
		}

		const shortestPath = constructPath(path[path.length - 2]);
		// animate shortest path
		setTimeout(() => {
			setGrid(
				grid.map(gRow =>
					gRow.map(gNode => {
						const i = shortestPath.indexOf(gNode);
						if (i > -1) {
							if (gNode.type !== START && gNode.type !== END) {
								gNode.type = 'path';
								gNode.delay = i * pathSpeed.current;
							}
						}
						return gNode;
					}),
				),
			);
		}, finalDelay + 500);
	};

	const handleRandomMaze = () => {
		const newGrid = randomWalls(W, H);
		clearGrid();
		setTimeout(() => {
			setGrid(
				grid.map((gRow, i) =>
					gRow.map((gNode, j) => {
						gNode = createNode(i, j);

						if (equalNodes(gNode, start.current)) {
							gNode.type = START;
							return gNode;
						}
						if (equalNodes(gNode, end.current)) {
							gNode.type = END;
							return gNode;
						}

						const res = newGrid[i][j];
						if (!res.wall) {
							return gNode;
						}
						gNode.type = WALL;
						gNode.delay = res.delay;

						return gNode;
					}),
				),
			);
		}, 20);
	};
	const handleSpeedChange = (event: ChangeEvent<HTMLSelectElement>) => {
		console.log(event.target.value);

		if (event.target.value === 'fast') {
			searchSpeed.current = FAST_SPEED.SEARCH;
			pathSpeed.current = FAST_SPEED.PATH;
		}
		if (event.target.value === 'slow') {
			searchSpeed.current = SLOW_SPEED.SEARCH;
			pathSpeed.current = SLOW_SPEED.PATH;
		}
	};
	// state & refs
	const [grid, setGrid] = useState(getInitialGrid());
	const start = useRef(grid[H / 2][1]);
	const end = useRef(grid[H / 2][W - 2]);
	const [mouseIsPressed, setMouseIsPressed] = useState(false);
	const [cursor, setCursor] = useState(WALL);
	const searchSpeed = useRef(FAST_SPEED.SEARCH);
	const pathSpeed = useRef(FAST_SPEED.PATH);
	const allowDiag = useCheckbox(false);
	const [pathFound, setPathFound] = useState(false);

	return (
		<div
			className='layout'
			onMouseUp={handleMouseUpOrLeave}
			onMouseLeave={handleMouseUpOrLeave}
		>
			<div className='main columns'>
				<div className='right-side column'>
					<div className='btn-section'>
						<div className='subtitle is-6'>Visualize Algorithm</div>
						<div className='field mb-3'>
							<div className='control'>
								<label htmlFor='select'>Speed : </label>
								<div className='select is-small'>
									<select defaultValue='fast' onChange={handleSpeedChange}>
										<option value='slow'>Slow</option>
										<option value='fast'>Fast</option>
									</select>
								</div>
							</div>
							<label className='checkbox'>
								<input type='checkbox' {...allowDiag} />
								Allow Diagonal
							</label>
						</div>
						<button
							className='button'
							onClick={handleVisualize}
							disabled={pathFound}
						>
							A*
						</button>
						<div className='subtitle is-6'>Grid</div>
						<div className='button' onClick={clearGrid}>
							Clear Walls
						</div>
						<div className='button' onClick={clearGridKeepWalls}>
							Reset Path
						</div>
						<div className='subtitle is-6'>Maze Generation</div>
						<div className='button' onClick={handleRandomMaze}>
							Random
						</div>
					</div>
				</div>

				<div
					className='grid box column is-12 is-9-desktop'
					// style={{ width: W * 26 + 'px' }}
				>
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
