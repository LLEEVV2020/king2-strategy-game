// constants.ts

// Константы для размеров и позиций на карте
export const CEL_SIZE = 40;  // Размер клетки в пикселях
export const ROWS = 9; // Количество рядов на игровом поле
export const COLS = 15; // Количество колонок на игровом поле
export const TREE_COUNT = 20; // Количество деревьев на карте
export const RED_HQ = { x: 2, y: 2 }; // Координаты штаб-квартиры красных
export const BLUE_HQ = { x: COLS - 3, y: ROWS - 3 }; // Координаты штаб-квартиры синих

/**
 * Возможные направления движения
 */
export const DIRECTION = [
    { x: 1, y: 0 }, // Вправо
    { x: -1, y: 0 }, // Влево
    { x: 0, y: 1 }, // Вниз
    { x: 0, y: -1 }, // Вверх
  ];