// Redraw function in canvas, called later to refresh graphics
(function () {
	const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

// Canvas selectors
const canvas = document.getElementById('gameScreen');
const ctx = canvas.getContext('2d');

// Game size
const gameWidth = window.innerWidth - 40;
const gameHeight = window.innerHeight - 40;

// Set up canvas
canvas.width = gameWidth;
canvas.height = gameHeight;
canvas.style.top = '20px';
canvas.style.left = '20px';

// General game variables
const playerSize = 40;
const friction = 0.5;
const gravity = 0.7;
const floatLength = 20; //time that user can hold to jump higher - higher the number, higher user can jump
const runSpeed = 10;
const walkSpeed = 5;
const coinSize = 15;
const scrollBound = 200; //distance before the edge of the screen where level scroll function begins
const levelWidth = gameWidth * 4; // upper bound for the screen to scroll right
// measured in 'gameWidth' units (i.e. this level is 5 gameWidths long)
// measured from leftmost bound - so (* 4) makes a playable area of FIVE gameWidths long

const deathDropSpeed = -10;
const deathPauseLength = 2000;
const bulletSpeed = 20;

// scroll distance, used to offset platforms as screen scrolls
let scrollDistance = 0;
let bulletDelay = 0;

// User input
const keys = [];

// Platforms Array structure:
	// MANDATORY
	//  x: x position of left side of platform. 
	//
	//
	//
	// OPTIONAL PROPERTIES

// Platforms Array
const platforms = [];
	// Add canvas bounds
	platforms.push({
		x: 0,
		y: 0,
		width: 1,
		height: gameHeight,
		bound: true
	});
	platforms.push({
		x: 0,
		y: gameHeight - 1,
		width: gameWidth,
		height: 50,
		bound: true
	});
	platforms.push({
		x: gameWidth - 1,
		y: 0,
		width: 1,
		height: gameHeight,
		bound: true
	});

	// Add in-game platforms
	platforms.push({
		x: 120,
		y: 500,
		width: 120,
		height: 20
	});
	platforms.push({
		x: 320,
		y: 400,
		width: 120,
		height: 20
	});
	platforms.push({
		x: 520,
		y: 300,
		width: 120,
		height: 20
	});

	platforms.push({
		x: 1920,
		y: 500,
		width: 120,
		height: 20
	});
	platforms.push({
		x: 2120,
		y: 400,
		width: 120,
		height: 20
	});
	platforms.push({
		x: 2320,
		y: 300,
		width: 120,
		height: 20
	});

	platforms.push({
		x: gameWidth,
		y: 0,
		width: 2,
		height: 20
	});
	platforms.push({
		x: gameWidth * 2,
		y: 0,
		width: 2,
		height: 20
	});
	platforms.push({
		x: gameWidth * 3,
		y: 0,
		width: 2,
		height: 20
	});
	platforms.push({
		x: gameWidth * 4,
		y: 0,
		width: 2,
		height: 20
	});

// Items array
const items = [];
	// coin items
	items.push({
		x: 172.5,
		y: 400,
		coin: true,
		collected: false
	});
	items.push({
		x: 372.5,
		y: 300,
		coin: true,
		collected: false
	});
	items.push({
		x: 572.5,
		y: 200,
		coin: true,
		collected: false
	});

const projectiles = [];

// Enemies Array
const enemies = [];
	// emeny items
	enemies.push({
		x: gameWidth * 1.5,
		y: gameHeight - playerSize,
		width: playerSize,
		height: playerSize,
		speed: 3,
		alive: true
	})
	enemies.push({
		x: gameWidth * 1.6,
		y: gameHeight - playerSize,
		width: playerSize,
		height: playerSize,
		speed: 3,
		alive: true
	})

// Player object
const player = {
	x: gameWidth / 2.2,
	y: gameHeight - playerSize,
	width: playerSize,
	height: playerSize,
	speed: walkSpeed,
	acceleration: 0.8,
	jumpSpeed: 15,
	xVelocity: 0,
	yVelocity: 0,
	jumping: false,
	canExtendJump: floatLength,
	grounded: false,
	score: 0,
	alive: true
}

// Redraw game
function update() {
	// Right Arrow Key
	if (keys[39]) {
		// multiply everything by a factor of (1) -> moves the character right		
		horizontalMove(1);
	}
	// Left Arrow Key
	if (keys[37]) {
		// multiply everything by a factor of (-1) -> moves the character left
		horizontalMove(-1);
	}
	//      UP   or   SPACE
	if (keys[38] || keys[32]) {
		jump();
	}
	// D for SHOOT
	if (keys[68]) {
		shoot();
	}
	// SHIFT for RUN
	if (keys[16]) {
		player.speed = runSpeed;
	} else {
		player.speed = walkSpeed;
		if (Math.abs(player.xVelocity) > walkSpeed) {
			player.xVelocity /= 1.1;
		}
	}
	// Move player
	if (player.grounded && !(keys[39] || keys[37])) {
		player.xVelocity *= friction;
	}
	player.yVelocity += gravity;

	// Clear before drawing
	ctx.clearRect(0, 0, gameWidth, gameHeight);

	// Draw objects in world
	ctx.strokeStyle = 'yellow';
	ctx.lineWidth = 2;
	ctx.beginPath();

	player.grounded = false;
	// Draw coins
	items.forEach(item => {
		let collisionDirection;
		if (item.coin && !item.collected) {
			ctx.strokeRect(item.x + scrollDistance,	item.y,	coinSize, coinSize);
			collisionDirection = coinCheck(player, item);
		}
		// console.log(collisionDirection);
		if (collisionDirection) {
			item.collected = true;
			player.score += 100;
		}
	});
	// Draw projectiles
	projectiles.forEach(bullet => {
		let collisionDirection;
		bullet.x += bulletSpeed;
		ctx.strokeRect(bullet.x + scrollDistance, bullet.y, coinSize, coinSize);
	})
	// only allow the player to shoot after time has passed (i.e. no machine guns)
	bulletDelay--;
	// Draw enemies
	ctx.strokeStyle = 'red';
	enemies.forEach(enemy => {
		let collisionDirection;
		if (enemy.alive) {
			ctx.strokeRect(enemy.x + scrollDistance, enemy.y, playerSize, playerSize);
			enemy.x -= enemy.speed;
			collisionDirection = collisionCheck(player, enemy);
		}
		if (collisionDirection === "l" || collisionDirection === "r" || collisionDirection === "t") {
			player.alive = false;
		} else if (collisionDirection === "b") {
			player.yVelocity = -player.yVelocity * 0.5;
			enemy.speed = 0;
			enemy.alive = false;
		}
	})
	// Draw platforms
	ctx.strokeStyle = 'white';	
	platforms.forEach(platform => {
		ctx.strokeRect(
			(platform.bound) ? platform.x : platform.x + scrollDistance,
			platform.y, 
			platform.width, 
			platform.height);
		let collisionDirection = collisionCheck(player, platform);
		
		if (collisionDirection === "l" || collisionDirection === "r") {
			player.xVelocity = 0;
			player.jumping = false;
		} else if (collisionDirection === "b") {
			player.grounded = true;
			player.jumping = false;
		} else if (collisionDirection === "t") {
			player.yVelocity *= -0.2;
		}
	})

	// counteract gravity while player's feet are on the ground
	if (player.grounded) {
		player.yVelocity = 0;
		player.canExtendJump = floatLength;
	} else {
		player.canExtendJump--;
	}

	// Move the player based on xVelocity calculations above
	// If the player is within the 'playable' area - before scroll bounds on either side
	if ((player.x > scrollBound) && (player.x < (gameWidth - (scrollBound * 2)))) {
		player.x += player.xVelocity;
	} 
	// Else, the player is pushing the screen on the RIGHT bound
	else if (player.x >= (gameWidth - (scrollBound * 2))) {
		// Push the screen RIGHT if that's the direction player is walking
		if ((player.xVelocity > 0) && (-scrollDistance < levelWidth)) {
			scrollDistance -= player.xVelocity;
		}
		// otherwise allow the player to walk back toward the middle
		else {
			player.x += player.xVelocity;
		}
	} 
	// Else, the player is pushing the LEFT bound
	else if (player.x <= scrollBound) {
		// Push the screen LEFT if that's the direction player is walking
		if ((player.xVelocity < 0) && (scrollDistance < 0)) {
			scrollDistance -= player.xVelocity;
		}
		// otherwise allow the player to walk back toward the middle
		else {
			player.x += player.xVelocity;
		}
	}
	// yVelocity is much easier.
	player.y += player.yVelocity;

	// Draw player
	ctx.strokeStyle = '#12B4E9';
	if (player.alive) {
		ctx.strokeRect(player.x, player.y, player.width, player.height);

		// Run the game!
		requestAnimationFrame(update);
	} else {
		ctx.strokeRect(player.x, player.y, player.width, player.height);
		player.yVelocity = deathDropSpeed;
		deathDelay(deathPauseLength);
	}
}

// Collision check - coins - credit to http://www.somethinghitme.com
function coinCheck(player, coin) {
	// get the vectors to check against
	const vX = (player.x + (player.width / 2)) - (plusScrollDistance(coin) + (coinSize / 2));
	const vY = (player.y + (player.height / 2)) - (coin.y + (coinSize / 2));
	// add the half widths and half heights of the objects
	const hWidths = (player.width / 2) + (coinSize / 2);
	const hHeights = (player.height / 2) + (coinSize / 2);
	// return value - are we colliding?
	let collision = null;

	// if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
	if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
		collision = true;
	}
	return collision;
}

// Collision check - platforms - credit to http://www.somethinghitme.com
function collisionCheck(shapeA, shapeB) {
	// get the vectors to check against
	const vX = (shapeA.x + (shapeA.width / 2)) - (plusScrollDistance(shapeB) + (shapeB.width / 2));
	const vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2));
	// add the half widths and half heights of the objects
	const hWidths = (shapeA.width / 2) + (shapeB.width / 2);
	const hHeights = (shapeA.height / 2) + (shapeB.height / 2);
	// return value - which direction are we colliding?
	let colDir = null;

	// if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
	if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
		// figures out on which side we are colliding (top, bottom, left, or right)         
		const oX = hWidths - Math.abs(vX);            
		const oY = hHeights - Math.abs(vY);         
		if (oX >= oY) {
			if (vY > 0) {
				colDir = "t";
				shapeA.y += oY;
			} else if (vY < 0) {
				colDir = "b";
				shapeA.y -= oY;
			}
		} else {
			if (vX > 0) {
				colDir = "l";
				shapeA.x += oX;
			} else {
				colDir = "r";
				shapeA.x -= oX;
			}
		}
	}
	return colDir;
}

