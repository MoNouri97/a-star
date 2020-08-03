export const randomWalls: (
	cols: number,
	rows: number,
) => {
	wall: boolean;
	delay: number;
}[][] = (cols: number, rows: number) => {
	const grid = [];
	for (let row = 0; row < rows; row++) {
		const currentRow = [];
		for (let col = 0; col < cols; col++) {
			currentRow.push({
				wall: false,
				delay: 0,
			});
			if (Math.random() < 0.5) {
				currentRow[col].delay = (col + row) * 50;
				currentRow[col].wall = true;
			}
		}
		grid.push(currentRow);
	}
	return grid;
};
