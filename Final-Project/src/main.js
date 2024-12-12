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

let speedMultiplier = 0.5;

let goingForward = true; 
let appleSpawned = false;
let topView = false;

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



function loadModel(name, path, scale, position, callback) {
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(position.x, position.y, position.z);
        scene.add(model);
        objects[name] = model; 
        if (callback) callback(model);
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
        case 't':
            topView = topView ? false : true;
            break
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
            speedMultiplier += 0.15;
            Object.values(objects).forEach((object) => {
                if (object.userData && object.userData.speed) {
                   object.userData.speed *= speedMultiplier; 
                }
            });
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



function spawnCar(row, direction) {
    const initialX = direction > 0 ? -boardSize * tileSize / 2 - tileSize : boardSize * tileSize / 2 + tileSize;
    const carPosition = { x: initialX, y: -.075, z: (row - boardSize / 2) * tileSize + tileSize / 2 };
    const carName = `car_${row}_${direction}_${Date.now()}`;

    loadModel(carName, '/models/car_with_ducks.glb', 1.7, carPosition, (car) => {
        car.userData = { speed: 0.1 * direction * speedMultiplier, row }; 
        car.rotation.y = direction > 0 ? 0 : Math.PI;
    });
}

function resetGame() {
    Object.values(objects).forEach((object) => {
        scene.remove(object);
    });
    Object.keys(objects).forEach((key) => delete objects[key]);
    createCheckerboard(boardSize, tileSize);

    speedMultiplier = 0.5;
    loadModel('frog', '/models/frog.glb', 3, { x: 0, y: 0, z: -boardSize * tileSize / 2 + tileSize / 2 });

    appleSpawned = false;
    spawnApple();  

    laneCarCounts = {}; 
    startCarSpawning();

    topView = false; 
}



function updateCars() {
    const frog = objects.frog;
    if (!frog) return;
    const frogBox = new THREE.Box3().setFromObject(frog); 

    Object.values(objects).forEach((object) => {
        if (object.userData && object.userData.speed) {
            object.position.x += object.userData.speed;
            const boundary = boardSize * tileSize / 2 + tileSize;
            if (object.position.x > boundary) {
                object.position.x = -boundary;
            } else if (object.position.x < -boundary) {
                object.position.x = boundary;
            }
            const carBox = new THREE.Box3().setFromObject(object); 
            if (frogBox.intersectsBox(carBox)) {
                resetGame();
            }
        }
    });
}




const laneCarCounts = {};

function startCarSpawning() {
    for (let i = 1; i <= 6; i++) {
        const direction = i % 2 === 0 ? 1 : -1;
        const row = i * 2;

        laneCarCounts[row] = 0; 
        setInterval(() => {
            if (laneCarCounts[row] < 3) { 
                spawnCar(row, direction);
                laneCarCounts[row]++; 

                const chance = Math.random();
                if (chance > 0.7 && laneCarCounts[row] < 3) {
                    setTimeout(() => {
                        spawnCar(row, direction);
                        laneCarCounts[row]++;
                    }, Math.random() * 2000 + 500);
                }
            }
        }, Math.random() * 5000 + 3000); 
    }
}
startCarSpawning();


function animate() {
    requestAnimationFrame(animate);
    if(topView) {    
        camera.position.set(0, 20, 0);
        camera.lookAt(0, 0, 0);
    }
    else {
        updateCamera();
    }
    updateCars();
    renderer.render(scene, camera);
}

spawnApple();
animate();
