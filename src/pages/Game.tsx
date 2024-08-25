import React, { useEffect, useState } from 'react';
import GameBoard from '../components/GameBoard';
import { generateRandomTrees, findFreeAdjacentCell } from '../utils/grid';
import { findPathAStar } from '../utils/pathFinding';
import { Coordinate, Soldier } from '../types';

const cellSize = 40;
const rows = 9;
const cols = 15;
const treeCount = 20;
const redHQ: Coordinate = { x: 2, y: 2 };
const blueHQ: Coordinate = { x: cols - 3, y: rows - 3 };

const Game: React.FC = () => { 
  const [trees, setTrees] = useState<Coordinate[]>([]);
  const [barracks, setBarracks] = useState<{ forE: Coordinate | null, forK: Coordinate | null }>({ forE: null, forK: null });
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [path, setPath] = useState<Coordinate[]>([]);

  useEffect(() => {
    const allHqs = [redHQ, blueHQ];
    const newTrees = generateRandomTrees(treeCount, rows, cols, allHqs);
    setTrees(newTrees);

    const freeCellForRed = findFreeAdjacentCell(redHQ, [...newTrees, ...allHqs], rows, cols);
    const freeCellForBlue = findFreeAdjacentCell(blueHQ, [...newTrees, ...allHqs], rows, cols);
    setBarracks({ forE: freeCellForRed, forK: freeCellForBlue });

    const foundPath = findPathAStar(redHQ, blueHQ, newTrees, rows, cols);
    setPath(foundPath);

    const soldierInterval = setInterval(() => {
      setSoldiers(prev => [...prev, { position: redHQ, path: foundPath, progress: 0, health: 207 }]);
    }, 6000);

    return () => clearInterval(soldierInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSoldiers(prevSoldiers => 
        prevSoldiers.map(soldier => {
          const segmentIndex = Math.floor(soldier.progress);
          if (segmentIndex >= soldier.path.length - 1) {
            soldier.health = 0;
            return { ...soldier, progress: soldier.path.length - 1 };
          }

          const currentSegmentStart = soldier.path[segmentIndex];
          const currentSegmentEnd = soldier.path[segmentIndex + 1];
          const t = soldier.progress - segmentIndex;
          const nextX = currentSegmentStart.x + (currentSegmentEnd.x - currentSegmentStart.x) * t;
          const nextY = currentSegmentStart.y + (currentSegmentEnd.y - currentSegmentStart.y) * t;
          const nextPosition: Coordinate = { x: nextX, y: nextY };

          return { ...soldier, position: nextPosition, progress: soldier.progress + 0.1 };
        }).filter(soldier => soldier.health > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [soldiers]);

  return (
    <GameBoard
      rows={rows}
      cols={cols}
      cellSize={cellSize}
      trees={trees}
      barracks={barracks}
      soldiers={soldiers}
    />
  );
};

export default Game;