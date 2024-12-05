import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setPixelRatio(window.devicePixelRatio);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0xffffff, // White color
    shininess: 100   // Shininess of the material
});

let win = false;

function createPlane(width, height, color, rotationX, positionY) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = rotationX;
    plane.position.y = positionY;
    return plane;
}

const boxSize = 100
const l = 0.2
const mazeHeight = 8
const mazeBoxSize = 1

// Ground
// const ground = createPlane(boxSize, boxSize, 0x808080, -Math.PI / 2, 0 - l);
// scene.add(ground);

const ceiling = createPlane(boxSize, boxSize, 0x808080, Math.PI / 2, mazeHeight - l);
scene.add(ceiling);

// Back wall
const backWall = createPlane(boxSize, boxSize, 0xA0A0A0, 0, boxSize / 2 - l);
backWall.position.z = -boxSize / 2;
scene.add(backWall);

// Left wall
const leftWall = createPlane(boxSize, boxSize, 0x909090, 0, boxSize / 2 - l);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -boxSize / 2;
scene.add(leftWall);

// Right wall
const rightWall = createPlane(boxSize, boxSize, 0x909090, 0, boxSize / 2 - l);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = boxSize / 2;
scene.add(rightWall);

const frontWall = createPlane(boxSize, boxSize, 0xA0A0A0, 0, boxSize / 2 - l);
frontWall.position.z = boxSize / 2;
scene.add(frontWall);

// const geometry = new THREE.PlaneGeometry(boxSize, boxSize);
// const groundMirror = new Reflector(geometry, {
//     clipBias: 0.003,
//     textureWidth: 512,
//     textureHeight: 512
//     //color: 0x808080
// });
// groundMirror.position.set(0, -l + 0.01, 0);
// groundMirror.rotation.x = -Math.PI / 2;
// scene.add(groundMirror);

camera.position.set(0, 10*l, 0);
/// Bump mapping////
function createMazeFloor(width, height) {
    const textureLoader = new THREE.TextureLoader();
    
    // Load textures
    // -----------------------CHANGE TEXTURE HERE------------------////
    // const baseColorMap = textureLoader.load('./textures/wood_floor_worn_diff_1k.jpg');
    // const normalMap = textureLoader.load('./textures/wood_floor_worn_nor_gl_1k.exr');
    // const roughnessMap = textureLoader.load('./textures/wood_floor_worn_rough_1k.exr');
    // const bumpMap = textureLoader.load('./textures/wood_floor_worn_disp_1k.png');
    const baseColorMap = textureLoader.load('./textures2/dry_riverbed_rock_diff_1k.jpg');
    const normalMap = textureLoader.load('./textures2/dry_riverbed_rock_nor_gl_1k.exr');
    const roughnessMap = textureLoader.load('./textures2/dry_riverbed_rock_rough_1k.exr');
    const bumpMap = textureLoader.load('./textures2/dry_riverbed_rock_disp_1k.png');

    // Configure textures
    [baseColorMap, normalMap, roughnessMap, bumpMap].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(30, 30); // Adjust how small the texture pattern here, the bigger the number, the smaller the pattern
    });

    // Create material
    const material = new THREE.MeshStandardMaterial({
        map: baseColorMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        bumpMap: bumpMap,
        bumpScale: 0.05,
        roughness: 0.8,
        metalness: 0.1
    });

    // Create geometry with more segments for better bump mapping
    const geometry = new THREE.PlaneGeometry(width, height, 100, 100);
    const floor = new THREE.Mesh(geometry, material);
    
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -l;
    floor.receiveShadow = true;
    
    return floor;
}

// Create and add the floor
const mazeFloor = createMazeFloor(boxSize, boxSize);
scene.add(mazeFloor);
//// end of bump mapping ////
// Setting up the maze
let maze_ex;
//generateMaze(15, 15);
let mapWidth;
let mapHeight;
initializeMaze(10, 10);

function initializeMaze(width, height) {
    maze_ex = generateMaze(width, height);
    mapWidth = (maze_ex[0].length + 1) * mazeBoxSize + 2*l; // Width of the maze
    mapHeight = (maze_ex.length + 1) * mazeBoxSize + 2*l;  // Height of the maze

}

