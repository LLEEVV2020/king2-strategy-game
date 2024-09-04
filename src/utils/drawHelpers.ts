import { Coordinate, Soldier } from '../types';

/**
 * Отрисовка сетки на игровом поле
 * @param {CanvasRenderingContext2D} ctx - Контекст канваса
 * @param {number} rows - Количество рядов
 * @param {number} cols - Количество колонок
 * @param {number} cellSize - Размер клетки в пикселях
 */
export const drawGrid = (ctx: CanvasRenderingContext2D, rows: number, cols: number, cellSize: number) => {
    // меняем цвет линий сетки
  ctx.strokeStyle = 'black';
  
  // Точка (0, 0), распологается в левом верхнем углу.
  
  // рисуем вертикальные линии сетки
  // начиная сверху и до низу
  for (let x = 0; x <= cols; x++) {
    // указывает от куда надо начать рисовтаь
    ctx.moveTo(x * cellSize, 0);
    // указывает до куда надо дорисовать линию.
    ctx.lineTo(x * cellSize, rows * cellSize);
  }
  
  // рисуем горизонтальные линии сетки
  // начиная слева и до права
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(cols * cellSize, y * cellSize);
  }
  
  // прорисовывает клетки
  ctx.stroke();
};

/**
 * Отрисовка дерева
 * @param {CanvasRenderingContext2D} ctx - Контекст канваса
 * @param {Coordinate} tree - Координаты дерева
 * @param {number} cellSize - Размер клетки в пикселях
 */
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