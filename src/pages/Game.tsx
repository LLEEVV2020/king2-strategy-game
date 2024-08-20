import React, { useEffect, useRef, useState } from 'react';

// Интерфейс для координат
interface Coordinate {
    x: number;
    y: number;
  }
  // Интерфейс для солдатов
  interface Soldier {
    position: Coordinate;
    path: Coordinate[]; // Путь, который должен пройти солдат
    progress: number; // Прогресс движения солдата по пути: от 0 (начало) до 1 (конец)
  }

// Основной компонент игры
const Game: React.FC = () => { 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trees, setTrees] = useState<Coordinate[]>([]);

 
  return (
    <canvas
        ref={canvasRef}
    />
  );
};

export default Game;


    /*
    // Отрисовка пути
    const drawPath = (ctx: CanvasRenderingContext2D, currentPath: Coordinate[], cellSize: number) => {
    if (currentPath.length > 0) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);  // пунктирная линия
      ctx.moveTo(currentPath[0].x * cellSize + cellSize / 2, currentPath[0].y * cellSize + cellSize / 2);
      currentPath.forEach(pos => ctx.lineTo(pos.x * cellSize + cellSize / 2, pos.y * cellSize + cellSize / 2));
      ctx.stroke();
    }
  };*/