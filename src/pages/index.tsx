import React, { useEffect, useRef, useState } from 'react';

const GRID_WIDTH = 16;
const GRID_HEIGHT = 9;
const CELL_SIZE = 50;

const PLAYER_BASE_HEALTH = 2000;
const ENEMY_BASE_HEALTH = 1100;

const UNIT_SPEED_PLAYER = 100; // px per second
const UNIT_SPEED_ENEMY = 50; // px per second

interface Point {
  x: number;
  y: number;
}

interface Unit {
  path: Point[];
  position: number;
  type: 'player' | 'enemy';
}

interface Base {
  x: number;
  y: number;
  health: number;
  type: 'player' | 'enemy';
}

interface Barrack {
  x: number;
  y: number;
  type: 'player' | 'enemy';
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerBase] = useState<Base>({ x: 1, y: 1, health: PLAYER_BASE_HEALTH, type: 'player' });
  const [enemyBase] = useState<Base>({ x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2, health: ENEMY_BASE_HEALTH, type: 'enemy' });
  const [playerBarracks, setPlayerBarracks] = useState<Barrack[]>([
    { x: 1, y: 2, type: 'player' },
    { x: 1, y: 3, type: 'player' },
    { x: 1, y: 4, type: 'player' },
    { x: 1, y: 5, type: 'player' }
  ]);
  const [enemyBarracks, setEnemyBarracks] = useState<Barrack[]>([
    { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 3, type: 'enemy' }
  ]);

  const [units, setUnits] = useState<Unit[]>([]);
  const [isPathCreating, setIsPathCreating] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  useEffect(() => {
    const addEnemyBarracks = () => {
      setEnemyBarracks((prev) => {
        const newBarrackX = GRID_WIDTH - 2;
        const newBarrackY = GRID_HEIGHT - (3 + prev.length);
        return prev.length < 4
          ? [...prev, { x: newBarrackX, y: newBarrackY, type: 'enemy' }]
          : prev;
      });
    };
    const interval = setInterval(() => {
      addEnemyBarracks();
    }, 5000);
    return () => clearInterval(interval);
  }, [enemyBarracks]);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const canvas = canvasRef.current!;

    const drawGrid = () => {
      for (let x = 0; x < canvas.width; x += CELL_SIZE) {
        for (let y = 0; y < canvas.height; y += CELL_SIZE) {
          ctx.strokeStyle = '#ccc';
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    };

    const drawBasesAndBarracks = () => {
      ctx.fillStyle = 'blue';
      ctx.fillRect(playerBase.x * CELL_SIZE, playerBase.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      ctx.fillStyle = 'red';
      ctx.fillRect(enemyBase.x * CELL_SIZE, enemyBase.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      ctx.fillStyle = 'lightblue';
      playerBarracks.forEach(barrack => {
        ctx.fillRect(barrack.x * CELL_SIZE, barrack.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

      ctx.fillStyle = 'orange';
      enemyBarracks.forEach(barrack => {
        ctx.fillRect(barrack.x * CELL_SIZE, barrack.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    };

    const drawUnits = () => {
      units.forEach(unit => {
        const stepIndex = Math.floor(unit.position);
        const nextStepIndex = Math.min(stepIndex + 1, unit.path.length - 1);

        const currentStep = unit.path[stepIndex];
        const nextStep = unit.path[nextStepIndex];

        const t = unit.position - stepIndex;

        const x = currentStep.x * (1 - t) + nextStep.x * t;
        const y = currentStep.y * (1 - t) + nextStep.y * t;

        ctx.fillStyle = unit.type === 'player' ? 'lightblue' : 'orange';

        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 4,
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    };

    const updateUnits = (timeElapsed: number) => {
      setUnits(prev => {
        return prev.map(unit => {
          const speed = unit.type === 'player' ? UNIT_SPEED_PLAYER : UNIT_SPEED_ENEMY;
          const newPos = unit.position + (speed * timeElapsed) / 1000;
          if (newPos >= unit.path.length - 1) {
            return null;
          }
          return { ...unit, position: newPos };
        }).filter(unit => unit !== null) as Unit[];
      });
    };

    const render = (prevTime: number) => {
      const now = performance.now();
      const timeElapsed = now - prevTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawBasesAndBarracks();
      drawUnits();
      updateUnits(timeElapsed);
      
      requestAnimationFrame(() => render(now));
    };

    requestAnimationFrame((time) => render(time));

  }, [units, isPathCreating, currentPath]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (playerBarracks.some(barrack => barrack.x === x && barrack.y === y)) {
      setIsPathCreating(true);
      setCurrentPath([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isPathCreating) return;
  
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  
    setCurrentPath(prevPath => {
      if (prevPath.some(point => point.x === x && point.y === y)) return prevPath;
      return [...prevPath, { x, y }];
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isPathCreating) return;
  
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  
    if (x === enemyBase.x && y === enemyBase.y) {
      setUnits(prev => [...prev, { path: [...currentPath, { x, y }], position: 0, type: 'player' }]);
    }
  
    setIsPathCreating(false);
    setCurrentPath([]);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={GRID_WIDTH * CELL_SIZE}
        height={GRID_HEIGHT * CELL_SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <button onClick={() => window.location.reload()}>Restart</button>
    </div>
  );
};

export default Game;