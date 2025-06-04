import { animate2DStart, canvas2D } from './canvas';
import { roomOptions, type RoomData } from './core';
import { animate3DStart, canvas3D } from './three';
import { computeSegments, type Segments } from './utils';

const mode3DButton = document.createElement('button');
mode3DButton.innerText = '3D';
mode3DButton.style.position = 'absolute';
mode3DButton.style.top = '20px';
mode3DButton.style.left = '20px';
mode3DButton.style.zIndex = '10';
document.body.appendChild(mode3DButton);

const mode2DButton = document.createElement('button');
mode2DButton.innerText = '2D';
mode2DButton.style.position = 'absolute';
mode2DButton.style.top = '20px';
mode2DButton.style.left = '120px';
mode2DButton.style.zIndex = '10';
document.body.appendChild(mode2DButton);

const randomizeRoomButton = document.createElement('button');
randomizeRoomButton.textContent = 'Randomize Room';
randomizeRoomButton.style.position = 'absolute';
randomizeRoomButton.style.top = '20px';
randomizeRoomButton.style.left = '420px';
randomizeRoomButton.style.zIndex = '10';
document.body.appendChild(randomizeRoomButton);

const changeWidthLengthButton = document.createElement('button');
changeWidthLengthButton.textContent = 'Next Length/Width';
changeWidthLengthButton.style.position = 'absolute';
changeWidthLengthButton.style.top = '20px';
changeWidthLengthButton.style.left = '220px';
changeWidthLengthButton.style.zIndex = '10';
document.body.appendChild(changeWidthLengthButton);

type Mode = '3d' | '2d';

let roomData: RoomData;
let currentMode: Mode = '2d';
let segments: Segments[] = [];
let segmentsVariantIndex = 0;
let animation3DLoop: number | null = null;

function switchMode(mode: '3d' | '2d'): void {
  currentMode = mode;

  if (animation3DLoop !== null) {
    cancelAnimationFrame(animation3DLoop);
  }

  switch (mode) {
    case '3d':
      canvas2D.style.display = 'none';
      canvas3D.style.display = '';
      break;
    case '2d':
      canvas2D.style.display = '';
      canvas3D.style.display = 'none';
      break;
  }

  triggerAnimation();
}

function triggerAnimation(): void {
  const currentSegments = segments[segmentsVariantIndex];

  switch (currentMode) {
    case '3d':
      animation3DLoop = animate3DStart(roomData, currentSegments);
      break;
    case '2d':
      animate2DStart(roomData, currentSegments);
      break;
  }
}

function randomizeRoom(): void {
  const roomIndex = Math.floor(Math.random() * roomOptions.length);
  roomData = roomOptions[roomIndex];
  segments = computeSegments(roomData);
  segmentsVariantIndex = 0;

  switchMode(currentMode);
}

function switchSegmentsVariant(): void {
  segmentsVariantIndex = (segmentsVariantIndex + 1) % segments.length;
  triggerAnimation();
}

mode2DButton.onclick = switchMode.bind(this, '2d');
mode3DButton.onclick = switchMode.bind(this, '3d');
randomizeRoomButton.onclick = randomizeRoom;
changeWidthLengthButton.onclick = switchSegmentsVariant;

randomizeRoom();
