import type { RoomData } from './core/room.model';
import { getRoomBounds, getWallPoints, type Params } from './utils';

function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: RoomData,
  params?: Params
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const bounds = getRoomBounds(room.corners);
  const margin = 60;
  const scale = Math.min(
    (ctx.canvas.width - margin * 2) / (bounds.maxX - bounds.minX),
    (ctx.canvas.height - margin * 2) / (bounds.maxY - bounds.minY)
  );
  const offsetX =
    (ctx.canvas.width - (bounds.maxX - bounds.minX) * scale) / 2 -
    bounds.minX * scale;
  const offsetY =
    (ctx.canvas.height - (bounds.maxY - bounds.minY) * scale) / 2 -
    bounds.minY * scale;

  function tx(x: number, y: number): [number, number] {
    return [x * scale + offsetX, y * scale + offsetY];
  }

  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 4;
  for (const wall of room.walls) {
    const [a, b] = getWallPoints(room, wall);
    const [x1, y1] = tx(a.x, a.y);
    const [x2, y2] = tx(b.x, b.y);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#666';
  for (const c of room.corners) {
    const [x, y] = tx(c.x, c.y);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (params) {
    ctx.save();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(...tx(params.length.from[0], params.length.from[1]));
    ctx.lineTo(...tx(params.length.to[0], params.length.to[1]));
    ctx.stroke();

    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(...tx(params.width.from[0], params.width.from[1]));
    ctx.lineTo(...tx(params.width.to[0], params.width.to[1]));
    ctx.stroke();
    ctx.restore();
  }
}

export const canvas2D = document.createElement('canvas');
canvas2D.width = window.innerWidth;
canvas2D.height = window.innerHeight;
document.body.appendChild(canvas2D);
const ctx = canvas2D.getContext('2d')!;

export function animate2DStart(roomData: RoomData, params?: Params) {
  drawRoom(ctx, roomData, params);
}
