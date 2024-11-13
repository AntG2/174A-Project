import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

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

// Setting up the maze
const maze_ex = [
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
const player = new THREE.Mesh(
		    new THREE.SphereGeometry(l, 32, 32),
		    new THREE.MeshPhongMaterial({color: 0xff0000})
		);


// Collision Dectection
function checkCollisions() {
    let pushBackDistance = 0.1; // fine tune it for bounce back affect
    let collisionDetected = false;

    for (const wallBB of wallBBes) {
        if (player_BS.intersectsBox(wallBB)) {
            collisionDetected = true;
            break;
        }
    }
    if (collisionDetected) {
        // Apply a small push-back
        if (direction === up) player.applyMatrix4(translationMatrix(0, 0, pushBackDistance));
        else if (direction === down) player.applyMatrix4(translationMatrix(0, 0, -pushBackDistance));
        else if (direction === left) player.applyMatrix4(translationMatrix(pushBackDistance, 0, 0));
        else if (direction === right) player.applyMatrix4(translationMatrix(-pushBackDistance, 0, 0));

        // Stop movement after collison
        direction = still;
    }
}

// Bounding Sphere for player
let player_BS = new THREE.Sphere(player.position, 0.35); // using a smaller BS (0.35)

// Bounding Boxes for wall
const wallBBes = [];

////////// END OF COLLISiON DETECTION //////////// 

function createMaze(maze) {
    const wallGeometry = new THREE.BoxGeometry(mazeBoxSize, mazeHeight, mazeBoxSize);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
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
	    }
		
        }
    }
	
}
createMaze(maze_ex);

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

const moveDistance = 0.03;

function animate() {
    renderer.render( scene, camera );
    let matrix = new THREE.Matrix4();
    matrix.copy(player.matrix);
    movePlayer(direction);
    moveMonster();
    
    updateCameraPosition();
    //clampCameraPosition();
    delta_animation_time = clock.getDelta();
    animation_time += delta_animation_time;
    
    // constantly check collisons
    checkCollisions();
}
renderer.setAnimationLoop( animate );


function movePlayer(direction) {
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
let lastD = still;

// Event listener for keyboard controls
document.addEventListener('keydown', (event) => {
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
	}
        break;
    case 'd':
	if (cameraMode === 1) {
	    direction = right;
	} else if (cameraMode === 2) {
	    playerRotation += 3 * Math.PI / 2;
	}
        break;
    case 'q':
	direction = still;
	break;
    case 'e':
	cameraMode = cameraMode === 1 ? 2 : 1;
	if (cameraMode === 1) { // if we switched to third person, reset the angle
	    console.log(playerRotation);
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
    playerRotation = (playerRotation) % (2 * Math.PI);
    
});

let result;
const interval = 5000;

function moveMonster() {

}

function asyncCalculation() {
    result = Math.random() * 100;
    console.log("new res: ", result);
}

const intervalId = setInterval(asyncCalculation, interval);
