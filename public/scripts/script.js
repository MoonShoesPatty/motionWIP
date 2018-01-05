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

// Player object
const player = {
	x: gameWidth / 2.2,
	y: gameHeight - playerSize,
	width: playerSize,
	height: playerSize,
	speed: 6,
	acceleration: 2,
	jumpSpeed: 20,
	xVelocity: 0,
	yVelocity: 0,
	jumping: false,
	grounded: false

	// User input
};const keys = [];

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
	// Move player
	if (player.grounded && !(keys[39] || keys[37])) {
		player.xVelocity *= friction;
	}
	player.yVelocity += gravity;

	// Clear before drawing
	ctx.clearRect(0, 0, gameWidth, gameHeight);

	// Draw platforms
	ctx.fillStyle = 'white';
	ctx.beginPath();

	player.grounded = false;
	platforms.forEach(platform => {
		ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
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
	});

	if (player.grounded) {
		player.yVelocity = 0;
	}

	player.x += player.xVelocity;
	player.y += player.yVelocity;

	ctx.fill();

	// Draw player
	ctx.fillStyle = '#12B4E9';
	ctx.fillRect(player.x, player.y, player.width, player.height);
	// Run the game!
	requestAnimationFrame(update);
}

// Collision check - platforms - credit to http://www.somethinghitme.com
function collisonCheck(shapeA, shapeB) {
	// get the vectors to check against
	const vX = shapeA.x + shapeA.width / 2 - (shapeB.x + shapeB.width / 2);
	const vY = shapeA.y + shapeA.height / 2 - (shapeB.y + shapeB.height / 2);
	// add the half widths and half heights of the objects
	const hWidths = shapeA.width / 2 + shapeB.width / 2;
	const hHeights = shapeA.height / 2 + shapeB.height / 2;
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
			} else {
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
	if (player.xVelocity * direction < 0 && !player.jumping) {
		player.xVelocity = 0;
	}
	if (player.jumping) {
		player.xVelocity = player.xVelocity + player.acceleration * direction * -1 / 1.2;
	}
	if (player.xVelocity * direction < player.speed) {
		player.xVelocity = player.xVelocity + player.acceleration * direction;
	}
}

function jump() {
	if (!player.jumping && player.grounded) {
		player.jumping = true;
		player.grounded = false;
		player.yVelocity = -player.jumpSpeed;
	}
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