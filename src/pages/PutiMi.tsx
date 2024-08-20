import React, { useEffect, useRef, useState } from 'react';

// Интерфейс для координат клетки
interface Coordinate {
  x: number;
  y: number;
}

// Константы игрового поля
const cellSize = 40;  // Размер клетки в пикселях
const rows = 9;  // Количество строк на игровом поле
const cols = 15;  // Количество колонок на игровом поле
const treeCount = 20;  // Количество деревьев на игровом поле
const redHQ: Coordinate = { x: 2, y: 2 };  // Координаты штаба красной команды
const blueHQ: Coordinate = { x: cols - 3, y: rows - 3 };  // Координаты штаба синей команды

// Направления для перемещения по соседним клеткам
const directions = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

// Генерация случайных деревьев, исключая координаты штабов
const generateRandomTrees = (count: number, rows: number, cols: number, hqs: Coordinate[]): Coordinate[] => {
  const trees: Coordinate[] = [];
  while (trees.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const isHQ = hqs.some(hq => hq.x === x && hq.y === y); // Проверка, не совпадают ли координаты с координатами штабов
    if (!isHQ && !trees.some(tree => tree.x === x && tree.y === y)) { // Исключение дублирования деревьев
      trees.push({ x, y });
    }
  }
  return trees;
};

// Поиск свободной соседней клетки для размещения казармы
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

// Функция рисования сетки на канвасе
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

// Функция для рисования дерева на канвасе
const drawTree = (ctx: CanvasRenderingContext2D, tree: Coordinate, cellSize: number) => {
  ctx.fillStyle = 'green';
  ctx.fillRect(tree.x * cellSize, tree.y * cellSize, cellSize, cellSize);

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', tree.x * cellSize + cellSize / 2, tree.y * cellSize + cellSize / 2);
};

// Функция для рисования штаба на канвасе
const drawHQ = (ctx: CanvasRenderingContext2D, hq: Coordinate, color: string, symbol: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(hq.x * cellSize, hq.y * cellSize, cellSize, cellSize);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, hq.x * cellSize + cellSize / 2, hq.y * cellSize + cellSize / 2);
};

// Функция для рисования казармы на канвасе
const drawBarrack = (ctx: CanvasRenderingContext2D, barrack: Coordinate, color: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
};

// Функция эвристики для алгоритма A*
const heuristic = (a: Coordinate, b: Coordinate): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Функция поиска пути с использованием алгоритма A*
const findPathAStar = (start: Coordinate, goal: Coordinate, obstacles: Coordinate[], rows: number, cols: number): Coordinate[] => {
  const closedSet: Coordinate[] = [];  // Множество закрытых узлов
  const openSet: Coordinate[] = [start];  // Множество открытых узлов для обработки
  const cameFrom: Map<string, Coordinate> = new Map();  // Карта, откуда пришли
  const gScore: Map<string, number> = new Map();  // Карта стоимости пути от начала до текущего узла
  gScore.set(`${start.x},${start.y}`, 0);
  const fScore: Map<string, number> = new Map();  // Карта стоимости пути от текущего узла до цели
  fScore.set(`${start.x},${start.y}`, heuristic(start, goal));

  // Функция проверки, является ли точка препятствием
  const isObstacle = (x: number, y: number): boolean => {
    return obstacles.some(ob => ob.x === x && ob.y === y);
  };

  // Функция для возврата соседних узлов
  const neighbors = (node: Coordinate): Coordinate[] => {
    const neighborList: Coordinate[] = [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 },
    ];

    // Возвращаем только валидные узлы (не вне границ и не препятствия)
    return neighborList.filter(neighbor => 
      neighbor.x >= 0 && neighbor.x < cols && 
      neighbor.y >= 0 && neighbor.y < rows && 
      !isObstacle(neighbor.x, neighbor.y)
    );
  };

  // Функция для получения ключа узла (используется для карты)
  const getNodeKey = (node: Coordinate): string => `${node.x},${node.y}`;

  while (openSet.length > 0) {
    // Сортировка открытого множества по fScore
    openSet.sort((a, b) => {
      const aFScore = fScore.get(getNodeKey(a)) || Infinity;
      const bFScore = fScore.get(getNodeKey(b)) || Infinity;
      return aFScore - bFScore;
    });

    const current = openSet.shift() as Coordinate;  // Текущий узел с наименьшим fScore

    // Если достигли цели, строим путь
    if (current.x === goal.x && current.y === goal.y) {
      let path: Coordinate[] = [];
      let temp = current;
      while (temp) {
        path.push(temp);
        temp = cameFrom.get(getNodeKey(temp)) as Coordinate;
      }
      return path.reverse();  // Возвращаем путь в правильном порядке
    }

    closedSet.push(current);  // Добавляем текущий узел в закрытое множество

    // Обработка соседних узлов
    neighbors(current).forEach(neighbor => {
      if (closedSet.some(closedNode => closedNode.x === neighbor.x && closedNode.y === neighbor.y)) {
        return;  // Если соседний узел уже в закрытом множестве, пропускаем его
      }

      const tentativeGScore = (gScore.get(getNodeKey(current)) || Infinity) + 1;  // Стоимость пути до соседнего узла

      if (!openSet.some(openNode => openNode.x === neighbor.x && openNode.y === neighbor.y)) {
        openSet.push(neighbor);  // Добавляем соседний узел в открытое множество, если его там нет
      } else if (tentativeGScore >= (gScore.get(getNodeKey(neighbor)) || Infinity)) {
        return;  // Если новый путь к соседнему узлу не лучше, пропускаем его
      }

      // Обновляем данные о лучшем пути к соседнему узлу
      cameFrom.set(getNodeKey(neighbor), current);
      gScore.set(getNodeKey(neighbor), tentativeGScore);
      fScore.set(getNodeKey(neighbor), tentativeGScore + heuristic(neighbor, goal));
    });
  }

  return [];  // Если не нашли пути, возвращаем пустой массив
};

