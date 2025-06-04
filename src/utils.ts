import { vec2 } from 'gl-matrix';
import type { RoomCorner, RoomData, RoomWall } from './core';

export type Segment = {
  from: vec2;
  to: vec2;
};
export type Segments = {
  length: Segment;
  width: Segment;
};

export function computeSegments(room: RoomData): Segments[] {
  return room.walls
    .map((wall) => {
      const width = getPerpendicularSegment(room, wall);

      if (width) {
        const length = getWallSegment(room, wall);

        return {
          length,
          width,
        };
      }

      return null;
    })
    .filter(Boolean) as Segments[];
}

function getPerpendicularSegment(
  room: RoomData,
  wall: RoomWall
): Segment | null {
  const currentWall = getWallSegment(room, wall);
  const wallVector = vec2.sub(vec2.create(), currentWall.to, currentWall.from);
  const wallDireсtion = vec2.normalize(vec2.create(), wallVector);
  const perpendicularDirection = vec2.fromValues(
    -wallDireсtion[1],
    wallDireсtion[0]
  );

  let maxDist = 0;
  let best: Segment | null = null;

  const samples = 1000;
  for (let i = 0; i <= samples; i++) {
    const currentWallPoint = vec2.lerp(
      vec2.create(),
      currentWall.from,
      currentWall.to,
      i / samples
    );

    for (const otherWall of room.walls) {
      if (otherWall.id === wall.id) continue;

      const otherWallSegment = getWallSegment(room, otherWall);

      for (const dir of [1, -1]) {
        const raycastedSegment: Segment = {
          from: currentWallPoint,
          to: vec2.add(
            vec2.create(),
            currentWallPoint,
            vec2.scale(vec2.create(), perpendicularDirection, 10000 * dir)
          ),
        };

        const intersectionPoint = getIntersection(
          raycastedSegment,
          otherWallSegment
        );

        if (intersectionPoint) {
          const dist = vec2.distance(currentWallPoint, intersectionPoint);
          if (dist > maxDist) {
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

export function getIntersection(
  firstSegment: Segment,
  secondSegment: Segment
): vec2 | null {
  const [x1, y1] = firstSegment.from;
  const [x2, y2] = firstSegment.to;
  const [x3, y3] = secondSegment.from;
  const [x4, y4] = secondSegment.to;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denom === 0) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return vec2.fromValues(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
  }

  return null;
}

export function getWallSegment(room: RoomData, wall: RoomWall): Segment {
  const fromCorner = room.corners.find((c) =>
    c.wallStarts.some((w) => w.id === wall.id)
  )!;
  const toCorner = room.corners.find((c) =>
    c.wallEnds.some((w) => w.id === wall.id)
  )!;

  return {
    from: vec2.fromValues(fromCorner.x, fromCorner.y),
    to: vec2.fromValues(toCorner.x, toCorner.y),
  };
}

export function getRoomBounds(c: RoomCorner[]) {
  return {
    minX: Math.min(...c.map((v) => v.x)),
    minY: Math.min(...c.map((v) => v.y)),
    maxX: Math.max(...c.map((v) => v.x)),
    maxY: Math.max(...c.map((v) => v.y)),
  };
}
