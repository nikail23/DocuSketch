import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { Room } from './core/room';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import type { RoomData } from './core';
import type { Segments } from './utils';

const scene = new Scene();

const light = new DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 3;
camera.position.z = 2;
camera.position.x = 2;

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const canvas3D = renderer.domElement;

const orbitControls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate3D(): number {
  const handle = requestAnimationFrame(animate3D);

  orbitControls.update();

  renderer.render(scene, camera);

  return handle;
}

let room: Room;

export function animate3DStart(roomData: RoomData, segments: Segments): number {
  const roomHeight = 200;
  const roomScale = 0.005;

  if (room) {
    scene.remove(room);
  }

  room = new Room(roomData, 200, segments);
  room.scale.multiplyScalar(0.005);
  scene.add(room);

  orbitControls.target.copy(
    room.position.add(new Vector3(0, (roomHeight * roomScale) / 2, 0))
  );

  return animate3D();
}