// Function to generate a random maze using Recursive Backtracking
function generateMaze(width, height) {
    const maze = Array.from({ length: height }, () => Array(width).fill(1)); // Initialize with walls

    // Directions for moving in the maze (up, down, left, right)
    const directions = [
        { x: 0, y: -2 }, // Up
        { x: 0, y: 2 },  // Down
        { x: -2, y: 0 }, // Left
        { x: 2, y: 0 }   // Right
    ];

    function carve(x, y) {
        // Randomize directions
        shuffleArray(directions);

        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;

            if (newX > 0 && newX < width-1 && newY > 0 && newY < height-1 && maze[newY][newX] === 1) {
                // Carve a path between current and new cell
                maze[y + dir.y / 2][x + dir.x / 2] = 0;
                maze[newY][newX] = 0;
                carve(newX, newY); // Recur for the next cell
            }
        }
    }
    
    // Start carving from (1,1)
    maze[1][1] = 0; // Start point
    carve(1, 1);
    

    // randomly select player position and chaser position
    let validPositions = [];
    for (let i = 0; i < maze.length; i++) {
	for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 0) {
		validPositions.push({x: i, z: j});
            }
	}
    }
    const randomIndex = Math.floor(Math.random() * validPositions.length);
    const playerPosition = validPositions[randomIndex];
    validPositions.splice(randomIndex, 1)
    const randomIndex2 = Math.floor(Math.random() * validPositions.length);
    const chaserPosition = validPositions[randomIndex2];
    maze[playerPosition.x][playerPosition.z] = 2
    maze[chaserPosition.x][chaserPosition.z] = 3

    // form an exit
    const edgeCells = [];

    // Collect edge cells
    for (let i = 0; i < width; i++) {
        edgeCells.push({ x: i, y: 0 });          // Top row
        edgeCells.push({ x: i, y: height - 1 }); // Bottom row
    }
    for (let i = 1; i < height - 1; i++) {
        edgeCells.push({ x: 0, y: i });          // Left column
        edgeCells.push({ x: width - 1, y: i }); // Right column
    }
    // Randomly shuffle edge cells to pick one at random
    shuffleArray(edgeCells);

    for (const cell of edgeCells) {
        const { x, y } = cell;

        // Check neighboring cells (up, down, left, right)
        const neighbors = [
	    maze[y - 1]?.[x], // Up
	    maze[y + 1]?.[x], // Down
	    maze[y][x - 1],   // Left
	    maze[y][x + 1]    // Right
        ];

        // If any neighbor is a path (0), make this cell a path (0)
        if (neighbors.some(neighbor => neighbor === 0)) {
	    maze[y][x] = 0; // Mark as exit path
	    console.log(`Exit created at: (${y}, ${x})`);
	    break;
        }
    }
    
    
    console.log(maze);
    return maze;
}
// Function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function disposeScene(scene) {
    // Traverse through all objects in the scene
    scene.traverse((object) => {
        // Check if the object is a mesh
        if (object.isMesh) {
            // Dispose of geometry
            if (object.geometry) {
                object.geometry.dispose();
                console.log("Disposed geometry:", object.geometry);
            }

            // Dispose of materials
            if (Array.isArray(object.material)) {
                object.material.forEach((material) => {
                    if (material) {
                        material.dispose();
                        console.log("Disposed material:", material);
                    }
                });
            } else if (object.material) {
                object.material.dispose();
                console.log("Disposed material:", object.material);
            }
        }
    });

    // Optionally clear the children of the scene
    while (scene.children.length > 0) {
        const child = scene.children[0];
        scene.remove(child);
    }

    console.log("Scene cleared and all objects disposed.");
}

function checkWinningCondition(player) {
    const playerPosition = new THREE.Vector3();
    player.matrix.decompose(playerPosition, new THREE.Quaternion(), new THREE.Vector3());

    // Check if player is outside the boundaries of the maze
    if (!win &&
        (playerPosition.x < -mapWidth / 2 || 
         playerPosition.x > mapWidth / 2 - mazeBoxSize || 
         playerPosition.z < -mapHeight / 2|| 
         playerPosition.z > mapHeight / 2 - mazeBoxSize)
       ) {
	console.log("Hello")
	win = true;
	direction = still;
	clearInterval(timerInterval);
        return true; // Player has exited the maze
    }
    return false; // Player is still within the maze
}
function showWinScreen() {
    document.getElementById('winScreen').style.display = 'block';
}

// Try to fix the clean up maze issue
function restartGame() {
    // Reset player position, game state
    win = false;
    isGameOver = false;
    direction = still;
    clearInterval(timerInterval);
    document.getElementById('winScreen').style.display = 'none';
    gameOverScreen.style.display = 'none';
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    wallBBes.length = 0;
    mirrors.length = 0;
    mirrorBBes.length = 0;
    // Recreate the ground with bump mapping
    const mazeFloor = createMazeFloor(boxSize, boxSize);
    scene.add(mazeFloor);
    // scene.add(ground);
    scene.add(ceiling);
    scene.add(backWall);
    scene.add(leftWall);
    scene.add(rightWall);
    scene.add(frontWall);
    // scene.add(groundMirror);
    scene.add(wobblyCircle);

    setupLights();
    // may change and add difficulty level
    initializeMaze(10, 10);
    
    //disposeScene(scene);
    createMaze(maze_ex);
    resetPlayerAndMonster();
    startTimer();

    // Optionally reset maze or reload level
}
function resetPlayerAndMonster() {
    // Reset player position
    for (let i = 0; i < maze_ex.length; i++) {
        for (let j = 0; j < maze_ex[i].length; j++) {
            if (maze_ex[i][j] === 2) {
                player.matrix.copy(translationMatrix(
                    j * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2),
                    0,
                    i * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
                ));
                break;
            }
        }
    }

    // Reset monster position
    for (let i = 0; i < maze_ex.length; i++) {
        for (let j = 0; j < maze_ex[i].length; j++) {
            if (maze_ex[i][j] === 3) {
                monster.matrix.copy(translationMatrix(
                    j * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2),
                    0,
                    i * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
                ));
                break;
            }
        }
    }

    player.matrixAutoUpdate = false;
    monster.matrixAutoUpdate = false;
}
// Setup lights
function setupLights() {
    const pointLight = new THREE.PointLight(0xffffff, 100, 100); 
    pointLight.position.set(0, mazeHeight * 1.5, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x606060, 0.6); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); 
    directionalLight.position.set(10, mazeHeight * 2, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}
