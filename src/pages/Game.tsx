import React, { useEffect, useRef, useState } from 'react';

/**
 * Интерфейс для координат
 * Описывает координаты на карте.
 *
 * @typedef {Object} Coordinate
 * @property {number} x - Координата по оси X.
 * @property {number} y - Координата по оси Y.
 */
interface Coordinate {
  x: number;
  y: number;
}

/**
 * Интерфейс для солдатов
 * Описывает состояние солдата на карте, его позицию, маршрут и прогресс перемещения.
 */
interface Soldier {
  /**
   * Текущая позиция солдата.
   * @type {Coordinate}
   */
  position: Coordinate;

  /**
   * Путь, который должен пройти солдат.
   * Массив координат, описывающих маршрут движения.
   * @type {Coordinate[]}
   */
  path: Coordinate[];

  /**
   * Прогресс движения солдата по пути.
   * Значение от 0 (начало пути) до 1 (конец пути).
   * @type {number}
   */
  progress: number;
}

// Константы для размеров и позиций на карте
const cellSize = 40;  // Размер клетки в пикселях
const rows = 9; // Количество рядов на игровом поле
const cols = 15; // Количество колонок на игровом поле
const treeCount = 20; // Количество деревьев на карте
const redHQ: Coordinate = { x: 2, y: 2 }; // Координаты штаб-квартиры красных
const blueHQ: Coordinate = { x: cols - 3, y: rows - 3 }; // Координаты штаб-квартиры синих

/**
 * Возможные направления движения
 */
const directions = [
  { x: 1, y: 0 }, // Вправо
  { x: -1, y: 0 }, // Влево
  { x: 0, y: 1 }, // Вниз
  { x: 0, y: -1 }, // Вверх
];



/**
 * Отрисовка сетки на игровом поле
 * @param {CanvasRenderingContext2D} ctx - Контекст канваса
 * @param {number} rows - Количество рядов
 * @param {number} cols - Количество колонок
 * @param {number} cellSize - Размер клетки в пикселях
 */
const drawGrid = (ctx: CanvasRenderingContext2D, rows: number, cols: number, cellSize: number) => {
  // меняем цвет линий сетки
  ctx.strokeStyle = 'black';

  // Точка (0, 0), распологается в левом верхнем углу.
  
  // рисуем вертикальные линии сетки
  // начиная сверху и до низу
  for (let x = 0; x <= cols; x++) {
    // указывает от куда надо начать рисовтаь
    ctx.moveTo(x * cellSize, 0);
    // указывает до куда надо дорисовать линию.
    ctx.lineTo(x * cellSize, rows * cellSize);
  }
  // рисуем горизонтальные линии сетки
  // начиная слева и до права
  for (let y = 0; y <= rows; y++) {
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(cols * cellSize, y * cellSize);
  }

  // прорисовывает клетки
  ctx.stroke();
};

/**
 * Отрисовка дерева
 * @param {CanvasRenderingContext2D} ctx - Контекст канваса
 * @param {Coordinate} tree - Координаты дерева
 * @param {number} cellSize - Размер клетки в пикселях
 */
const drawTree = (ctx: CanvasRenderingContext2D, tree: Coordinate, cellSize: number) => {
  ctx.fillStyle = 'green';
  ctx.fillRect(tree.x * cellSize, tree.y * cellSize, cellSize, cellSize);
};


/**
 * Генерация случайных деревьев на карте
 * @param {number} count - Количество деревьев
 * @param {number} rows - Количество рядов
 * @param {number} cols - Количество колонок
 * @param {Coordinate[]} hqs - Координаты штаб-квартир
 * @returns {Coordinate[]} - Массив координат деревьев
 */
const generateRandomTrees = (count: number, rows: number, cols: number, hqs: Coordinate[]): Coordinate[] => {
  const trees: Coordinate[] = [];
  
  // Пока не сгенерируем нужное количество деревьев
  while (trees.length < count) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    
    // Проверка, что сгенерированное дерево не попадает на место штаб-квартиры
    if (!hqs.some(hq => hq.x === x && hq.y === y) && 
    // Проверка, что новое дерево не попадает на предыдущие деревья
        !trees.some(tree => tree.x === x && tree.y === y))  {
      trees.push({ x, y });
    }
  }
  return trees;
};


/**
 * Поиск свободной соседней клетки
 * @param {Coordinate} position - Координаты позиции
 * @param {Coordinate[]} occupiedCells - Координаты занятых клеток
 * @param {number} rows - Количество рядов
 * @param {number} cols - Количество колонок
 * @returns {Coordinate | null} - Координаты свободной клетки или null
 */
const findFreeAdjacentCell = (position: Coordinate, occupiedCells: Coordinate[], rows: number, cols: number): Coordinate | null => {
  for (const direction of directions) {
    const adjacent = { x: position.x + direction.x, y: position.y + direction.y };
    
    // Проверка, что клетка в пределах поля и не занята
    if (adjacent.x >= 0 && adjacent.x < cols && adjacent.y >= 0 && adjacent.y < rows && 
      !occupiedCells.some(cell => cell.x === adjacent.x && cell.y === adjacent.y)) {
      return adjacent;
    }
  }
  return null;
};


/**
 * Евклидово расстояние для поиска пути
 * @param {Coordinate} a - Начальная координата
 * @param {Coordinate} b - Конечная координата
 * @returns {number} - Расстояние
 */
const heuristic = (a: Coordinate, b: Coordinate): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

