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
}

// User input
const keys = [];

// Redraw game
function update() {
	// Check keys
	if (keys[38]) {
		console.log('up');
	}
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
		if (!player.jumping) {
			player.jumping = true;
			player.yVelocity = -player.jumpSpeed;
		}
	}
	// Move player
	if (!player.jumping && !(keys[39] || keys[37])) {
		player.xVelocity *= friction;
	}
	player.yVelocity += gravity;
	player.x += player.xVelocity;
	player.y += player.yVelocity;
	// Add horizontal bounds
	if (player.x >= gameWidth - player.width) {
		player.x = gameWidth - player.width;
	} else if (player.x <= 0) {
		player.x = 0;
	}
	// Add bottom boundary
	if (player.y >= gameHeight - player.height) {
		player.y = gameHeight - player.height;
		player.jumping = false;
	}
	// Draw player
	ctx.clearRect(0, 0, gameWidth, gameHeight);
	ctx.fillStyle = '#12B4E9';
	ctx.fillRect(player.x, player.y, player.width, player.height);
	// Run the game!
	requestAnimationFrame(update);
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
	if ((player.xVelocity * direction) < 0 && !player.jumping) {
		player.xVelocity = 0;
	}
	if (player.jumping) {
		player.xVelocity = player.xVelocity + ((player.acceleration * direction * -1) / 1.2);
	}
	if ((player.xVelocity * direction) < player.speed) {
		player.xVelocity = player.xVelocity + (player.acceleration * direction);
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