///// End of Fix clean up issue ////
// Make restartGame globally accessible
window.restartGame = restartGame;

const wispGeometry = new THREE.SphereGeometry(l, 32, 32);
const wispMaterial = new THREE.MeshBasicMaterial({
    color: 0x6A5ACD, 
    transparent: true,
    opacity: 0.6,
    //emissive: 0x7156B6
});
const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
const particleCount = 25;
const particleGeometry = new THREE.BufferGeometry();
const positions = [];
for (let i = 0; i < particleCount; i++) {
    positions.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
}
particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({
    color: 0xA0BFFF,
    size: 0.01,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
wisp.add(particles); 
const player = wisp;

const monsterGeometry = new THREE.DodecahedronGeometry(0.3);
const monsterMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF4500, 
    flatShading: true,
    emissive: 0xDDD8D8, 
    emissiveIntensity: 0.2,
});
const monster = new THREE.Mesh(monsterGeometry, monsterMaterial);
monster.castShadow = true;
monster.receiveShadow = true;

const shardGeometry = new THREE.TetrahedronGeometry(0.1);
const shardMaterial = new THREE.MeshStandardMaterial({
    color: 0x4B4042, 
    emissive: 0x4B4042, 
    emissiveIntensity: 0.1,
});

for (let i = 0; i < 8; i++) {
    const shard = new THREE.Mesh(shardGeometry, shardMaterial);
    shard.position.set(
        (Math.random() - 0.5) * 0.3 * 1.5,
        (Math.random() - 0.5) * 0.3 * 1.5,
        (Math.random() - 0.5) * 0.3 * 1.5
    );
    shard.castShadow = true;
    shard.receiveShadow = true;
    monster.add(shard);
}

function animateMonster() {
    monster.rotation.x += 0.01;
    monster.rotation.y += 0.01;
    monster.children.forEach((shard, index) => {
        shard.position.x += Math.sin(performance.now() * 0.001 + index) * 0.005;
        shard.position.y += Math.cos(performance.now() * 0.001 + index) * 0.005;
    });
    requestAnimationFrame(animateMonster);
}

animateMonster();


// Timer implemenation
let timeRemaining = 120; // 2 minutes in seconds
let timerInterval;
let isGameOver = false;

// Create UI elements
const timerDisplay = document.createElement('div');
timerDisplay.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    color: white;
    font-size: 24px;
    font-family: Arial, sans-serif;
    z-index: 1000;
`;
document.body.appendChild(timerDisplay);

const gameOverScreen = document.createElement('div');
gameOverScreen.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    display: none;
    z-index: 1000;
`;
gameOverScreen.innerHTML = `
    <h2>Game Over - Time's Up!</h2>
    <button id="restartButton" style="
        padding: 10px 20px;
        font-size: 16px;
        margin-top: 20px;
        cursor: pointer;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
    ">Try Again</button>
`;
document.body.appendChild(gameOverScreen);

// Timer functions
function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeRemaining <= 0) {
        gameOver();
    } else {
        timeRemaining--;
    }
}

function startTimer() {
    timeRemaining = 120;
    isGameOver = false;
    timerInterval = setInterval(updateTimer, 1000); // call updatetimer() every 1 second
    gameOverScreen.style.display = 'none';
}

function gameOver() {
    clearInterval(timerInterval);
    isGameOver = true;
    gameOverScreen.style.display = 'block';
}

function restartGame2() {
    // Reset player position to starting position
    for (let i = 0; i < maze_ex.length; i++) {
        for (let j = 0; j < maze_ex[i].length; j++) {
            if (maze_ex[i][j] === 2) {
                player.matrix.copy(translationMatrix(
                    j * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2), 
                    0, 
                    i * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
                ));
                break;
            }
        }
    }
    
    // Reset monster position
    for (let i = 0; i < maze_ex.length; i++) {
        for (let j = 0; j < maze_ex[i].length; j++) {
            if (maze_ex[i][j] === 3) {
                monster.matrix.copy(translationMatrix(
                    j * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2), 
                    0, 
                    i * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
                ));
                break;
            }
        }
    }
    
    direction = still;
    startTimer();
}

// Add event listener for restart button
document.getElementById('restartButton').addEventListener('click', restartGame2);

// Start the timer when the game starts
startTimer();
// End of timer implemenation

// Teleportation logic

function teleportPlayer(excludeX, excludeZ) {
    const validTeleportPositions = [];
    const exitPoints = [];
    // Find exit points (cells adjacent to maze boundaries)
    for (let i = 0; i < maze_ex.length; i++) {
        for (let j = 0; j < maze_ex[i].length; j++) {
            // If this is a path (0) and it's on the edge
            if (maze_ex[i][j] === 0 && 
                (i === 0 || i === maze_ex.length - 1 || j === 0 || j === maze_ex[i].length - 1)) {
                exitPoints.push({
                    x: j * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2),
                    z: i * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
                });
            }
        }
    }
    // Collect valid teleport positions
    for (let i = 0; i < maze_ex.length; i++) {
        for (let j = 0; j < maze_ex[i].length; j++) {
            if (maze_ex[i][j] === 0) {
                const position = {
                    x: j * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2),
                    z: i * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
                };

                // Check distance to all exit points
                let isSafeDistance = true;
                for (const exitPoint of exitPoints) {
                    const distanceToExit = Math.sqrt(
                        Math.pow(position.x - exitPoint.x, 2) + 
                        Math.pow(position.z - exitPoint.z, 2)
                    );
                    
                    // If position is too close to any exit, mark it as unsafe
                    if (distanceToExit < 3 * mazeBoxSize) { // Adjust this value to control safe distance
                        isSafeDistance = false;
                        break;
                    }
                }
                if (isSafeDistance) {
                    validTeleportPositions.push(position);
                }
            }
        }
    }
    // Filter out the excluded position - where the player been caught
    const availablePositions = validTeleportPositions.filter(pos => 
        !(Math.abs(pos.x - excludeX) < 0.1 && Math.abs(pos.z - excludeZ) < 0.1)
    );
    
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const newPosition = availablePositions[randomIndex];
        player.matrix.copy(translationMatrix(newPosition.x, 0, newPosition.z));
	ongoingPushback = false;
	
    }
}
// end of teleportation logic

