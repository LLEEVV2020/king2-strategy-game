/**
 * Интерфейс для координат
 * Описывает координаты на карте.
 *
 * @typedef {Object} Coordinate
 * @property {number} x - Координата по оси X.
 * @property {number} y - Координата по оси Y.
 */
export interface Coordinate {
    x: number;
    y: number;
  }
  
/**
 * Интерфейс для солдатов
 * Описывает состояние солдата на карте, его позицию, маршрут и прогресс перемещения.

* @typedef {Object} Soldier
* @property {Coordinate} position - Текущая позиция солдата.
* @property {Coordinate[]} path -  Путь, который должен пройти солдат.
* @property {number} progress -  Прогресс движения солдата по пути.
* @property {number} health - Здоровье для воинов
*/
export interface Soldier {
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

  /**
   * Здоровье для воинов
   * @type {number}
   */
  health: number;
}