/**
 * A* алгоритм для поиска пути
 * @param {Coordinate} start - Начальная координата
 * @param {Coordinate} goal - Конечная координата
 * @param {Coordinate[]} obstacles - Координаты препятствий
 * @param {number} rows - Количество рядов
 * @param {number} cols - Количество колонок
 * @returns {Coordinate[]} - Найденный путь
 */
const findPathAStar = (start: Coordinate, goal: Coordinate, obstacles: Coordinate[], rows: number, cols: number): Coordinate[] => {
  const closedSet: Coordinate[] = [];
  const openSet: Coordinate[] = [start];
  const cameFrom: Map<string, Coordinate> = new Map();

  // Карты для хранения текущей стоимости пути и потенциальной стоимости пути
  const gScore: Map<string, number> = new Map();
  gScore.set(`${start.x},${start.y}`, 0);

  const fScore: Map<string, number> = new Map();
  fScore.set(`${start.x},${start.y}`, heuristic(start, goal));

  // Функция проверки препятствий
  const isObstacle = (x: number, y: number): boolean => {
    return obstacles.some(ob => ob.x === x && ob.y === y);
  };

  // Поиск соседних клеток
  const neighbors = (node: Coordinate): Coordinate[] => {
    const neighborList: Coordinate[] = [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 },
    ];

    // Отсеиваем клетки, которые выходят за границы или заняты
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

    // Если достигли конечной точки, формируем путь
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

    // Проверка соседей
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

      // Обновляем карты со значениями
      cameFrom.set(getNodeKey(neighbor), current);
      gScore.set(getNodeKey(neighbor), tentativeGScore);
      fScore.set(getNodeKey(neighbor), tentativeGScore + heuristic(neighbor, goal));
    });
  }

  return [];
};

/**
 * Отрисовка штаб-квартиры
 * @param {CanvasRenderingContext2D} ctx - Контекст канваса
 * @param {Coordinate} hq - Координаты штаб-квартиры
 * @param {string} color - Цвет штаб-квартиры
 * @param {string} symbol - Символ штаб-квартиры
 * @param {number} cellSize - Размер клетки в пикселях
 */
const drawHQ = (ctx: CanvasRenderingContext2D, hq: Coordinate, color: string, symbol: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(hq.x * cellSize, hq.y * cellSize, cellSize, cellSize);
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, hq.x * cellSize + cellSize / 2, hq.y * cellSize + cellSize / 2);
};


/**
 * Отрисовка казармы
 * @param {CanvasRenderingContext2D} ctx - Контекст канваса
 * @param {Coordinate} barrack - Координаты казармы
 * @param {string} color - Цвет казармы
 * @param {number} cellSize - Размер клетки в пикселях
 */
const drawBarrack = (ctx: CanvasRenderingContext2D, barrack: Coordinate, color: string, cellSize: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
  // рисуем гранницы квадрата
  ctx.strokeStyle = 'black';
  ctx.strokeRect(barrack.x * cellSize, barrack.y * cellSize, cellSize, cellSize);
};

// Основной компонент игры
const Game: React.FC = () => { 

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trees, setTrees] = useState<Coordinate[]>([]);
  const [barracks, setBarracks] = useState<{ forE: Coordinate | null, forK: Coordinate | null }>({ forE: null, forK: null }); // Состояние для хранения казарм
  const [soldiers, setSoldiers] = useState<Soldier[]>([]); // Состояние для хранения солдат
  const [path, setPath] = useState<Coordinate[]>([]); // Состояние для хранения пути
 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // создаём ширину и высоту холста
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;
        // Добавляем в массив два штаба, красных и синих
        const allHqs = [redHQ, blueHQ];

        // Получаем 20 деревьев с их координатами на поле
        const newTrees = generateRandomTrees(treeCount, rows, cols, allHqs);
        setTrees(newTrees);  // Установка сгенерированных деревьев

        const freeCellForRed = findFreeAdjacentCell(redHQ, [...newTrees, ...allHqs], rows, cols);
        const freeCellForBlue = findFreeAdjacentCell(blueHQ, [...newTrees, ...allHqs], rows, cols);
        setBarracks({ forE: freeCellForRed, forK: freeCellForBlue });  // Установка казарм

        const foundPath = findPathAStar(redHQ, blueHQ, newTrees, rows, cols);
        setPath(foundPath);  // Установка найденного пути

        // Интервал для добавления солдат
        const soldierInterval = setInterval(() => {
          setSoldiers(prev => { 
            //console.log(prev);
            return [
              ...prev,
              { position: redHQ, path: foundPath, progress: 0, health: 207 }
            ]
          });
        }, 6000);

        // Очистка интервала при размонтировании компонента
        return () => {
          clearInterval(soldierInterval);
        };

      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // обязательно нужно очищать, иначе за анимацией будет след
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Очистка канваса
        drawGrid(ctx, rows, cols, cellSize);  // Отрисовка сетки
        trees.forEach(tree => drawTree(ctx, tree, cellSize));  // Отрисовка деревьев
      
        drawHQ(ctx, redHQ, 'red', 'E', cellSize);  // Отрисовка красной штаб-квартиры
        drawHQ(ctx, blueHQ, 'blue', 'K', cellSize);  // Отрисовка синей штаб-квартиры
      
        if (barracks.forE) drawBarrack(ctx, barracks.forE, 'red', cellSize);  // Отрисовка красной казармы
        if (barracks.forK) drawBarrack(ctx, barracks.forK, 'blue', cellSize);  // Отрисовка синей казармы

      }
    }

  }, [soldiers, path, trees, barracks]);


  return (
    <canvas
        ref={canvasRef}
    />
  );
};

export default Game;


  /*
  // Отрисовка пути
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
};*/