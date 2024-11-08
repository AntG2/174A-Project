import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0xffffff, // White color
    shininess: 100   // Shininess of the material
});


function createPlane(width, height, color, rotationX, positionY) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = rotationX;
    plane.position.y = positionY;
    return plane;
}

const boxSize = 100
const l = 0.4
const mazeHeight = 20
const mazeBoxSize = 1

// Ground
const ground = createPlane(boxSize, boxSize, 0x808080, -Math.PI / 2, 0 - l);
scene.add(ground);

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

camera.position.set(0, 10*l, 0);
controls.target.set(0, 0, 0);


// Setting up the maze
const maze_ex = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function createMaze(maze) {
    const wallGeometry = new THREE.BoxGeometry(mazeBoxSize, mazeHeight, mazeBoxSize);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
    const emptySpaces = [];
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 1) {
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(
                    j * mazeBoxSize - (maze[0].length * mazeBoxSize / 2), 
                    mazeHeight / 2, 
                    i * mazeBoxSize - (maze.length * mazeBoxSize / 2)
                );
                scene.add(wall);
            } else { // maze[i][j] == 0
		emptySpaces.push({x: j, z: i});
	    }
		
        }
    }
    return emptySpaces
	
}

function placePlayerRandomly(empty, player, maze) {
    const numEmpty = empty.length
    if (numEmpty === 0) {
        console.error("No empty spaces in the maze!");
        return;
    }

    const randomSpace = empty[Math.floor(Math.random() * numEmpty)];
    
    const offsetX = -maze[0].length * mazeBoxSize / 2;
    const offsetZ = -maze.length * mazeBoxSize / 2;

    player.position.set(
        randomSpace.x * mazeBoxSize + offsetX,
        player.position.y, // Keep the current Y position
        randomSpace.z * mazeBoxSize + offsetZ
    );
}


const emptySpaces = createMaze(maze_ex);

const player = new THREE.Mesh(
    new THREE.SphereGeometry(l, 32, 32),
    new THREE.MeshPhongMaterial({color: 0xff0000})
);
scene.add(player);

placePlayerRandomly(emptySpaces, player, maze_ex); 


// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(0, mazeHeight, 0); // Position the light
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x606060);  // Soft white light
scene.add(ambientLight);


function translationMatrix(tx, ty, tz) {
    return new THREE.Matrix4().set(
	1, 0, 0, tx,
	0, 1, 0, ty,
	0, 0, 1, tz,
	0, 0, 0, 1
	);
}
// TODO: Implement the other transformation functions.
function rotationMatrixZ(theta) {
    return new THREE.Matrix4().set(
	Math.cos(theta), -Math.sin(theta), 0, 0,
	Math.sin(theta), Math.cos(theta), 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
	);
}

function scalingMatrix(sx, sy, sz) {
  return new THREE.Matrix4().set(
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
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
const maxY = mazeHeight / 3;
const minZ = -boxSize / 2;
const maxZ = boxSize / 2;

controls.minPolarAngle = 0; // Minimum vertical rotation
controls.maxPolarAngle = 0; // Maximum vertical rotation (horizontal view)
controls.minDistance = 1; // Minimum zoom distance
controls.maxDistance = boxSize / 2; // Maximum zoom distance

function clampCameraPosition() {
    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
}

function updateCameraPosition() { 
    camera.position.x = player.position.x;
    camera.position.z = player.position.z;
    camera.lookAt(player.position);
}

function animate() {
    renderer.render( scene, camera );
    controls.update();
    updateCameraPosition();
    clampCameraPosition();
    // TODO
    // Animate the cube
    delta_animation_time = clock.getDelta();
    animation_time += delta_animation_time;
    // ...
    // feel free to add other auxiliary variables if needed.
    
    
    // angle = amp * sin (ang_freq * time) + offset
    

    
   

}
renderer.setAnimationLoop( animate );

function movePlayer(dx, dz) {
    const newX = player.position.x + dx;
    const newZ = player.position.z + dz;

    //if (checkCollision(newX, newZ)) {
    player.position.x = newX;
    player.position.z = newZ;
    //}
}

// Event listener for keyboard controls
document.addEventListener('keydown', (event) => {
    const moveDistance = 0.05;
    switch (event.key) {
        case 'w':
            movePlayer(0, -moveDistance);
            break;
        case 's':
            movePlayer(0, moveDistance);
            break;
        case 'a':
            movePlayer(-moveDistance, 0);
            break;
        case 'd':
            movePlayer(moveDistance, 0);
            break;
    }
});
