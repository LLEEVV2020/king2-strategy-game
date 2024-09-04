import { Coordinate } from '../types';
import { DIRECTION } from '../constants';

/**
 * Генерация случайных деревьев на карте
 * @param {number} count - Количество деревьев
 * @param {number} rows - Количество рядов
 * @param {number} cols - Количество колонок
 * @param {Coordinate[]} hqs - Координаты штаб-квартир
 * @returns {Coordinate[]} - Массив координат деревьев
 */
export const generateRandomTrees = (
    count: number, 
    rows: number, 
    cols: number, 
    hqs: Coordinate[]
  ): Coordinate[] => {
    
    const trees: Coordinate[] = [];
    
    // цикл крутится до тех пор, пока не сгенерируем нужное количество деревьев
    while (trees.length < count) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      
      // Проверка, что сгенерированное дерево не попадает на место штаб-квартиры
      if (!hqs.some(hq => hq.x === x && hq.y === y) && 
          // Проверка, что новое дерево не попадает на предыдущие деревья
          !trees.some(tree => tree.x === x && tree.y === y)) {
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
  export const findFreeAdjacentCell = (position: Coordinate, occupiedCells: Coordinate[], rows: number, cols: number): Coordinate | null => {
    
    for (const direction of DIRECTION) {
      const adjacent = { x: position.x + direction.x, y: position.y + direction.y };
      
    // Проверка, что клетка в пределах поля и не занята      
      if (adjacent.x >= 0 && adjacent.x < cols && adjacent.y >= 0 && adjacent.y < rows && 
          !occupiedCells.some(cell => cell.x === adjacent.x && cell.y === adjacent.y)) {
        return adjacent;
      }
    }
    return null;
  };