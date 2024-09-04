import React from 'react';
import { Coordinate } from '../types';

// !!! Компанент создан, но он ни где не используется
// ! поэтому и не стал здесь расписывать комментарии
interface BarrackProps {
  barrack: Coordinate;
  color: string;
  cellSize: number;
}

const Barrack: React.FC<BarrackProps> = ({ barrack, color, cellSize }) => {
  return (
    <rect x={barrack.x * cellSize} y={barrack.y * cellSize} width={cellSize} height={cellSize} fill={color} stroke="black" />
  );
};

export default Barrack;