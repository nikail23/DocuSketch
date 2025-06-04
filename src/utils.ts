import { vec2 } from 'gl-matrix';
import type { RoomCorner, RoomData, RoomWall } from './core';

export function computeParams(room: RoomData): Params[] {
  return room.walls
    .map((wall) => {
      const [start, end] = getWallPoints(room, wall) ?? [];
      const perpendicular = findPerpendicular(room, wall);
      return perpendicular
        ? {
            length: {
              from: vec2.fromValues(start.x, start.y),
              to: vec2.fromValues(end.x, end.y),
            },
            width: { from: perpendicular.from, to: perpendicular.to },
          }
        : null;
    })
    .filter(Boolean) as Params[];
}

function findPerpendicular(
  room: RoomData,
  wall: RoomWall
): {
  from: vec2;
  to: vec2;
} | null {
  const [currentWallStart, currentWallEnd] = getWallPoints(room, wall);
  const wallVector = vec2.sub(
    vec2.create(),
    [currentWallEnd.x, currentWallEnd.y],
    [currentWallStart.x, currentWallStart.y]
  );
  const wallDireсtion = vec2.normalize(vec2.create(), wallVector);
  const perpendicularDirection = vec2.fromValues(
    -wallDireсtion[1],
    wallDireсtion[0]
  );

  let maxDist = 0;
  let best: null | {
    from: vec2;
    to: vec2;
  } = null;

  const samples = 1000;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const currentWallPoint = vec2.lerp(
      vec2.create(),
      [currentWallStart.x, currentWallStart.y],
      [currentWallEnd.x, currentWallEnd.y],
      t
    );

    for (const otherWall of room.walls) {
      if (otherWall.id === wall.id) continue;

      const [otherWallStart, otherWallEnd] = getWallPoints(room, otherWall);

      for (const dir of [1, -1]) {
        const pointFar = vec2.add(
          vec2.create(),
          currentWallPoint,
          vec2.scale(vec2.create(), perpendicularDirection, 10000 * dir)
        );
        const intersectionPoint = checkIntersection(
          currentWallPoint,
          pointFar,
          [otherWallStart.x, otherWallStart.y],
          [otherWallEnd.x, otherWallEnd.y]
        );

        if (intersectionPoint) {
          const dist = vec2.distance(currentWallPoint, intersectionPoint);
          if (dist > 1e-6 && dist > maxDist) {
            maxDist = dist;
            best = {
              from: currentWallPoint,
              to: intersectionPoint,
            };
          }
        }
      }
    }
  }

  return best;
}

export function checkIntersection(
  p1: vec2,
  p2: vec2,
  q1: vec2,
  q2: vec2
): vec2 | null {
  const [x1, y1] = p1,
    [x2, y2] = p2,
    [x3, y3] = q1,
    [x4, y4] = q2;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return null;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return vec2.fromValues(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
  }
  return null;
}

export function getWallPoints(room: RoomData, wall: RoomWall) {
  return [
    room.corners.find((c) => c.wallStarts.some((w) => w.id === wall.id))!,
    room.corners.find((c) => c.wallEnds.some((w) => w.id === wall.id))!,
  ];
}

export function getRoomBounds(c: RoomCorner[]) {
  return {
    minX: Math.min(...c.map((v) => v.x)),
    minY: Math.min(...c.map((v) => v.y)),
    maxX: Math.max(...c.map((v) => v.x)),
    maxY: Math.max(...c.map((v) => v.y)),
  };
}

export type Params = {
  length: { from: vec2; to: vec2 };
  width: { from: vec2; to: vec2 };
};
export type AnimateFunction = (roomData: RoomData, params?: Params) => number;
export type Mode = '3d' | '2d';
