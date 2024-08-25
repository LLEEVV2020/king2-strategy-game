import { Coordinate } from '../types';

export const generateRandomTrees = (
    count: number, 
    rows: number, 
    cols: number, 
    hqs: Coordinate[]
  ): Coordinate[] => {
    const trees: Coordinate[] = [];
    
    while (trees.length < count) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      
      if (!hqs.some(hq => hq.x === x && hq.y === y) && !trees.some(tree => tree.x === x && tree.y === y)) {
        trees.push({ x, y });
      }
    }
    
    return trees;
  };
  
  export const findFreeAdjacentCell = (position: Coordinate, occupiedCells: Coordinate[], rows: number, cols: number): Coordinate | null => {
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    
    for (const direction of directions) {
      const adjacent = { x: position.x + direction.x, y: position.y + direction.y };
      
      if (adjacent.x >= 0 && adjacent.x < cols && adjacent.y >= 0 && adjacent.y < rows && 
          !occupiedCells.some(cell => cell.x === adjacent.x && cell.y === adjacent.y)) {
        return adjacent;
      }
    }
    return null;
  };