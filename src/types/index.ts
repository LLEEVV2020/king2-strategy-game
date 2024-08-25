export interface Coordinate {
    x: number;
    y: number;
  }
  
  export interface Soldier {
    position: Coordinate;
    path: Coordinate[];
    progress: number;
    health: number;
  }