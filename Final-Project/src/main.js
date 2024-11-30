import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a simple light
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Load model
const loader = new GLTFLoader();
const modelPath = '/models/african_penguin_spheniscus_demersus_low_poly.glb'; // Ensure the correct path

let model; // Declare model globally so it can be accessed in the animation loop
loader.load(
  modelPath,
  (gltf) => {
    model = gltf.scene;
    
    // Scale up the model
    model.scale.set(10, 10, 10);

    scene.add(model);

    // Set the model position (optional)
    model.position.set(0, 0, 0); 

    // Move the camera back a bit so we can see the model
    camera.position.z = 5;
  },
  undefined, // On progress (optional)
  (error) => {
    console.error('Error loading model:', error);
  }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the model if it has loaded
  if (model) {
    model.rotation.y += 0.01; // Adjust the speed (0.01 is a good start)
    model.rotation.x += 0.01; // Adjust the speed (0.01 is a good start)

  }

  renderer.render(scene, camera);
}
animate();
