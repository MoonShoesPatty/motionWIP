// Redraw function in canvas, called later to refresh graphics
(function () {
	const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

// Canvas selectors
const canvas = document.getElementById('gameScreen');
const ctx = canvas.getContext('2d');

// Game size
const gameWidth = 853;
const gameHeight = 480;

// Set up canvas
canvas.width = gameWidth;
canvas.height = gameHeight + 200;

// General game variables
const playerSize = 30;
const friction = 0.5;
const gravity = 0.7;
const floatLength = 20; //time that user can hold to jump higher - higher the number, higher user can jump
const runSpeed = 9;
const walkSpeed = 5;
const coinSize = 10;
const scrollBound = 100; //distance before the edge of the screen where level scroll function begins
const levelWidth = gameWidth * 12; // upper bound for the screen to scroll right
// measured in 'gameWidth' units (i.e. this level is 5 gameWidths long)
// measured from leftmost bound - so (* 4) makes a playable area of FIVE gameWidths long

const deathDropSpeed = -10;
const deathPauseLength = 800;
const bulletSpeed = 20;

// scroll distance, used to offset platforms as screen scrolls
let scrollDistance = 0;
let bulletDelay = 0;
let gravityDirection = 1;
let gravSwitch = 0;

// User input
const keys = [];

// Platforms Array
const platforms = [
	// GAME BOUNDS
	{ // top bound
		x: 0,
		y: -49,
		width: gameWidth,
		height: 50,
		bound: true
	},
	{ // bottom bound
		x: -5,
		y: gameHeight - 1,
		width: gameWidth + 10,
		height: 205,
		bound: true
	},
	{ // left bound
		x: gameWidth - 1,
		y: 0,
		width: 50,
		height: gameHeight,
		bound: true
	},
	{ // right bound
		x: -49,
		y: 0,
		width: 50,
		height: gameHeight,
		bound: true
	}
];

// IN-GAME PLATFORMS - format: {x, y, width, height}
// x: percentage of gameWidth (0 is left, 1 is right, 2 is 2x game width, etc)
// y: percentage of gameHeight (0 is top, 1 is bottom)
// width: percentage of gameWidth (0 is no width, 1 spans full screen width)
// height: percentage of gameHeight (0 is no height, 1 spans full screen height)

const tutorialPlatforms = [
	// PART 1
	{
		x: 0.6,
		y: 0.75,
		width: 0.18,
		height: 0.03
	},
	{
		x: 0.9,
		y: 0.5,
		width: 0.2,
		height: 0.51
	},
	{
		x: 1.25,
		y: 0.75,
		width: 0.15,
		height: 0.03
	},
	{
		x: 1.45,
		y: 0.5,
		width: 0.15,
		height: 0.03
	},
	{
		x: 1.65,
		y: 0.25,
		width: 0.15,
		height: 0.03
	},
	{
		x: 1.9,
		y: 0.25,
		width: 1.1,
		height: 0.76
	},
	// PART 2
	{
		x: 3.9,
		y: 0.75,
		width: 0.2,
		height: 0.26
	},
	{
		x: 4.28,
		y: 0.5,
		width: 0.15,
		height: 0.03
	},
	{
		x: 4.6,
		y: 0.5,
		width: 0.15,
		height: 0.03
	},
	{
		x: 4.9,
		y: 0.25,
		width: 1.1,
		height: 0.76
	},
	// PART 3
	{
		x: 6.3,
		y: 0.25,
		width: 0.017,
		height: 0.505
	},
	{
		x: 6.317,
		y: 0.25,
		width: 1.583,
		height: 0.03
	},
	{
		x: 6.317,
		y: 0.725,
		width: 1.3,
		height: 0.03
	},
	{
		x: 7.9,
		y: 0.25,
		width: 1.1,
		height: 0.76
	},
	// PART 4

	// PART 5
]

tutorialPlatforms.forEach(platform => {
	platforms.push({
		x: Math.floor(platform.x * gameWidth),
		y: Math.floor(platform.y * gameHeight),
		width: Math.floor(platform.width * gameWidth),
		height: Math.floor(platform.height * gameHeight),
	})
})

// Items array
const items = [];
// coin items

const projectiles = [];

// Enemies Array
// const enemies = [];
// emeny items
const tutorialEnemies = [
	{
		x: gameWidth * 3.5,
		y: gameHeight - playerSize,
		width: playerSize,
		height: playerSize,
		speed: 3,
		alive: true
	},
	{
		x: gameWidth * 4.2,
		y: gameHeight - playerSize,
		width: playerSize,
		height: playerSize,
		speed: 3,
		alive: true
	},
	{
		x: gameWidth * 4.5,
		y: gameHeight - playerSize,
		width: playerSize,
		height: playerSize,
		speed: 3,
		alive: true
	},
	{
		x: gameWidth * 4.8,
		y: gameHeight - playerSize,
		width: playerSize,
		height: playerSize,
		speed: 3,
		alive: true
	},
]

const enemies = [...tutorialEnemies];

const tutorialArrows = [
	// PART 1
	{
		x: 2,
		y: 0.05,
		height: 0.15,
		color: {
			light: '#12B4E9',
			dark: 'darkred'
		}
	},
	{
		x: 1.96,
		y: 0.05,
		height: 0.15,
		color: {
			light: '#12B4E9',
			dark: 'darkred'
		}
	},
	{
		x: 1.92,
		y: 0.05,
		height: 0.15,
		color: {
			light: '#12B4E9',
			dark: 'darkred'
		}
	},
	// PART 2
	{
		x: 2.95,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'red',
			dark: 'darkred'
		}
	},
	{
		x: 2.91,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'red',
			dark: 'darkred'
		}
	},
	{
		x: 2.87,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'red',
			dark: 'darkred'
		}
	},
	{
		x: 5,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'red',
			dark: 'darkred'
		}
	},
	{
		x: 4.96,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'red',
			dark: 'darkred'
		}
	},
	{
		x: 4.92,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'red',
			dark: 'darkred'
		}
	},
	// PART 3
	{
		x: 5.95,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'green',
			dark: 'darkred'
		}
	},
	{
		x: 5.91,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'green',
			dark: 'darkred'
		}
	},
	{
		x: 5.87,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'green',
			dark: 'darkred'
		}
	},
	{
		x: 8,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'green',
			dark: 'darkred'
		}
	},
	{
		x: 7.96,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'green',
			dark: 'darkred'
		}
	},
	{
		x: 7.92,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'green',
			dark: 'darkred'
		}
	},
	// PART 4
	{
		x: 11,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'yellow',
			dark: 'darkred'
		}
	},
	{
		x: 10.96,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'yellow',
			dark: 'darkred'
		}
	},
	{
		x: 10.92,
		y: 0.05,
		height: 0.15,
		color: {
			light: 'yellow',
			dark: 'darkred'
		}
	},
]
const arrows = [...tutorialArrows];


