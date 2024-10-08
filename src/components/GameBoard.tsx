import React, { useEffect, useRef } from 'react';
import { drawGrid, drawTree, drawHQ, drawBarrack, drawSoldier } from '../utils/drawHelpers';
import { Coordinate, Soldier } from '../types';
// !!! Вынужден подключать дополнительные константы
import { BLUE_HQ, RED_HQ } from '../constants';


interface GameBoardProps {
  rows: number;
  cols: number;
  cellSize: number;
  trees: Coordinate[];
  barracks: { forE: Coordinate | null, forK: Coordinate | null };
  soldiers: Soldier[];
}

const GameBoard: React.FC<GameBoardProps> = ({ rows, cols, cellSize, trees, barracks, soldiers }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // обязательно нужно очищать, иначе за анимацией будет след
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка канваса
        drawGrid(ctx, rows, cols, cellSize); // Отрисовка сетки
        trees.forEach(tree => drawTree(ctx, tree, cellSize));

        drawHQ(ctx, RED_HQ, 'red', 'E', cellSize);  // Отрисовка красной штаб-квартиры
        drawHQ(ctx, BLUE_HQ, 'blue', 'K', cellSize);  // Отрисовка синей штаб-квартиры
      
        if (barracks.forE) drawBarrack(ctx, barracks.forE, 'red', cellSize);  // Отрисовка красной казармы
        if (barracks.forK) drawBarrack(ctx, barracks.forK, 'blue', cellSize);  // Отрисовка синей казармы

        soldiers.forEach(soldier => drawSoldier(ctx, soldier, 'red', cellSize));  // Отрисовка солдат
      }
    }
  }, [rows, cols, cellSize, trees, barracks, soldiers]);

  return (
    <canvas ref={canvasRef} width={cols * cellSize} height={rows * cellSize} />
  );
};

export default GameBoard;