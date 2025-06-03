export interface RoomWall {
  id: string;
}

export interface RoomCorner {
  id: string;
  x: number;
  y: number;
  wallStarts: RoomWall[];
  wallEnds: RoomWall[];
}

export interface RoomData {
  walls: RoomWall[];
  corners: RoomCorner[];
}
