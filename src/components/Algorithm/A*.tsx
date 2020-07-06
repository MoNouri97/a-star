import { INode } from '../grid/node/NodeInterface';

export const aStar = (grid: INode[][], start: INode, end: INode) => {
	const height = grid.length;
	const width = grid[0].length;

	let open: INode[] = [];
	let closed: INode[] = [];
	let current: INode;

	open.push(start);

	// get node with lowest fCost
	sortByFCost(open);
	let lowestFCost = open.pop();
	if (lowestFCost === undefined) return;
	current = lowestFCost;
	closed = [...closed, current];

	if (current.col === end.col && current.row === end.row) {
		return closed;
	}
	let neighbors = getNeighbors(current.row, current.col, height, width);
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
			if (row + i >= height && row + i < 0) continue;
			if (col + j >= width && row + j < 0) continue;
			list = [...list, { row: row + i, col: col + j }];
		}
	}

	return list;
};