// Player object
const player = {
	x: 150,
	y: gameHeight - playerSize,
	width: playerSize,
	height: playerSize,
	speed: walkSpeed,
	acceleration: 0.8,
	jumpSpeed: 12,
	xVelocity: 0,
	yVelocity: 0,
	jumping: false,
	canExtendJump: floatLength,
	grounded: false,
	score: 0,
	alive: true,
	doubleJumps: 0
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
	// S switches gravity
	if (keys[83] && gravSwitch < 0) {
		gravityDirection *= -1;
		gravSwitch = 40;
	}
	gravSwitch--;
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
	player.yVelocity += (gravity * gravityDirection);

	// Clear before drawing
	ctx.clearRect(0, 0, gameWidth, gameHeight);

	// Draw objects in world
	ctx.lineWidth = 2;

	player.grounded = false;
	// Draw coins
	items.forEach(item => {
		let collisionDirection;
		if (item.coin && !item.collected) {
			ctx.strokeStyle = 'yellow';
			ctx.strokeRect(item.x + scrollDistance, item.y, coinSize, coinSize);
			if (coinCheck(player, item)) {
				item.collected = true;
				player.score += 100;
			}
		} else if (item.jumpCoin && !item.collected) {
			ctx.strokeStyle = 'blue';
			ctx.strokeRect(item.x + scrollDistance, item.y, coinSize, coinSize);
			collisionDirection = coinCheck(player, item);
			if (coinCheck(player, item)) {
				item.collected = true;
				player.doubleJumps += 1;
			}
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
		let enemyWallDirection;
		if (enemy.alive) {
			ctx.strokeRect(enemy.x + scrollDistance, enemy.y, playerSize, playerSize);
			enemy.x -= enemy.speed;
			collisionDirection = collisionCheck(player, enemy);
			platforms.forEach(platform => {
				enemyWallDirection = enemyCollision(enemy, platform);
				if (enemyWallDirection === "l" || enemyWallDirection === "r") {
					enemy.speed *= -1;
				}
			})
		}
		if (collisionDirection === "l" || collisionDirection === "r" || collisionDirection === "t") {
			if (player.yVelocity < 2) {
				player.alive = false;
			} else {
				player.yVelocity = -player.yVelocity * 0.5;
				enemy.speed = 0;
				enemy.alive = false;
				player.score += 200;
			}
		} else if (collisionDirection === "b") {
			player.yVelocity = -player.yVelocity * 0.5;
			enemy.speed = 0;
			enemy.alive = false;
			player.score += 200;
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

		if ((collisionDirection === "l" && !keys[39]) || (collisionDirection === "r" && !keys[37])) {
			player.xVelocity = 0;
			player.jumping = false;
		} else if (collisionDirection === "b") {
			if (gravityDirection > 0) {
				player.grounded = true;
				player.jumping = false;
			} else {
				player.yVelocity *= -0.2;
			}
		} else if (collisionDirection === "t") {
			if (gravityDirection < 0) {
				player.grounded = true;
				player.jumping = false;
			} else {
				player.yVelocity *= -0.2;
			}
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
	if ((player.x > scrollBound) && (player.x < (gameWidth / 2))) {
		player.x += player.xVelocity;
	}
	// Else, the player is pushing the screen on the RIGHT bound
	else if (player.x >= (gameWidth / 2)) {
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

	// Score text & level titles below game screen
	bottomText();
}

// Draw score, level title etc.
function bottomText() {
	// Clear last & set color
	ctx.clearRect(0, gameHeight, gameWidth, 300);
	ctx.strokeStyle = '#12B4E9';
	ctx.font = "24px 'Press Start 2P'";

	const levelTitle = levelText();

	// Level title
	ctx.textAlign = 'left';
	ctx.strokeText(levelTitle, 10, gameHeight + 50);

	// Score
	ctx.textAlign = 'right';
	ctx.strokeText(player.score, gameWidth - 10, gameHeight + 50);
	arrows.forEach(arrow => {
		arrowShape(scrollDistance + (gameWidth * arrow.x),
				  (gameHeight * arrow.y),
				  (gameHeight * arrow.height),
				  (arrow.color.light));
	})
}

function arrowShape(offsetX, offsetY, height, arrowColor) {
	ctx.strokeStyle = arrowColor;
	ctx.beginPath();
	ctx.moveTo(0 + offsetX, 0 + offsetY);
	ctx.lineTo((height / 4) + offsetX, (height / 2) + offsetY);
	ctx.lineTo(0 + offsetX, height + offsetY);
	ctx.lineTo((height / 4) + offsetX, height + offsetY);
	ctx.lineTo((height / 2) + offsetX, (height / 2) + offsetY);
	ctx.lineTo((height / 4) + offsetX, 0 + offsetY);
	// ctx.moveTo(plusScrollDistance(0), 0);
	// ctx.lineTo(plusScrollDistance(25), 50);
	// ctx.lineTo(plusScrollDistance(0), 100);
	// ctx.lineTo(plusScrollDistance(25), 100);
	// ctx.lineTo(plusScrollDistance(50), 50);
	// ctx.lineTo(plusScrollDistance(25), 0);
	ctx.closePath();
	ctx.stroke();
}

// rewrite level text (without drawing on ctx)
function levelText() {
	if (-scrollDistance < (gameWidth * 2)) {
		return "1. Platforming"
	} else if (-scrollDistance < (gameWidth * 5)) {
		return "2. Watch Out!"
	} else if (-scrollDistance < (gameWidth * 8)) {
		return "3. Anti Grav"
	} else if (-scrollDistance < (gameWidth * 12)) {
		return "4. The Key"
	} else {
		return "5. HEYOOOO!"
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

function enemyCollision(shapeA, shapeB) {
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
		player.yVelocity = -(player.jumpSpeed * gravityDirection);
	} else if (player.canExtendJump > 0 && (keys[38] || keys[32])) {
		// Allow player to extend jump if soon enough after jump AND they are holding jump key
		player.yVelocity -= (gravity * gravityDirection) / 1.7;
	}
	// else if (player.jumping && player.doubleJumps > 0) {
	// 	player.doubleJumps -= 1;
	// 	player.yVelocity = -player.jumpSpeed;
	// }
}

// Shoot function - activated by D key
function shoot() {
	if (bulletDelay < 0) {
		projectiles.push({
			x: player.x + (player.width / 2) - scrollDistance,
			y: player.y + (player.height / 2) - (coinSize / 2)
		})
		bulletDelay = 30;
	}
}

// Hat function - draw hat after player collects 5 coins
function drawHat() {
	ctx.strokeStyle = 'yellow';
	ctx.strokeRect(player.x, player.y, player.width, player.height / 3);
	ctx.strokeRect(player.x - 5, player.y + (player.height / 3), player.width + 10, 0);
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
	setTimeout(deathAnimation, delayTime);
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