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

export interface RoomLinkedWall {
  id: string;
  start?: RoomCorner;
  end?: RoomCorner;
  nextWall?: RoomLinkedWall;
  height?: number;
}
