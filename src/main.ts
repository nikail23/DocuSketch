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

export const scene = new Scene();

const light = new DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

export const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 3;
camera.position.z = 2;
camera.position.x = 2;

export const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const roomHeight = 200;
const roomScale = 0.005;
const room = new Room(roomHeight);
room.scale.multiplyScalar(roomScale);
scene.add(room);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.copy(
  room.position.add(new Vector3(0, (roomHeight * roomScale) / 2, 0))
);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();

  renderer.render(scene, camera);
}

animate();
