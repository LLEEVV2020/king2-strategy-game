import { Coordinate, Soldier } from '../types';

export const drawGrid = (ctx: CanvasRenderingContext2D, rows: number, cols: number, cellSize: number) => {
  ctx.strokeStyle = 'black';
  
  for (let x = 0; x <= cols; x++) {
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, rows * cellSize);
  }
  
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(cols * cellSize, y * cellSize);
  }

  ctx.stroke();
};

export const drawTree = (ctx: CanvasRenderingContext2D, tree: Coordinate, cellSize: number) => {
  ctx.fillStyle = 'green';
  ctx.fillRect(tree.x * cellSize, tree.y * cellSize, cellSize, cellSize);
};

export const drawHQ = (ctx: CanvasRenderingContext2D, hq: Coordinate, color: string, symbol: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(hq.x * cellSize, hq.y * cellSize, cellSize, cellSize);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, hq.x * cellSize + cellSize / 2, hq.y * cellSize + cellSize / 2);
};

export const drawBarrack = (ctx: CanvasRenderingContext2D, barrack: Coordinate, color: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
};

export const drawSoldier = (ctx: CanvasRenderingContext2D, soldier: Soldier, color: string, cellSize: number) => {
  ctx.fillStyle = color;
  const centerX = soldier.position.x * cellSize + cellSize / 2;
  const centerY = soldier.position.y * cellSize + cellSize / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, cellSize / 4, 0, 2 * Math.PI);
  ctx.fill();
};