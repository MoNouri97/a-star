import { INode } from '../grid/node/NodeInterface';

const COST = 10;
const DIAG_COST = 14;

export const aStar = (grid: INode[][], start: INode, end: INode) => {
	const height = grid.length;
	const width = grid[0].length;

	let open: INode[] = [];
	let closed: INode[] = [];
	let current: INode;
	let path: INode[] = [];

	start.gCost = 0;
	open.push(start);

	while (open.length > 0) {
		// get node with lowest fCost
		sortByFCost(open);
		let lowestFCost = open.pop();
		if (lowestFCost === undefined) return;
		current = lowestFCost;
		if (current.type !== 'start' && current.type !== 'end') {
			current.type = 'closed';
			grid[current.row][current.col].type = 'closed';
		}

		closed = [...closed, current];
		//track open and close
		path = [...path, current];
		if (current.col === end.col && current.row === end.row) {
			console.log('path found');

			return path;
		}
		let neighbors = getNeighbors(current.row, current.col, height, width);

		neighbors.forEach((neighbor) => {
			const neighborNode = grid[neighbor.row][neighbor.col];
			if (neighborNode.type === 'wall' || neighborNode.type === 'closed')
				return;

			const newGCost = current.gCost + distanceTo(neighborNode, current);

			if (neighborNode.gCost > newGCost) {
				neighborNode.gCost = newGCost;
				neighborNode.hCost = distanceTo(neighborNode, end);
				neighborNode.fCost = neighborNode.gCost + neighborNode.hCost;
				neighborNode.previous = { row: current.row, col: current.col };
				if (neighborNode.type !== 'open') {
					neighborNode.type = 'open';
					grid[neighborNode.row][neighborNode.col].type = 'open';
					open.push(neighborNode);
					// path = [...path, neighborNode];
				}
			}
		});
	}
	return path;
};

const sortByFCost = (open: INode[]) => {
	/**
	 * sorting by fCost , if equal by hCost
	 * a & b are flipped to sort it in descending order
	 */
	open.sort((a, b) => {
		if (a.fCost !== b.fCost) return b.fCost - a.fCost;
		return b.hCost - a.hCost;
	});
};

const getNeighbors = (
	row: number,
	col: number,
	height: number,
	width: number,
) => {
	let list: { row: number; col: number }[] = [];
	for (let i = -1; i < 2; i++) {
		for (let j = -1; j < 2; j++) {
			if (i === 0 && j === 0) continue;
			if (row + i >= height || row + i < 0) continue;
			if (col + j >= width || col + j < 0) continue;
			list = [...list, { row: row + i, col: col + j }];
		}
	}

	return list;
};

const distanceTo = (node: INode, end: INode) => {
	const rowDifference = Math.abs(node.row - end.row);
	const colDifference = Math.abs(node.col - end.col);

	/**
	 * if x > y : 14y + 10(x - y)
	 */
	if (rowDifference > colDifference)
		return DIAG_COST * colDifference + COST * (rowDifference - colDifference);

	return DIAG_COST * rowDifference + COST * (colDifference - rowDifference);
};
