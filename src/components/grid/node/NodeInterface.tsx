export interface INode {
	col: number;
	row: number;
	type: string;
	gCost: number;
	hCost: number;
	fCost: number;
	previous: { row: number; col: number } | null;
	delay?: number | string;
}
