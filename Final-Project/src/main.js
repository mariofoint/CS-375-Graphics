import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


renderer.setClearColor(0x00bfff); 


const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);



const loader = new GLTFLoader();
const objects = {};


let goingForward = true; 
let appleSpawned = false;

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

const boardSize = 15;
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

function spawnApple() {
    if (!appleSpawned) {
        const zPosition = goingForward ? boardSize * tileSize / 2 - 1.5 : -boardSize * tileSize / 2 + 1.5;
        loadModel('apple', '/models/apple.glb', .5, { x: 0, y: .5, z: zPosition });
        appleSpawned = true;
    }
}




loadModel('frog', '/models/frog.glb', 3, { x: 0, y: 0, z: -boardSize * tileSize / 2 + tileSize / 2 });



camera.position.set(0, 20, 0);
camera.lookAt(0, 0, 0);

const frogSpeed = tileSize;

let keyStates = {
    w: false,
    a: false,
    s: false,
    d: false
};

window.addEventListener('keydown', (event) => {
    const frog = objects.frog;
    if (!frog) return;
    const key = event.key.toLowerCase();
    if (keyStates[key]) return;
    keyStates[key] = true;

    const initialPosition = frog.position.clone();
    const minPosition = -boardSize * tileSize / 2 + tileSize / 2;
    const maxPosition = boardSize * tileSize / 2 - tileSize / 2;
    
    frog.position.x = Math.round(frog.position.x / tileSize) * tileSize;
    frog.position.z = Math.round(frog.position.z / tileSize) * tileSize;
    
    switch (key) {
        case 's':
            frog.position.z -= goingForward ? frogSpeed : -frogSpeed;
            frog.rotation.y = goingForward ? Math.PI : 0;
            break;
        case 'd': 
            frog.position.x -= goingForward ? frogSpeed : -frogSpeed; 
            frog.rotation.y = goingForward ? -Math.PI / 2 : Math.PI / 2
            break;
        case 'w': 
            frog.position.z += goingForward ? frogSpeed : -frogSpeed; 
            frog.rotation.y =  goingForward ? 0 : Math.PI;
            break;
        case 'a': 
            frog.position.x += goingForward ? frogSpeed : -frogSpeed; 
            frog.rotation.y =  goingForward ? Math.PI / 2 : -Math.PI / 2;
            break;
    }
    frog.position.x = Math.round(frog.position.x / tileSize) * tileSize;
    frog.position.z = Math.round(frog.position.z / tileSize) * tileSize;


    if (frog.position.x < minPosition || frog.position.x > maxPosition || frog.position.z < minPosition || frog.position.z > maxPosition) {
        frog.position.copy(initialPosition); 
    }

    const apple = objects.apple;
    if (apple) {
        const frogBox = new THREE.Box3().setFromObject(frog);   
        const appleBox = new THREE.Box3().setFromObject(apple); 
    
   
        if (frogBox.intersectsBox(appleBox)) {
            scene.remove(apple);
            appleSpawned = false;
            goingForward = !goingForward;  
            spawnApple();  
        }
    }
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    keyStates[key] = false; 
});
const cameraTargetPosition = new THREE.Vector3();
const cameraLerpSpeed = 0.11; 

function updateCamera() {
    const frog = objects.frog;
    if (frog) {
        const offsetX = 0; 
        const offsetY = 5; 
        const offsetZ = goingForward ? -10 : 10; 

        cameraTargetPosition.set(
            frog.position.x + offsetX,
            frog.position.y + offsetY,
            frog.position.z + offsetZ
        );

        camera.position.lerp(cameraTargetPosition, cameraLerpSpeed);
        camera.lookAt(frog.position.x, frog.position.y, frog.position.z);

    }
}




function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    renderer.render(scene, camera);
}
spawnApple();
animate();