// Collision Dectection
let ongoingPushback = false;
let pushbackStart = new THREE.Vector3();
let pushbackEnd = new THREE.Vector3();
const pushbackDuration = 1;
const pushbackDistance = mazeBoxSize / 2 - l; // fine tune it for bounce back affect
let pushbackTimeStart = 0;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

function checkCollisions() {
    
    let collisionDetected = false;

    for (const wallBB of wallBBes) {
        if (player_BS.intersectsBox(wallBB)) {
            collisionDetected = true;
            break;
        }
    }
    if (collisionDetected && !ongoingPushback) {
	ongoingPushback = true;
	pushbackTimeStart = clock.getElapsedTime();
	pushbackStart.copy(player.position);
	let dx = 0, dz = 0;
        if (cameraMode === 1) {
            // Apply a small push-back (Third-person mode global direction) 
            if (direction === up)
		dz = pushbackDistance;
            else if (direction === down)
		dz = -pushbackDistance;
            else if (direction === left)
		dx = pushbackDistance;
            else if (direction === right)
		dx = -pushbackDistance;
        }
        else if (cameraMode === 2) {
            // First-person mode push-back (based on player rotation)
            if (direction === up) {
                dx = Math.sin(playerRotation) * pushbackDistance;
                dz = Math.cos(playerRotation) * pushbackDistance;
            } else if (direction === down) {
                dx = -Math.sin(playerRotation) * pushbackDistance;
                dz = -Math.cos(playerRotation) * pushbackDistance;
            } else if (direction === left) {
                dx = Math.cos(playerRotation) * pushbackDistance;
                dz = -Math.sin(playerRotation) * pushbackDistance;
            } else if (direction === right) {
                dx = -Math.cos(playerRotation) * pushbackDistance;
                dz = Math.sin(playerRotation) * pushbackDistance;
            }
           
        }
	pushbackEnd.copy(pushbackStart).add(new THREE.Vector3(dx, 0, dz));
	
        bumpSound.play();
        moveSound.pause();
        // Stop movement after collison
        direction = still;   
    }
}
// Bounding Sphere for player
let player_BS = new THREE.Sphere(player.position, 0.15); // using a smaller BS (0.35)

// Bounding Boxes for wall
const wallBBes = [];

////////// END OF COLLISiON DETECTION ////////////

// Variables for the wobbly circle to show a "stunned" status
let wobblyCircle;
const circleRadius = 4 / 3* l; // Adjust as needed
const segments = 32; // Number of segments for the circle
const wobbleAmplitude = l / 2; // Amplitude of the wobble effect
const wobbleSpeed = 3; // Speed of the wobble effect

