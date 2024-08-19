import React, { useEffect, useRef, useState } from 'react';

interface Coordinate {
  x: number;
  y: number;
}

interface Soldier {
  position: Coordinate;
  index: number;
}

const cellSize = 40;  // Размер клетки в пикселях
const rows = 9;
const cols = 15;
const treeCount = 20;
const redHQ: Coordinate = { x: 2, y: 2 };
const blueHQ: Coordinate = { x: cols - 3, y: rows - 3 };

const directions = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const generateRandomTrees = (count: number, rows: number, cols: number, hqs: Coordinate[]): Coordinate[] => {
  const trees: Coordinate[] = [];
  while (trees.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const isHQ = hqs.some(hq => hq.x === x && hq.y === y);
    if (!isHQ && !trees.some(tree => tree.x === x && tree.y === y)) {
      trees.push({ x, y });
    }
  }
  return trees;
};

const findFreeAdjacentCell = (position: Coordinate, occupiedCells: Coordinate[], rows: number, cols: number): Coordinate | null => {
  for (const direction of directions) {
    const adjacent = { x: position.x + direction.x, y: position.y + direction.y };
    if (adjacent.x >= 0 && adjacent.x < cols && adjacent.y >= 0 && adjacent.y < rows && 
      !occupiedCells.some(cell => cell.x === adjacent.x && cell.y === adjacent.y)) {
      return adjacent;
    }
  }
  return null;
};

const drawGrid = (ctx: CanvasRenderingContext2D, rows: number, cols: number, cellSize: number) => {
  ctx.strokeStyle = 'black';
  for (let x = 0; x <= cols; x++) {
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, rows * cellSize);
  }
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(cols * cellSize, y * cellSize);
  }
  ctx.stroke();
};

const drawTree = (ctx: CanvasRenderingContext2D, tree: Coordinate, cellSize: number) => {
  ctx.fillStyle = 'green';
  ctx.fillRect(tree.x * cellSize, tree.y * cellSize, cellSize, cellSize);
};

const drawHQ = (ctx: CanvasRenderingContext2D, hq: Coordinate, color: string, symbol: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(hq.x * cellSize, hq.y * cellSize, cellSize, cellSize);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, hq.x * cellSize + cellSize / 2, hq.y * cellSize + cellSize / 2);
};

const drawBarrack = (ctx: CanvasRenderingContext2D, barrack: Coordinate, color: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
};

const drawSoldier = (ctx: CanvasRenderingContext2D, soldier: Soldier, color: string, cellSize: number) => {
  ctx.fillStyle = color;
  const centerX = soldier.position.x * cellSize + cellSize / 2;
  const centerY = soldier.position.y * cellSize + cellSize / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, cellSize / 4, 0, 2 * Math.PI);
  ctx.fill();
};

