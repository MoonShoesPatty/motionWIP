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
const runSpeed = 12;
const walkSpeed = 6;


// User input
const keys = [];

// Platforms Array
const platforms = [];
	// Add canvas bounds
	platforms.push({
		x: 0,
		y: 0,
		width: 1,
		height: gameHeight
	});
	platforms.push({
		x: 0,
		y: gameHeight - 1,
		width: gameWidth,
		height: 50
	});
	platforms.push({
		x: gameWidth - 1,
		y: 0,
		width: 1,
		height: gameHeight
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

// Player object
const player = {
	x: gameWidth / 2.2,
	y: gameHeight - playerSize,
	width: playerSize,
	height: playerSize,
	speed: walkSpeed,
	acceleration: 1,
	jumpSpeed: 15,
	xVelocity: 0,
	yVelocity: 0,
	jumping: false,
	canExtendJump: floatLength,
	grounded: false
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

	// Draw platforms
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2;
	ctx.beginPath();

	player.grounded = false;
	platforms.forEach(platform => {
		ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
		let collisionDirection = collisonCheck(player, platform);
		
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

	// Move the player based on x & y velocity calculations above
	player.x += player.xVelocity;
	player.y += player.yVelocity;

	// Draw player
	ctx.strokeStyle = '#12B4E9';
	ctx.strokeRect(player.x, player.y, player.width, player.height);
	// Run the game!
	requestAnimationFrame(update);
}

// Collision check - platforms - credit to http://www.somethinghitme.com
function collisonCheck(shapeA, shapeB) {
	// get the vectors to check against
	const vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2));
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

// Handle keypresses
function handleKeydown(e) {
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

// Bounce player while they walk
function walkCycle() {
	
}
// Squish player when they land on the ground after falling
function hitGround() {

}
// Set player to regular shape
function resetPlayerShape() {

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