// Отрисовка пути на канвасе
const drawPath = (ctx: CanvasRenderingContext2D, currentPath: Coordinate[], cellSize: number, color: string) => {
  if (currentPath.length > 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.setLineDash([5, 5]);  // пунктирная линия
    ctx.moveTo(currentPath[0].x * cellSize + cellSize / 2, currentPath[0].y * cellSize + cellSize / 2);
    currentPath.forEach(pos => ctx.lineTo(pos.x * cellSize + cellSize / 2, pos.y * cellSize + cellSize / 2));
    ctx.stroke();
  }
};

// Основной компонент игры
const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);  // Ссылка на элемент канваса
  const [animationPath, setAnimationPath] = useState<Coordinate[]>([]);  // Анимация пути
  const [trees, setTrees] = useState<Coordinate[]>([]);  // Координаты деревьев
  const [barracks, setBarracks] = useState<{ forE: Coordinate | null, forK: Coordinate | null }>({ forE: null, forK: null });  // Координаты казарм
  const [requestId, setRequestId] = useState<number | null>(null);  // ID запроса анимации
  const [isDrawingBlueLine, setIsDrawingBlueLine] = useState<boolean>(false);  // Флаг рисования синей линии
  const [blueLinePath, setBlueLinePath] = useState<Coordinate[]>([]);  // Путь синей линии
  const [originKClicked, setOriginKClicked] = useState<boolean>(false);  // Флаг клика по казарме

  // useEffect для инициализации игры
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

  // useEffect для перерисовки канваса при изменении состояния
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
        drawPath(ctx, animationPath, cellSize, 'red');
        drawPath(ctx, blueLinePath, cellSize, 'blue');
      }
    }
  }, [animationPath, trees, barracks, blueLinePath]);

  // Обработка кликов по канвасу
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);
      const position = { x, y };

      if (isDrawingBlueLine) {
        // Если мы рисуем синюю линию и кликаем на штаб E (красный штаб)
        if (position.x === redHQ.x && position.y === redHQ.y) {
          setIsDrawingBlueLine(false);
          setOriginKClicked(false);

          // Валидация правильности пути
          if (validatePath([...blueLinePath, position])) {
            setBlueLinePath([...blueLinePath, position]);
          } else {
            setBlueLinePath([]);
          }
        } else {
          setBlueLinePath([]);
          setOriginKClicked(false);
          setIsDrawingBlueLine(false);
        }
      } else {
        // Если кликаем на казарму K, начинаем рисовать линию
        if (barracks.forK && position.x === barracks.forK.x && position.y === barracks.forK.y) {
          setBlueLinePath([{ x: blueHQ.x, y: blueHQ.y }]);
          setIsDrawingBlueLine(true);
          setOriginKClicked(true);
        }
      }
    }
  };

  // Обработка перемещения мыши над канвасом
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (isDrawingBlueLine && canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / cellSize);
      const y = Math.floor((event.clientY - rect.top) / cellSize);
      const position = { x, y };
  
      const lastPoint = blueLinePath[blueLinePath.length - 1];
  
      // Проверка, есть ли движение по прямой линии, отсутствие пересечения с деревьями и границ
      if ((x !== lastPoint.x || y !== lastPoint.y) &&
          (x === lastPoint.x || y === lastPoint.y) &&
          !trees.some(tree => tree.x === x && tree.y === y) &&
          x >= 0 && x < cols && y >= 0 && y < rows) {
  
        const newPath = [...blueLinePath, position];
        if (validatePath(newPath)) {
          setBlueLinePath(newPath);
        }
      }
    }
  };

  // Валидация пути (проверка на правильность и допустимость)
  const validatePath = (path: Coordinate[]): boolean => {
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      if (!(curr.x === prev.x || curr.y === prev.y) ||
          (Math.abs(prev.x - curr.x) > 1 || Math.abs(prev.y - curr.y) > 1)) {
        return false;
      }
  
      // Проверка если путь пересекает дерево
      if (trees.some(tree => tree.x === curr.x && tree.y === curr.y)) {
        return false;
      }
  
      // Проверка границ
      if (curr.x < 0 || curr.x >= cols || curr.y < 0 || curr.y >= rows) {
        return false;
      }
    }
  
    return true;
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
    />
  );
};

export default Game;