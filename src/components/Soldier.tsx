import React from 'react';
import { Coordinate, Soldier } from '../types';

// !!! Компанент создан, но он ни где не используется
// ! поэтому и не стал здесь расписывать комментарии
interface SoldierProps {
  soldier: Soldier;
  color: string;
  cellSize: number;
}

const SoldierComponent: React.FC<SoldierProps> = ({ soldier, color, cellSize }) => {
  const centerX = soldier.position.x * cellSize + cellSize / 2;
  const centerY = soldier.position.y * cellSize + cellSize / 2;

  return (
    <circle cx={centerX} cy={centerY} r={cellSize / 4} fill={color} />
  );
};

export default SoldierComponent;