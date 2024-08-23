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
    const isHQ = hqs.some(hq => hq.x === x && hq.y === y);
    // Проверка, что новое дерево не попадает на предыдущие деревья
    const isTrees = trees.some(tree => tree.x === x && tree.y === y);
    // объединяем вышеперечислеенные две проверки, если условие верное, то добавляем в массив дерево                 
    if (!isHQ && !isTrees) {
      trees.push({ x, y });
    }
  }
  return trees;
};


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
        console.log(newTrees);
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