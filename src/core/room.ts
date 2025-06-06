import {
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import type { RoomData, RoomLinkedWall } from './room.model';
import type { Segments } from '../utils';

export class Room extends Group {
  private readonly _wallMaterial = new MeshStandardMaterial({
    color: 0xddffdd,
    side: DoubleSide,
  });
  private readonly _floorMaterial = new MeshStandardMaterial({
    color: 0xaaaaff,
    side: DoubleSide,
  });
  private readonly _lineMaterial = new LineBasicMaterial({
    color: 0x000000,
    linewidth: 2,
  });
  private readonly _lengthMaterial = new MeshBasicMaterial({
    color: 0xe74c3c,
    side: DoubleSide,
  });
  private readonly _widthMaterial = new MeshBasicMaterial({
    color: 0x3498db,
    side: DoubleSide,
  });

  private _center: { x: number; y: number };
  private _roomData: RoomData;

  constructor(roomData: RoomData, height: number, segments: Segments) {
    super();
    this._roomData = roomData;
    this._center = this._getCenter();
    this._createRoom(height);
    this._drawSegments(segments);
  }

  private _drawSegments(segments: Segments): void {
    let points = [segments.length.from, segments.length.to];

    let tubePoints = points.map(
      (point) =>
        new Vector3(point[0] - this._center.x, 0, point[1] - this._center.y)
    );
    const curve = new CatmullRomCurve3(tubePoints);
    const tubeGeometry = new TubeGeometry(curve, 64, 2, 8, false);

    const lengthTube = new Mesh(tubeGeometry, this._lengthMaterial);
    this.add(lengthTube);

    points = [segments.width.from, segments.width.to];
    tubePoints = points.map(
      (point) =>
        new Vector3(point[0] - this._center.x, 0, point[1] - this._center.y)
    );
    const widthCurve = new CatmullRomCurve3(tubePoints);
    const widthTubeGeometry = new TubeGeometry(widthCurve, 64, 2, 8, false);
    const widthTube = new Mesh(widthTubeGeometry, this._widthMaterial);
    this.add(widthTube);
  }

  private _getCenter(): { x: number; y: number } {
    const xs = this._roomData.corners.map((c) => c.x);
    const ys = this._roomData.corners.map((c) => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
  }

  private _createRoom(height: number): void {
    const linkedWall = this._getLinkedWalls(height);
    this.add(...this._createWalls(linkedWall));
    this.add(this._createFloor(linkedWall));
  }

  private _createWalls(linkedWall: RoomLinkedWall): Object3D[] {
    const objects: Object3D[] = [];

    const startWallId = linkedWall.id;

    let currentWall = linkedWall;
    do {
      if (currentWall.start !== undefined && currentWall.end !== undefined) {
        const height = currentWall.height ?? 1;

        const p1 = [
          currentWall.start.x - this._center.x,
          0,
          currentWall.start.y - this._center.y,
        ];
        const p2 = [
          currentWall.end.x - this._center.x,
          0,
          currentWall.end.y - this._center.y,
        ];
        const p3 = [
          currentWall.end.x - this._center.x,
          height,
          currentWall.end.y - this._center.y,
        ];
        const p4 = [
          currentWall.start.x - this._center.x,
          height,
          currentWall.start.y - this._center.y,
        ];

        const positions = [...p1, ...p2, ...p3, ...p4];
        const indices = [0, 1, 2, 0, 2, 3];

        const geometry = new BufferGeometry();
        geometry.setAttribute(
          'position',
          new Float32BufferAttribute(positions, 3)
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const mesh = new Mesh(geometry, this._wallMaterial);
        objects.push(mesh);

        const lineGeometry = new BufferGeometry();
        lineGeometry.setAttribute(
          'position',
          new Float32BufferAttribute(positions, 3)
        );

        const lineIndices = [0, 1, 1, 2, 2, 3, 3, 0];
        lineGeometry.setIndex(lineIndices);
        const outline = new LineSegments(lineGeometry, this._lineMaterial);
        objects.push(outline);
      }

      currentWall = currentWall.nextWall as RoomLinkedWall;
    } while (currentWall.id !== startWallId);

    return objects;
  }

  private _createFloor(linkedWall: RoomLinkedWall): Mesh {
    const shape = new Shape();

    const startX = linkedWall.start?.x;
    const startY = linkedWall.start?.y;
    if (startX !== undefined && startY !== undefined) {
      shape.moveTo(startX - this._center.x, startY - this._center.y);
    }

    const startWallId = linkedWall.id;
    let currentWall = linkedWall;
    do {
      const x = currentWall.end?.x;
      const y = currentWall.end?.y;

      if (x !== undefined && y !== undefined) {
        shape.lineTo(x - this._center.x, y - this._center.y);
      }

      currentWall = currentWall.nextWall as RoomLinkedWall;
    } while (currentWall.id !== startWallId);

    const geometry = new ShapeGeometry(shape);
    geometry.rotateX(Math.PI / 2);

    return new Mesh(geometry, this._floorMaterial);
  }

  private _getLinkedWalls(height: number): RoomLinkedWall {
    const wallsMap = this._roomData.corners.reduce((acc, corner) => {
      const startWallID = corner.wallStarts[0].id;
      const endWallID = corner.wallEnds[0].id;

      let endWall = acc.get(endWallID);
      if (endWall) {
        endWall.end = corner;
      } else {
        endWall = {
          id: endWallID,
          end: corner,
          height,
        };
        acc.set(endWallID, endWall);
      }

      let startWall = acc.get(startWallID);
      if (startWall) {
        startWall.start = corner;
      } else {
        startWall = {
          id: startWallID,
          start: corner,
          height,
        };
        acc.set(startWallID, startWall);
      }

      endWall.nextWall = startWall;

      return acc;
    }, new Map<string, RoomLinkedWall>());

    return Array.from(wallsMap.values())[0];
  }
}
