import React, { useEffect, useRef, useState } from 'react';

// Основной компонент игры
const Game: React.FC = () => { 
  const canvasRef = useRef<HTMLCanvasElement>(null);
 
  return (
    <canvas
        ref={canvasRef}
    />
  );
};

export default Game;