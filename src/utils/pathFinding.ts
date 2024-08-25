import { Coordinate } from '../types';


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
export const findPathAStar = (start: Coordinate, goal: Coordinate, obstacles: Coordinate[], rows: number, cols: number): Coordinate[] => {
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