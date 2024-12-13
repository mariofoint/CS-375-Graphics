import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const textureLoader = new THREE.TextureLoader();
const roadTexture = textureLoader.load('textures/asphalt-texture-close-up.jpg');
const grass1Texture = textureLoader.load('textures/green-fake-grass-background.jpg');
const grass2Texture = textureLoader.load('textures/grass-texture-background.jpg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.2, 1500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


let score = 0;

function updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    if (scoreboard) {
        scoreboard.textContent = `Score: ${score}`;
    }
}

function createTreeWall(size, tileSize, gap = 1, density = 0.5) {
    const distanceFromBoard = (size / 2 + gap) * tileSize;  
    for (let x = -size / 2 - gap; x <= size / 2 + gap; x++) {
        if (Math.random() < density) { 
            placeTreeAtPosition(x * tileSize, distanceFromBoard);  
        }
        if (Math.random() < density) { 
            placeTreeAtPosition(x * tileSize, -distanceFromBoard); 
        }
    }
    for (let z = -size / 2 - gap; z <= size / 2 + gap; z++) {
        if (Math.random() < density) { 
            placeTreeAtPosition(distanceFromBoard, z * tileSize);  
        }
        if (Math.random() < density) { 
            placeTreeAtPosition(-distanceFromBoard, z * tileSize); 
        }
    }
}

function placeTreeAtPosition(x, z) {
    const treePosition = { x: x, y: 0, z: z };
    loadTree(treePosition);  
}

function loadTree(position) {
    loadModel('tree', '/models/low_poly_pine_tree.glb', 1.5, position, (tree) => {
        tree.scale.set(1.5, 1.5, 1.5);  
    });
}






renderer.setClearColor(0x000000); 


const ambientLight = new THREE.AmbientLight(0x404040, 0.7);  
scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);  
directionalLight.position.set(10, 20, 10);  
scene.add(directionalLight);

let fireLight;



const loader = new GLTFLoader();
const objects = {};
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


let speedMultiplier = 0.5;
let maxCarAmount = 1;
let spawnRate = 7000;

let goingForward = true; 
let appleSpawned = false;
let topView = false;

function createCheckerboard(size, tileSize) {
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            let material;
            if ((z % 4 === 2 || z % 4 === 0) && (z!= 0 && z != 14)) {
                material = new THREE.MeshBasicMaterial({ map: roadTexture, side: THREE.DoubleSide });
            } else {
                material = (x + z) % 2 === 0 ?  new THREE.MeshBasicMaterial({ map: grass1Texture, side: THREE.DoubleSide })
                                             :  new THREE.MeshBasicMaterial({ map: grass2Texture, side: THREE.DoubleSide });
            }

            const tile = new THREE.Mesh(new THREE.PlaneGeometry(tileSize, tileSize), material);
            tile.rotation.x = -Math.PI / 2;
            tile.position.set((x - size / 2) * tileSize + tileSize / 2, 0.001, (z - size / 2) * tileSize + tileSize / 2);
            scene.add(tile);
        }
    }
    createTreeWall(size, tileSize, 10); 
}

const boardSize = 15;
const tileSize = 2;
createCheckerboard(boardSize, tileSize);







function createLandscape(size, tileSize) {
    const textureLoader = new THREE.TextureLoader();
    const grayTexture = textureLoader.load('textures/gray-painted-background.jpg');

    const landscapeGeometry = new THREE.PlaneGeometry(size * tileSize * 2, size * tileSize * 2, 50, 50); 

    const positionAttribute = landscapeGeometry.attributes.position; 
    const array = positionAttribute.array;

    landscapeGeometry.computeVertexNormals(); 

    const landscape = new THREE.Mesh(landscapeGeometry, new THREE.MeshBasicMaterial({ map: grayTexture, side: THREE.DoubleSide }));
    landscape.rotation.x = -Math.PI / 2; 
    landscape.position.set(0, 0, 0); 
    scene.add(landscape);
}
createLandscape(boardSize, tileSize);









function spawnApple() {
    if (!appleSpawned) {
        const zPosition = goingForward ? boardSize * tileSize / 2 - 1.5 : -boardSize * tileSize / 2 + 1.5;
        
        
        loadModel('apple', '/models/army_campfire_01.glb', 1.3, { x: 0, y: 0, z: zPosition }, (fire) => {
          
            fireLight = new THREE.SpotLight(0xffa500, 10, 200, 2);  
            fireLight.castShadow = true;
            fireLight.position.set(0, 1, zPosition);  
            scene.add(fireLight); 

      
            fire.material.emissive = new THREE.Color(0xffa500); 
        });
        
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
            scene.remove(fireLight);
            appleSpawned = false;
            goingForward = !goingForward;  
            score++;
            maxCarAmount++;
            spawnRate -= 300;
            updateScoreboard();
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

    loadModel(carName, '/models/snow_man.glb', 1.7, carPosition, (car) => {
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
    score = 0;
    updateScoreboard();
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
            if (laneCarCounts[row] < maxCarAmount) { 
                spawnCar(row, direction);
                laneCarCounts[row]++; 

                const chance = Math.random();
                if (chance > 0.7 && laneCarCounts[row] < maxCarAmount) {
                    setTimeout(() => {
                        spawnCar(row, direction);
                        laneCarCounts[row]++;
                    }, Math.random() * 2000 + 500);
                }
            }
        }, Math.random() * spawnRate + 3000); 
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