function createWobblyCircle() {
    const geometry = new THREE.RingGeometry(circleRadius, circleRadius + 0.01,  segments);
    const material = new THREE.MeshBasicMaterial({ color: 0x005FFF, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    wobblyCircle = new THREE.Mesh(geometry, material);
    wobblyCircle.rotation.x = Math.PI / 2; // Rotate to face upwards
    scene.add(wobblyCircle);
}
let initialRotation = new THREE.Euler();
const maxTiltAngle = Math.PI / 3; // Maximum tilt angle (30 degrees)


createWobblyCircle();

function updateWispEffects(pushbackProgress) {
    const time = pushbackProgress - pushbackTimeStart;
    const wobbleSpeed = 5; // Adjust as needed
    const wobbleAmplitude = 0.1; // Adjust as needed
    const maxTiltAngle = Math.PI / 6; // 30 degrees

    // Wobble effect
    const scale = 1 + (
        Math.sin(time * wobbleSpeed) +
        Math.sin(time * wobbleSpeed * 1.3 + Math.PI / 4) +
        Math.sin(time * wobbleSpeed * 0.7 + Math.PI / 2)
    ) * wobbleAmplitude / 3;

    // Tilt effect
    const tiltY = (
        Math.sin(time * 2.5) +
        Math.sin(time * 3.1 + Math.PI / 3)
    ) * maxTiltAngle * (1 - pushbackProgress) / 2;

    const tiltZ = (
        Math.sin(time * 3.7) +
        Math.sin(time * 2.9 + Math.PI / 6)
    ) * maxTiltAngle * (1 - pushbackProgress) / 2;

    // Update wobbly circle
    if (wobblyCircle) {
        wobblyCircle.scale.set(scale, scale, scale);
        wobblyCircle.rotation.y = initialRotation.y + tiltY;
        wobblyCircle.rotation.z = initialRotation.z + tiltZ;
        wobblyCircle.position.copy(player.position);
    }

    // Update particles
    if (particles) {
        particles.scale.set(scale, scale, scale);
        particles.rotation.y += tiltY / 10;
        particles.rotation.z += tiltZ / 10;
        
    }
}

//////// mirror visibility update interval ////////
let lastVisibilityUpdate = 0;
const VISIBILITY_UPDATE_INTERVAL = 50; // 50ms between updates, adjust it

let mirrors = [];
let mirrorBBes = [];
const frustum = new THREE.Frustum();
//const projScreenMatrix = new THREE.Matrix4();
function updateVisibleMirrors() {
    const currentTime = performance.now();
    if (currentTime - lastVisibilityUpdate < VISIBILITY_UPDATE_INTERVAL) {
        return; // Skip update if too soon
    }
    lastVisibilityUpdate = currentTime;
    ///// end of visibility update interval check//////

    frustum.setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    );
    const visibleMirrors = [];

    for (let i = 0; i < mirrors.length; i++) {
	const mirror = mirrors[i];
        if (frustum.intersectsBox(mirrorBBes[i])) {
            visibleMirrors.push(mirror);
        } else {
            mirror.visible = false;
        }
    }

    const playerPosition = new THREE.Vector3().setFromMatrixPosition(player.matrix)

    for (const mirror of visibleMirrors) {
        if (isBlocked(camera.position, mirror.position)) {
            mirror.visible = false;
        } else {
            mirror.visible = true;
        }
    }
}


    
function isBlocked(start, end) {
    let count = 0;
    
    for (const mirrorBB of mirrorBBes) {
        if (lineIntersectsBox(start, end, mirrorBB)) {
            count++;
        }
    }
    const playerPosition = new THREE.Vector3().setFromMatrixPosition(player.matrix)
    if (playerPosition.distanceTo(end) < 4 * mazeBoxSize) {
	return count > 0; // close enough mirrors shouldn't have anything in its way to be visible
    } else {
	return count > 2; // account for mirrors partly behind corners
    }
}

function lineIntersectsBox(start, end, box) {
    // Create a line segment from start to end
    const dir = new THREE.Vector3().subVectors(end, start).multiplyScalar(0.95);
    
    // Use the slab method to check for intersection with the box
    let tmin = 0;
    let tmax = 1;

    for (let i = 0; i < 3; i++) {
        const invDir = 1 / dir.getComponent(i);
        let t0 = (box.min.getComponent(i) - start.getComponent(i)) * invDir;
        let t1 = (box.max.getComponent(i) - start.getComponent(i)) * invDir;

        if (invDir < 0) {
            [t0, t1] = [t1, t0]; // Swap t0 and t1
        }

        tmin = Math.max(tmin, t0);
        tmax = Math.min(tmax, t1);

        if (tmax < tmin) {
            return false; // No intersection
        }
    }

    return true; // Intersection occurs
}

function countVisibleMirrors() {
    console.log("begin counting");
    mirrors.forEach(mirror => {
	if (mirror.visible) {
	    console.log("count");
	}
    });
}

function createMirror(width, height, position, rotationY) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const mirror = new Reflector(geometry, {
        clipBias: 0.003,
        textureWidth: 512,
        textureHeight: 512,
        //color: 0xFFFFFF
    });
    mirror.position.copy(position);
    mirror.rotation.y = rotationY;
    scene.add(mirror);
    mirror.layers.set(1);
    mirrors.push(mirror);

    // create bounding boxes for mirrors
    const mirrorBB = new THREE.Box3().setFromObject(mirror);
    mirrorBBes.push(mirrorBB);
}

function isFacingEmpty(maze, i, j) {
    return maze[i][j] === 0 || maze[i][j] === 2 || maze[i][j] === 3;
}

const maxMirrorCount = 100;

function createMaze(maze) {
    const wallGeometry = new THREE.BoxGeometry(mazeBoxSize, mazeHeight, mazeBoxSize);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
    let counter1 = 0;
    let counter2 = 0;
    let counter3 = 0;
    let counter4 = 0;
    let offset = 0.001;
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 1) {
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(
                    j * mazeBoxSize - (maze[0].length * mazeBoxSize / 2), 
                    mazeHeight/2 - l, 
                    i * mazeBoxSize - (maze.length * mazeBoxSize / 2)
                );
                scene.add(wall);
       
                if (i > 0 && isFacingEmpty(maze, i - 1, j)  && counter1 <= maxMirrorCount) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x, wall.position.y, wall.position.z - mazeBoxSize / 2 - offset),
                        Math.PI);
                    counter1+=1;
                }
                if (i < maze.length - 1 && isFacingEmpty(maze, i + 1, j) && counter2 <= maxMirrorCount) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x, wall.position.y, wall.position.z + mazeBoxSize / 2 + offset),
                        0);
                }
                if (j > 0 && isFacingEmpty(maze, i, j - 1) && counter3 <= maxMirrorCount) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x - mazeBoxSize / 2 - offset, wall.position.y, wall.position.z),
                        -Math.PI / 2);
                }
    
                if (j < maze[i].length - 1 && isFacingEmpty(maze, i, j + 1)  && counter4 <= maxMirrorCount) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x + mazeBoxSize / 2 + offset, wall.position.y, wall.position.z),
                        Math.PI / 2);
                    counter4+=1;
                    }
                // Collision detection: create bounding box for each wall and add it to the array
                const wallBB = new THREE.Box3().setFromObject(wall);
                wallBBes.push(wallBB);

            } else if (maze[i][j] == 2) {
		player.matrix.copy(translationMatrix(
		    j * mazeBoxSize - (maze[0].length * mazeBoxSize / 2), 
                    0, 
                    i * mazeBoxSize - (maze.length * mazeBoxSize / 2)
                ));
		scene.add(player);

		player.matrixAutoUpdate = false;
	    } else if (maze[i][j] == 3) {
		monster.matrix.copy(translationMatrix(
		    j * mazeBoxSize - (maze[0].length * mazeBoxSize / 2), 
                    0, 
                    i * mazeBoxSize - (maze.length * mazeBoxSize / 2)
                ));
		scene.add(monster);

		monster.matrixAutoUpdate = false;
	    }
		
        }
    }

}
camera.layers.enable(1);
createMaze(maze_ex);

// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100); 
pointLight.position.set(0, mazeHeight * 1.5, 0);
pointLight.castShadow = true;
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x606060, 0.6); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); 
directionalLight.position.set(10, mazeHeight * 2, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

function translationMatrix(tx, ty, tz) {
    return new THREE.Matrix4().set(
	1, 0, 0, tx,
	0, 1, 0, ty,
	0, 0, 1, tz,
	0, 0, 0, 1
	);
}



let animation_time = 0;
let delta_animation_time;
let angle;

const clock = new THREE.Clock();
const cube_size = 2 * l;

const minX = -boxSize / 2;
const maxX = boxSize / 2;
const minY = 0;
const maxY = mazeHeight*2; 
const minZ = -boxSize / 2;
const maxZ = boxSize / 2;


const still = 0;
const up = 1;
const left = 2;
const down = 3;
const right = 4;
let direction = still;

let cameraMode = 1 // third person view; mode=2 is first person view
let last_dx = 0;
let last_dz = -1;



const offsetMatrix = new THREE.Matrix4().makeTranslation(0, mazeHeight / 4, 0); // Adjust values as needed
let currentLookAt = new THREE.Vector3();
let firstFrame = true;

function updateCameraPosition() {
    let playerPosition = new THREE.Vector3();
    playerPosition.setFromMatrixPosition(player.matrix);
    if (cameraMode === 1) { // third person
	let cameraMatrix = new THREE.Matrix4();
	cameraMatrix.copy(player.matrix);
	cameraMatrix.multiply(offsetMatrix);
	let cameraPosition = new THREE.Vector3();
	cameraPosition.setFromMatrixPosition(cameraMatrix);
	camera.position.copy(cameraPosition);
	camera.lookAt(playerPosition);
	// follow latest player position
	currentLookAt.lerp(playerPosition, 0.2);
    } else if (cameraMode === 2) { // first person
	camera.position.lerp(playerPosition, 0.9);
	camera.position.y += 2*l;
	let lookAtPoint = new THREE.Vector3();
        lookAtPoint.copy(playerPosition);
        let dx = 0, dz = 0;
	switch (direction) {
        case up:
            dx = -Math.sin(playerRotation);
            dz = -Math.cos(playerRotation);
            break;
        case down:
            dx = Math.sin(playerRotation);
            dz = Math.cos(playerRotation);
            break;
        case left:
            dx = -Math.cos(playerRotation);
            dz = Math.sin(playerRotation);
            break;
        case right:
            dx = Math.cos(playerRotation);
            dz = -Math.sin(playerRotation);
            break;
	case still:
	    dx = last_dx;
	    dz = last_dz;
	}
	last_dx = dx;
	last_dz = dz;
	lookAtPoint.x += dx;
	lookAtPoint.z += dz;
	currentLookAt.lerp(lookAtPoint, 0.2);
	camera.lookAt(currentLookAt);
    
    }
}

const moveDistance = 0.015;

function animate() {
    renderer.render( scene, camera );
    renderer.shadowMap.enabled = true;
    wisp.castShadow = true;
    wisp.receiveShadow = true;
    // groundMirror.receiveShadow = true;
    let matrix = new THREE.Matrix4();
    matrix.copy(player.matrix);
    movePlayer(direction);
    if (!win)
	moveMonster();
    
    updateCameraPosition();
    updateVisibleMirrors();
    // constantly check collisons
    checkCollisions();
    const time = performance.now() * 0.003;
    wispMaterial.opacity = 0.6 + 0.3 * Math.sin(time);
    if (ongoingPushback) {
	const elapsedTime = clock.getElapsedTime() - pushbackTimeStart;
	const pushbackProgress = Math.min(elapsedTime / pushbackDuration, 1);
	const easedProgress = easeOutCubic(pushbackProgress);
	updateWispEffects(pushbackProgress);
	if (pushbackProgress >= 1) {
	    console.log(pushbackProgress);
	    ongoingPushback = false;
	} else {
	    const interpolatedPosition = new THREE.Vector3().lerpVectors(pushbackStart, pushbackEnd, easedProgress);
	    player.matrix.setPosition(interpolatedPosition);
	}
    } else {
	
	particles.rotation.y += 0.01;
    }
    wobblyCircle.position.copy(player.position);
    if (checkWinningCondition(player)) {
        showWinScreen();
    }
    
    
}
renderer.setAnimationLoop( animate );


function movePlayer(direction) {
    if (isGameOver) return; // timer logic

    let dx = 0;
    let dz = 0;
    if (cameraMode === 1) {
	if (direction == up) {
	    dz = -moveDistance;
	} else if (direction == down) {
	    dz = moveDistance;
	} else if (direction == left) {
	    dx = -moveDistance;
	} else if (direction == right) {
	    dx = moveDistance;
	}
    } else if (cameraMode === 2) {
	if (direction == up) {
            dx = -Math.sin(playerRotation) * moveDistance;
            dz = -Math.cos(playerRotation) * moveDistance;
	} else if (direction == down) {
            dx = Math.sin(playerRotation) * moveDistance;
            dz = Math.cos(playerRotation) * moveDistance;
	} else if (direction == left) {
            dx = -Math.cos(playerRotation) * moveDistance;
            dz = Math.sin(playerRotation) * moveDistance;
	} else if (direction == right) {
            dx = Math.cos(playerRotation) * moveDistance;
            dz = -Math.sin(playerRotation) * moveDistance;
	}
    }
    player.applyMatrix4(translationMatrix(dx, 0, dz));
}

let playerRotation = 0;

// Event listener for keyboard controls
document.addEventListener('keydown', (event) => {
    if (!ongoingPushback && !win) {
	switch (event.key) {
	case 'w':
            direction = up;
            break;
	case 's':
	    if (cameraMode === 1) {
		direction = down;
	    } else if (cameraMode === 2) {
		playerRotation += Math.PI;
		direction = up;
	    }
            break;
	case 'a':
	    if (cameraMode === 1) {
		direction = left;
	    } else if (cameraMode === 2) {
		playerRotation += Math.PI / 2;
		direction = up;
	    }
            break;
	case 'd':
	    if (cameraMode === 1) {
		direction = right;
	    } else if (cameraMode === 2) {
		playerRotation += 3 * Math.PI / 2;
		direction = up;
	    }
            break;
	case 'q':
	    direction = still;
	    break;
	case 'e':
	    cameraMode = cameraMode === 1 ? 2 : 1;
	    if (cameraMode === 1) { // if we switched to third person, reset the angle
		let playerAngle = playerRotation % (2 * Math.PI);
		if (direction === still) {
		    // nothing happens, direction does not change
		} else if (playerAngle < 0.001) { // forward direction
		    direction = up;
		} else if (playerAngle - Math.PI / 2 < 0.001) { // left
		    direction = left;
		} else if (playerAngle - Math.PI < 0.001) { // down
		    direction = down;
		} else if (playerAngle - Math.PI * 3 / 2 < 0.001) { // right
		    direction = right;
		}
	    } else if (cameraMode === 2) { // if we switched to first person, set rotation angle
		if (direction === up) {
		    playerRotation = 0;
		} else if (direction === down) {
		    playerRotation = Math.PI;
		} else if (direction === left) {
		    playerRotation = Math.PI / 2;
		} else if (direction === right) {
		    playerRotation = Math.PI * 3 / 2;
		}
		if (direction != still) {
		    direction = up;
		}
	    }
	    break;
	}
    }
    playerRotation = (playerRotation) % (2 * Math.PI);
    if (direction != still && !moveSound.isPlaying) moveSound.play()
    if (direction == still) moveSound.pause()}
);

const listener = new THREE.AudioListener();
camera.add(listener);

const bgm = new THREE.Audio(listener);
const moveSound = new THREE.Audio(listener);
const bumpSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
bgm.autoplay = true;
audioLoader.load('audio/bgm.mp3', buffer => { bgm.setBuffer(buffer); bgm.setLoop(true); bgm.play(); });
audioLoader.load('audio/move.mp3', buffer => { moveSound.setBuffer(buffer); moveSound.setLoop(true);});
audioLoader.load('audio/bump.mp3', buffer => {bumpSound.setBuffer(buffer); });


let result;
const interval = 1000;

let path = [];
let pathIndex = 0;
const monsterDistance = moveDistance;

function moveMonster() {
    if (isGameOver) return; // timer logic
    const monsterPosition = new THREE.Vector3().setFromMatrixPosition(monster.matrix);
    // teleportation logic
    const playerPosition = new THREE.Vector3().setFromMatrixPosition(player.matrix);
    // Check for intersection/catch
    if (monsterPosition.distanceTo(playerPosition) < 0.2) { 
        teleportPlayer(playerPosition.x, playerPosition.z);
        return;  // Skip movement for this frame
    }


    const pathLen = path.length;
    if (pathLen > 0 && pathIndex < pathLen - 1) {
	let targetPosition = getTargetPosition();
	
	if (monsterPosition.distanceTo(targetPosition) < 0.1) {
	    pathIndex++;
	    if (pathIndex >= pathLen) {
		return;
	    }
	    targetPosition = getTargetPosition();
	}
	let diff = new THREE.Vector3().subVectors(targetPosition, monsterPosition).normalize().multiplyScalar(monsterDistance);
	

	
	monster.applyMatrix4(translationMatrix(diff.x, 0, diff.z));
	
    // close to player and is at end of algorithm provided path
    } else {
	const playerPosition = new THREE.Vector3().setFromMatrixPosition(player.matrix);
	if (playerPosition.distanceTo(monsterPosition) < mazeBoxSize) {
	    let diff = new THREE.Vector3().subVectors(playerPosition, monsterPosition).normalize().multiplyScalar(monsterDistance);
	    monster.applyMatrix4(translationMatrix(diff.x, 0, diff.z));
	}
    }
}


function getTargetPosition() {
    let lookAheadIndex = pathIndex;
    let targetPosition = new THREE.Vector3();
    let distanceSum = 0;
    let lookAheadDistance = moveDistance;

    while (lookAheadIndex < path.length - 1 && distanceSum < lookAheadDistance) {
        let currentPoint = path[lookAheadIndex];
        let nextPoint = path[lookAheadIndex + 1];
        
        let currentPos = new THREE.Vector3(
            currentPoint[1] * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2),
            0,
            currentPoint[0] * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
        );
        
        let nextPos = new THREE.Vector3(
            nextPoint[1] * mazeBoxSize - (maze_ex[0].length * mazeBoxSize / 2),
            0,
            nextPoint[0] * mazeBoxSize - (maze_ex.length * mazeBoxSize / 2)
        );

        distanceSum += currentPos.distanceTo(nextPos);
        targetPosition.copy(nextPos);
        lookAheadIndex++;
    }

    return targetPosition;
}