// return platform.x coordinate for canvas bounds,
// return platform.x coordinate PLUS scroll distance for platforms
// nice little function to keep logic clean ^_^
function plusScrollDistance(platform) {
	return (platform.bound) ? platform.x : platform.x + scrollDistance;
}

// Handle keypresses
function handleKeydown(e) {
	// console.log(e.keyCode)
	keys[e.keyCode] = true;
}
function handleKeyup(e) {
	keys[e.keyCode] = false;
}

// Motion functions - respond to keypresses
function horizontalMove(direction) {
	// If player is moving in the opposite direction and their feet are on the ground, stop them
	if ((player.xVelocity * direction) < 0 && !player.jumping) {
		player.xVelocity = 0;
	}
	// If the player is in midair, give less horizontal control
	if (player.jumping) {
		player.xVelocity = player.xVelocity + ((player.acceleration * direction * -1) / 1.2);
	}
	// If the player is not moving at max speed, speed up!
	if ((player.xVelocity * direction) < player.speed) {
		player.xVelocity = player.xVelocity + (player.acceleration * direction);
	}
}

// Jump function - activated by up arrow or spacebar
function jump() {
	// If the player's feet are on the ground, have them jump
	if (!player.jumping && player.grounded) {
		player.jumping = true;
		player.grounded = false;
		player.yVelocity = -player.jumpSpeed;
	} else if (player.canExtendJump > 0 && (keys[38] || keys[32])) {
		// Allow player to extend jump if soon enough after jump AND they are holding jump key
		player.yVelocity -= gravity / 1.7;
	}
}

