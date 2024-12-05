import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//renderer.setClearColor(0x00bfff); 


const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);


const loader = new GLTFLoader();
const objects = {};

function createCheckerboard(size, tileSize) {
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            const color = (x + z) % 2 === 0 ? 0xffffff : 0x000000; 
            const tile = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize), new THREE.MeshBasicMaterial({ color }));
            tile.rotation.x = -Math.PI / 2;
            tile.position.set((x - size / 2) * tileSize + tileSize / 2, 0, (z - size / 2) * tileSize + tileSize / 2);
            scene.add(tile); 
        }
    }
}

const boardSize = 9;
const tileSize = 2;
createCheckerboard(boardSize, tileSize);



function loadModel(name, path, scale, position) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(position.x, position.y, position.z);
        scene.add(model);
        objects[name] = model; 
    });
}

loadModel('frog', '/models/frog.glb', 3, { x: 0, y: 0, z: -8 });
loadModel('floor', '/models/wooden_spikes.glb', 100, { x: 0, y: 0, z: -30 });

camera.position.set(0, 20, 0);
camera.lookAt(0, 0, 0);
//camera.rotation.x = -Math.PI / 2; 

const frogSpeed = tileSize;
window.addEventListener('keydown', (event) => {
    const frog = objects.frog;
    if (!frog) return;

    switch (event.key.toLowerCase()) {
        case 's':
            frog.position.z -= frogSpeed;
            frog.rotation.y = Math.PI;
            break;
        case 'd': 
            frog.position.x -= frogSpeed;
            frog.rotation.y = -Math.PI / 2;
            break;
        case 'w': 
            frog.position.z += frogSpeed;
            frog.rotation.y = 0;
            break;
        case 'a': 
            frog.position.x += frogSpeed;
            frog.rotation.y = Math.PI / 2;
            break;
    }
});

const cameraTargetPosition = new THREE.Vector3();
const cameraLerpSpeed = 0.11; 

function updateCamera() {
    const frog = objects.frog;
    if (frog) {
        const offsetX = 0; 
        const offsetY = 5; 
        const offsetZ = -10; 

        cameraTargetPosition.set(frog.position.x + offsetX, frog.position.y + offsetY, frog.position.z + offsetZ);

        camera.position.lerp(cameraTargetPosition, cameraLerpSpeed);

        camera.lookAt(frog.position.x, frog.position.y, frog.position.z);
    }
}




function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    renderer.render(scene, camera);
}
animate();
