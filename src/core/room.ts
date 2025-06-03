import { roomOptions } from './room.const';
import type { RoomData } from './room.model';

export class Room {
  private _roomData: RoomData;

  constructor() {
    const randomizedIndex = Math.floor(Math.random() * roomOptions.length);
    this._roomData = roomOptions[randomizedIndex];
  }

  public update(): void {}
}
