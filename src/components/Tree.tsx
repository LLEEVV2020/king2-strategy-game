import React from 'react';
import { Coordinate } from '../types';

interface TreeProps {
  tree: Coordinate;
  cellSize: number;
}

const TreeComponent: React.FC<TreeProps> = ({ tree, cellSize }) => {
  return (
    <rect x={tree.x * cellSize} y={tree.y * cellSize} width={cellSize} height={cellSize} fill="green" />
  );
};

export default TreeComponent;