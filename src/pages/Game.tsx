import React, { useEffect, useState } from 'react';
import GameBoard from '../components/GameBoard';
import { generateRandomTrees, findFreeAdjacentCell } from '../utils/grid';
import { findPathAStar } from '../utils/pathFinding';
import { Coordinate, Soldier } from '../types';

// Константы для размеров и позиций на карте
const cellSize = 40;  // Размер клетки в пикселях
const rows = 9; // Количество рядов на игровом поле
const cols = 15; // Количество колонок на игровом поле
const treeCount = 20; // Количество деревьев на карте
const redHQ: Coordinate = { x: 2, y: 2 }; // Координаты штаб-квартиры красных
const blueHQ: Coordinate = { x: cols - 3, y: rows - 3 }; // Координаты штаб-квартиры синих


const Game: React.FC = () => { 
  const [trees, setTrees] = useState<Coordinate[]>([]);
  const [barracks, setBarracks] = useState<{ forE: Coordinate | null, forK: Coordinate | null }>({ forE: null, forK: null });
  const [soldiers, setSoldiers] = useState<Soldier[]>([]); // Состояние для хранения солдат
  const [path, setPath] = useState<Coordinate[]>([]); // Состояние для хранения пути


  useEffect(() => {
    // Добавляем в массив два штаба, красных и синих
    const allHqs = [redHQ, blueHQ];
  
    // Получаем 20 деревьев с их координатами на поле
    const newTrees = generateRandomTrees(treeCount, rows, cols, allHqs);
    setTrees(newTrees); // Установка сгенерированных деревьев
  
    const freeCellForRed = findFreeAdjacentCell(redHQ, [...newTrees, ...allHqs], rows, cols);
    const freeCellForBlue = findFreeAdjacentCell(blueHQ, [...newTrees, ...allHqs], rows, cols);
    
    // Когда вы вызываете setBarracks, новое состояние barracks не становится доступным сразу же. 
    // React обновляет состояние асинхронно, поэтому чтение состояния сразу же после его обновления 
    // не даст ожидаемого результата. Поэтому ниже вынужден использовать локальную переменную
    const newBarracks = { forE: freeCellForRed, forK: freeCellForBlue };
    setBarracks(newBarracks); // Установка казарм
  
    const foundPath = findPathAStar(newBarracks.forE ?? redHQ, blueHQ, newTrees, rows, cols);
    
    setPath(foundPath);  // Установка найденного пути
  
    // Интервал для добавления солдат
    const soldierInterval = setInterval(() => {
      setSoldiers(prev => [...prev, { position: newBarracks.forE ??redHQ, path: foundPath, progress: 0, health: 207 }]);
    }, 6000);
  
     // Очистка интервала при размонтировании компонента
    return () => clearInterval(soldierInterval);
  }, []);

  // Обновление состояния солдат с использованием интервального обновления
  useEffect(() => {
    const interval = setInterval(() => {
      setSoldiers(prevSoldiers => 
        prevSoldiers.map(soldier => {
          const segmentIndex = Math.floor(soldier.progress);
          if (segmentIndex >= soldier.path.length - 1) {
            soldier.health = 0; // Если солдат достиг конечной точки, он считается уничтоженным.
            return { ...soldier, progress: soldier.path.length - 1 };
          }

          const currentSegmentStart = soldier.path[segmentIndex];
          const currentSegmentEnd = soldier.path[segmentIndex + 1];
          const t = soldier.progress - segmentIndex;
          const nextX = currentSegmentStart.x + (currentSegmentEnd.x - currentSegmentStart.x) * t;
          const nextY = currentSegmentStart.y + (currentSegmentEnd.y - currentSegmentStart.y) * t;
          const nextPosition: Coordinate = { x: nextX, y: nextY };

          return { ...soldier, position: nextPosition, progress: soldier.progress + 0.1 }; // Увеличиваем шаг для более заметного движения
        }).filter(soldier => soldier.health > 0) // Удаляем солдатов с нулевым здоровьем
      );
    }, 100); // Обновление состояния каждые 100ms

    return () => clearInterval(interval);
  }, [soldiers]);

  return (
    <GameBoard
      rows={rows}
      cols={cols}
      cellSize={cellSize}
      trees={trees}
      barracks={barracks}
      soldiers={soldiers}
    />
  );
};

export default Game;