const heuristic = (a: Coordinate, b: Coordinate): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const findPathAStar = (start: Coordinate, goal: Coordinate, obstacles: Coordinate[], rows: number, cols: number): Coordinate[] => {
  const closedSet: Coordinate[] = [];
  const openSet: Coordinate[] = [start];
  const cameFrom: Map<string, Coordinate> = new Map();

  const gScore: Map<string, number> = new Map();
  gScore.set(`${start.x},${start.y}`, 0);

  const fScore: Map<string, number> = new Map();
  fScore.set(`${start.x},${start.y}`, heuristic(start, goal));

  const isObstacle = (x: number, y: number): boolean => {
    return obstacles.some(ob => ob.x === x && ob.y === y);
  };

  const neighbors = (node: Coordinate): Coordinate[] => {
    const neighborList: Coordinate[] = [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 },
    ];

    return neighborList.filter(neighbor => 
      neighbor.x >= 0 && neighbor.x < cols && 
      neighbor.y >= 0 && neighbor.y < rows && 
      !isObstacle(neighbor.x, neighbor.y)
    );
  };

  const getNodeKey = (node: Coordinate): string => `${node.x},${node.y}`;

  while (openSet.length > 0) {
    openSet.sort((a, b) => {
      const aFScore = fScore.get(getNodeKey(a)) || Infinity;
      const bFScore = fScore.get(getNodeKey(b)) || Infinity;
      return aFScore - bFScore;
    });

    const current = openSet.shift() as Coordinate;

    if (current.x === goal.x && current.y === goal.y) {
      let path: Coordinate[] = [];
      let temp = current;
      while (temp) {
        path.push(temp);
        temp = cameFrom.get(getNodeKey(temp)) as Coordinate;
      }
      return path.reverse();
    }

    closedSet.push(current);

    neighbors(current).forEach(neighbor => {
      if (closedSet.some(closedNode => closedNode.x === neighbor.x && closedNode.y === neighbor.y)) {
        return;
      }

      const tentativeGScore = (gScore.get(getNodeKey(current)) || Infinity) + 1;

      if (!openSet.some(openNode => openNode.x === neighbor.x && openNode.y === neighbor.y)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore.get(getNodeKey(neighbor)) || Infinity)) {
        return;
      }

      cameFrom.set(getNodeKey(neighbor), current);
      gScore.set(getNodeKey(neighbor), tentativeGScore);
      fScore.set(getNodeKey(neighbor), tentativeGScore + heuristic(neighbor, goal));
    });
  }

  return [];
};

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
};

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationPath, setAnimationPath] = useState<Coordinate[]>([]);
  const [trees, setTrees] = useState<Coordinate[]>([]);
  const [barracks, setBarracks] = useState<{ forE: Coordinate | null, forK: Coordinate | null }>({ forE: null, forK: null });
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [requestId, setRequestId] = useState<number | null>(null);
  const [path, setPath] = useState<Coordinate[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;

        const allHqs = [redHQ, blueHQ];
        const newTrees = generateRandomTrees(treeCount, rows, cols, allHqs);
        setTrees(newTrees);

        const freeCellForRed = findFreeAdjacentCell(redHQ, [...newTrees, ...allHqs], rows, cols);
        const freeCellForBlue = findFreeAdjacentCell(blueHQ, [...newTrees, ...allHqs], rows, cols);
        setBarracks({ forE: freeCellForRed, forK: freeCellForBlue });

        const render = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawGrid(ctx, rows, cols, cellSize);
          newTrees.forEach(tree => drawTree(ctx, tree, cellSize));
          drawHQ(ctx, redHQ, 'red', 'E', cellSize);
          drawHQ(ctx, blueHQ, 'blue', 'K', cellSize);
          if (freeCellForRed) drawBarrack(ctx, freeCellForRed, 'red', cellSize);
          if (freeCellForBlue) drawBarrack(ctx, freeCellForBlue, 'blue', cellSize);
        };

        render();

        const foundPath = findPathAStar(redHQ, blueHQ, newTrees, rows, cols);
        setPath(foundPath);

        let startTime: number | null = null;

        const animatePath = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;

          const step = Math.floor(progress / 100);  // обновляем каждые 100 мс
          
          if (step < foundPath.length) {
            setAnimationPath(foundPath.slice(0, step + 1));
            const reqId = requestAnimationFrame(animatePath);
            setRequestId(reqId);
          } else {
            cancelAnimationFrame(requestId as number);
            setRequestId(null);
          }
        };

        const reqId = requestAnimationFrame(animatePath);
        setRequestId(reqId);

        const soldierInterval = setInterval(() => {
          setSoldiers(prev => [...prev, { position: redHQ, index: 0 }]);
        }, 6000);

        return () => {
          if (requestId) {
            cancelAnimationFrame(requestId);
          }
          clearInterval(soldierInterval);
        };
      }
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSoldiers(prevSoldiers =>
        prevSoldiers.map(soldier => {
          if (soldier.index < path.length - 1) {
            return { ...soldier, index: soldier.index + 0.25 };
          }
          return soldier;
        })
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [path]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGrid(ctx, rows, cols, cellSize);
        trees.forEach(tree => drawTree(ctx, tree, cellSize));
        drawHQ(ctx, redHQ, 'red', 'E', cellSize);
        drawHQ(ctx, blueHQ, 'blue', 'K', cellSize);
        if (barracks.forE) drawBarrack(ctx, barracks.forE, 'red', cellSize);
        if (barracks.forK) drawBarrack(ctx, barracks.forK, 'blue', cellSize);
        drawPath(ctx, animationPath, cellSize);
        soldiers.forEach(soldier => drawSoldier(ctx, { position: path[Math.floor(soldier.index)] || soldier.position, index: soldier.index }, 'red', cellSize));
      }
    }
  }, [animationPath, trees, barracks, soldiers]);

  return <canvas ref={canvasRef} />;
};

export default Game;