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
const ground = createPlane(boxSize, boxSize, 0x808080, -Math.PI / 2, 0 - l);
scene.add(ground);

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

const geometry = new THREE.PlaneGeometry(boxSize, boxSize);
const groundMirror = new Reflector(geometry, {
    clipBias: 0.003,
    textureWidth: 512,
    textureHeight: 512
    //color: 0x808080
});
groundMirror.position.set(0, -l + 0.01, 0);
groundMirror.rotation.x = -Math.PI / 2;
scene.add(groundMirror);

camera.position.set(0, 10*l, 0);

// Setting up the maze
const maze_ex = [
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 0, 1],
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

const wispGeometry = new THREE.SphereGeometry(l, 32, 32);
const wispMaterial = new THREE.MeshBasicMaterial({
    color: 0x7156B6, 
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
    color: 0x7156B6,
    size: 0.01,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(wisp); 
wisp.add(particles); 
const player = wisp;

const monsterGeometry = new THREE.DodecahedronGeometry(0.3);
const monsterMaterial = new THREE.MeshStandardMaterial({
    color: 0x252424, 
    flatShading: true,
    emissive: 0xDDD8D8, 
    emissiveIntensity: 0.2,
});
const monster = new THREE.Mesh(monsterGeometry, monsterMaterial);
monster.castShadow = true;
monster.receiveShadow = true;
scene.add(monster);

const shardGeometry = new THREE.TetrahedronGeometry(0.1);
const shardMaterial = new THREE.MeshStandardMaterial({
    color: 0x252424, 
    emissive: 0xDDD8D8, 
    emissiveIntensity: 0.3,
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
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    wobblyCircle = new THREE.Mesh(geometry, material);
    wobblyCircle.rotation.x = Math.PI / 2; // Rotate to face upwards
    scene.add(wobblyCircle);
}
let initialRotation = new THREE.Euler();
const maxTiltAngle = Math.PI / 3; // Maximum tilt angle (30 degrees)

function updateWobblyCircle(pushbackProgress) {
    if (wobblyCircle) {
        // Wobble effect using sine function
	const time = pushbackProgress - pushbackTimeStart;
        // More complex wobble effect using multiple sine waves
        const scale = 1 + (
            Math.sin(time * wobbleSpeed) +
            Math.sin(time * wobbleSpeed * 1.3 + Math.PI / 4) +
            Math.sin(time * wobbleSpeed * 0.7 + Math.PI / 2)
        ) * wobbleAmplitude / 3;
        wobblyCircle.scale.set(scale, scale, scale);

        // More random rotation using multiple sine waves
        const tiltY = (
            Math.sin(time * 2.5) +
            Math.sin(time * 3.1 + Math.PI / 3)
        ) * maxTiltAngle * (1 - pushbackProgress) / 2;

        const tiltZ = (
            Math.sin(time * 3.7) +
            Math.sin(time * 2.9 + Math.PI / 6)
        ) * maxTiltAngle * (1 - pushbackProgress) / 2;
        
        wobblyCircle.rotation.y = initialRotation.y + tiltY;
        wobblyCircle.rotation.z = initialRotation.z + tiltZ;
        
        wobblyCircle.position.copy(player.position);
    }
}



// Call this function once when initializing your scene
createWobblyCircle();


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
       
                if (i > 0 && isFacingEmpty(maze, i - 1, j)  && counter1 <= 50) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x, wall.position.y, wall.position.z - mazeBoxSize / 2 - offset),
                        Math.PI);
                    counter1+=1;
                }
                if (i < maze.length - 1 && isFacingEmpty(maze, i + 1, j) && counter2 <= 50) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x, wall.position.y, wall.position.z + mazeBoxSize / 2 + offset),
                        0);
                }
                if (j > 0 && isFacingEmpty(maze, i, j - 1) && counter3 <= 50) {  
                    createMirror(mazeBoxSize, mazeHeight, 
                        new THREE.Vector3(wall.position.x - mazeBoxSize / 2 - offset, wall.position.y, wall.position.z),
                        -Math.PI / 2);
                }
    
                if (j < maze[i].length - 1 && isFacingEmpty(maze, i, j + 1)  && counter4 <= 51) {  
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
    groundMirror.receiveShadow = true;
    let matrix = new THREE.Matrix4();
    matrix.copy(player.matrix);
    movePlayer(direction);
    moveMonster();
    
    updateCameraPosition();
    updateVisibleMirrors();
    // constantly check collisons
    checkCollisions();
    if (ongoingPushback) {
	const elapsedTime = clock.getElapsedTime() - pushbackTimeStart;
	const pushbackProgress = Math.min(elapsedTime / pushbackDuration, 1);
	const easedProgress = easeOutCubic(pushbackProgress);
	updateWobblyCircle(pushbackProgress);
	if (pushbackProgress >= 1) {
	    console.log(pushbackProgress);
	    ongoingPushback = false;
	    player.matrix.setPosition(pushbackEnd);
	} else {
	    const interpolatedPosition = new THREE.Vector3().lerpVectors(pushbackStart, pushbackEnd, easedProgress);
	    player.matrix.setPosition(interpolatedPosition);
	}
    }
    wobblyCircle.position.copy(player.position);
   // wobblyCircle.position.y -= l / 2;
    const time = performance.now() * 0.003;
    wispMaterial.opacity = 0.6 + 0.3 * Math.sin(time);
    particles.rotation.y += 0.01;
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

// Event listener for keyboard controls
document.addEventListener('keydown', (event) => {
    if (!ongoingPushback) {
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
const monsterDistance = moveDistance * 6 / 7;

function moveMonster() {
    const monsterPosition = new THREE.Vector3().setFromMatrixPosition(monster.matrix);
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

function heuristic0(a, b) {
    return 10;
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



let difficulty = 1;

function findMonsterPath() {
    const playerPosition = new THREE.Vector3().setFromMatrixPosition(player.matrix)
    const monsterPosition = new THREE.Vector3().setFromMatrixPosition(monster.matrix)
    let heuristic;
    switch (difficulty) {
    case 1:
	heuristic = heuristic1;
	break;
    default:
	heuristic = heuristic0;
    }
    // test
    path = aStar(maze_ex, toGridPosition(monsterPosition.x, monsterPosition.z), toGridPosition(playerPosition.x, playerPosition.z), heuristic);
    console.log(path);
    pathIndex = 0;
}
// in milliseconds
const interval2 = 500;
const intervalId2 = setInterval(findMonsterPath, interval2);
