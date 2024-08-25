
import React from 'react';
import { Coordinate } from '../types';

interface HQProps {
  hq: Coordinate;
  color: string;
  symbol: string;
  cellSize: number;
}

const HeadQuarter: React.FC<HQProps> = ({ hq, color, symbol, cellSize }) => {
  return (
    <>
      <rect x={hq.x * cellSize} y={hq.y * cellSize} width={cellSize} height={cellSize} fill={color} />
      <text x={hq.x * cellSize + cellSize / 2} y={hq.y * cellSize + cellSize / 2} fill="white" fontSize={20} textAnchor="middle" alignmentBaseline="middle">
        {symbol}
      </text>
    </>
  );
};

export default HeadQuarter;