//const intervalId = setInterval(countVisibleMirrors, interval);

// search algorithm

// node class to do search tree
class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.g = Infinity; // Cost from start to this node
        this.h = Infinity; // Heuristic cost from this node to end
        this.f = Infinity; // Total cost
        this.parent = null; // To reconstruct the path
    }
}

// a, b are Nodes
// manhattan distance heuristic; admissible, finds optimal path
function heuristic1(a, b) {
    return Math.abs(b.row - a.row) + Math.abs(b.col - a.col);
}


// return the next possible states
function getNeighbors(maze, node) {
    const neighbors = []
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    const mazeRows = maze.length;
    // assuming maze is at least 1 by 1
    const mazeCols = maze[0].length;
    
    // find next states
    for (const dir of directions) {
	const neighborRow = node.row + dir[0];
	const neighborCol = node.col + dir[1];
	// if neighboring location exists and is empty space
	if (neighborRow >= 0 && neighborRow < mazeRows && neighborCol >= 0 && neighborCol < mazeCols && isFacingEmpty(maze, neighborRow, neighborCol)) {
	    neighbors.push(new Node(neighborRow, neighborCol));
	}
    }

    return neighbors;
}

// start and goal positions are coordinate pairs
// maze is the 2D array abstraction
function aStar(maze, startPos, goalPos, heuristic) {
    const startNode = new Node(startPos[0], startPos[1]);
    const goalNode = new Node(goalPos[0], goalPos[1]);

    // initialize start node
    startNode.g = 0;
    startNode.h = heuristic(startNode, goalNode);
    startNode.f = startNode.h + startNode.h;

    // current search nodes
    const openSet = [startNode];
    // already searched nodes
    const closedSet = [];

    while (openSet.length > 0) {
        // Find the node with the lowest f value
        let currentNode = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < currentNode.f) {
                currentNode = openSet[i];
            }
        }

        // If we reached the goal
        if (currentNode.row === goalNode.row && currentNode.col === goalNode.col) {
            const path = [];
            let temp = currentNode;
	    // trace through parents back to root (goal to start)
            while (temp) {
                path.push([temp.row, temp.col]);
                temp = temp.parent;
            }
	    // reverse the path to get the path from start to goal
            return path.reverse();
        }

	// Move current node to searched set
        openSet.splice(openSet.indexOf(currentNode), 1);
        closedSet.push(currentNode);

        // Push so-far unexplored, valid neighboring nodes
        for (const neighbor of getNeighbors(maze, currentNode)) {
            if (closedSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                continue; // Ignore already evaluated nodes
            }
	    
            const tentativeGScore = currentNode.g + 1; // Distance from start to neighbor

            if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                openSet.push(neighbor); // Discover a new node
            } else if (tentativeGScore >= neighbor.g) {
                continue; // Not a better path
            }

            // Record the best path so far
            neighbor.parent = currentNode;
            neighbor.g = tentativeGScore;
            neighbor.h = heuristic(neighbor, goalNode);
            neighbor.f = neighbor.g + neighbor.h;
        }
    }

    return []; // No path found
}

function toGridPosition(x, z) {
    const halfWidth = (maze_ex[0].length * mazeBoxSize) / 2;
    const halfLength = (maze_ex.length * mazeBoxSize) / 2;
    // derived from how the maze is initialized
    let i = Math.round((z + halfLength) / mazeBoxSize);
    let j = Math.round((x + halfWidth) / mazeBoxSize);
    return [i, j]
}


function findMonsterPath() {
    const playerPosition = new THREE.Vector3().setFromMatrixPosition(player.matrix)
    const monsterPosition = new THREE.Vector3().setFromMatrixPosition(monster.matrix)
    // test
    path = aStar(maze_ex, toGridPosition(monsterPosition.x, monsterPosition.z), toGridPosition(playerPosition.x, playerPosition.z), heuristic1);
    console.log(path);
    pathIndex = 0;
}
// in milliseconds
const interval2 = 500;
const intervalId2 = setInterval(findMonsterPath, interval2);