// Shoot function - activated by D key
function shoot() {
	if (bulletDelay < 0) {
		projectiles.push({
			x: player.x + (player.width / 2),
			y: player.y + (player.height / 2) - (coinSize / 2)
		})
		bulletDelay = 30;
	}
}

// Bounce player while they walk
function walkCycle() {
	
}
// Squish player when they land on the ground after falling
function hitGround() {

}
// Set player to regular shape
function resetPlayerShape() {

}
// Animate the player dying
function deathAnimation() {
	ctx.clearRect(0, 0, gameWidth, gameHeight);
	// draw enemies
	ctx.strokeStyle = 'red';
	enemies.forEach(enemy => {
		if (enemy.alive) {
			ctx.strokeRect(enemy.x + scrollDistance, enemy.y, playerSize, playerSize);
		}
	})
	// draw platforms
	ctx.strokeStyle = 'white';
	platforms.forEach(platform => {
		ctx.strokeRect(
			(platform.bound) ? platform.x : platform.x + scrollDistance,
			platform.y,
			platform.width,
			platform.height);
	});
	// draw items
	ctx.strokeStyle = 'yellow';
	items.forEach(item => {
		if (item.coin && !item.collected) {
			ctx.strokeRect(item.x + scrollDistance, item.y, coinSize, coinSize);
		}
	});

	ctx.strokeStyle = '#12B4E9';
	player.y += player.yVelocity;
	player.yVelocity += 1;
	ctx.strokeRect(player.x, player.y, player.width, player.height);
	requestAnimationFrame(deathAnimation);
}

function deathDelay(delayTime) {
	setTimeout(deathAnimation, delayTime)
}

// Key watchers
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

// Init function
function init() {
	update();
}

// Document Ready
document.addEventListener('DOMContentLoaded', init);