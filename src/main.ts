import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
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

const cube = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshStandardMaterial({ color: 0x00ff00, metalness: 0.2, roughness: 0.8 })
);
scene.add(cube);

export const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2.5;

export const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.copy(cube.position);

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

console.log(new Room());

animate();
