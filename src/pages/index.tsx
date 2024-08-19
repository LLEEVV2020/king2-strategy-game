import React, { useEffect, useRef, useState } from 'react';

interface Coordinate {
  x: number;
  y: number;
}

const cellSize = 40;  // Размер клетки в пикселях
const rows = 9;
const cols = 15;
const treeCount = 20;
const redHQ: Coordinate = { x: 0, y: 0 };
const blueHQ: Coordinate = { x: cols - 1, y: rows - 1 };

const generateRandomTrees = (count: number, rows: number, cols: number): Coordinate[] => {
  const trees: Coordinate[] = [];
  while (trees.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const isHQ = (x === redHQ.x && y === redHQ.y) || (x === blueHQ.x && y === blueHQ.y);
    if (!isHQ && !trees.some(tree => tree.x === x && tree.y === y)) {
      trees.push({ x, y });
    }
  }
  return trees;
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
      { x: node.x, y: node.y - 1 }
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
  const [requestId, setRequestId] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;

        const newTrees = generateRandomTrees(treeCount, rows, cols);
        setTrees(newTrees);

        const render = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          drawGrid(ctx, rows, cols, cellSize);

          newTrees.forEach(tree => drawTree(ctx, tree, cellSize));

          drawHQ(ctx, redHQ, 'red', 'E', cellSize);
          drawHQ(ctx, blueHQ, 'blue', 'K', cellSize);
        };

        render();

        const path = findPathAStar(redHQ, blueHQ, newTrees, rows, cols);
        let startTime: number | null = null;

        const animatePath = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;

          const step = Math.floor(progress / 100);  // обновляем каждые 100 мс
          
          if (step < path.length) {
            setAnimationPath(path.slice(0, step + 1));
            const reqId = requestAnimationFrame(animatePath);
            setRequestId(reqId);
          } else {
            cancelAnimationFrame(requestId as number);
            setRequestId(null);
          }
        };

        const reqId = requestAnimationFrame(animatePath);
        setRequestId(reqId);

        return () => {
          if (requestId) {
            cancelAnimationFrame(requestId);
          }
        };
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGrid(ctx, rows, cols, cellSize);
        trees.forEach(tree => drawTree(ctx, tree, cellSize));
        drawHQ(ctx, redHQ, 'red', 'E', cellSize);
        drawHQ(ctx, blueHQ, 'blue', 'K', cellSize);
        drawPath(ctx, animationPath, cellSize);
      }
    }
  }, [animationPath, trees]);

  return <canvas ref={canvasRef} />;
};

export default Game;