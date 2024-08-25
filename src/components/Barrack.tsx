import React from 'react';
import { Coordinate } from '../types';

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