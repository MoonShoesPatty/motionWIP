const ground = document.querySelector('.ground');
const man = document.querySelector('.man');

const manPosition = {
	x: 0,
	y: 0,
	xVelocity: 0,
	yVelocity: 0
};

const speed = 10;
const gravitySpeed = 1;
const jumpSpeed = 5;
let onGround = false;

function gravity() {
	if (!onGround) {
		manPosition.yVelocity += gravitySpeed;
	}
}

function hitTest() {
	console.log(man.offsetTop + man.offsetHeight, ground.offsetTop);
	if (man.offsetTop + man.offsetHeight <= ground.offsetTop) {
		onGround = false;
	} else {
		onGround = true;
		manPosition.yVelocity = 0;
		manPosition.y = 0;
	}
}

function moveMan() {
	hitTest();
	gravity();
	manPosition.x += manPosition.xVelocity;
	manPosition.y += manPosition.yVelocity;
	man.style.left = `${manPosition.x}px`;
	man.style.top = `${manPosition.y}px`;
}

function handleKeyDown(e) {
	console.log(e);
	// if (e.key === 'ArrowDown') {
	// 	manPosition.y += speed;
	// 	moveMan();
	// } else if (e.key === 'ArrowUp') {
	// 	manPosition.y -= speed;
	// 	moveMan();
	// } else 
	if (e.key === 'ArrowLeft') {
		manPosition.xVelocity = -speed;
	} else if (e.key === 'ArrowRight') {
		manPosition.xVelocity = speed;
	} else if (e.key === ' ') {
		manPosition.yVelocity = -jumpSpeed;
		console.log("l'espace");
	}
}
function handleKeyUp(e) {
	//console.log('up', e)
	manPosition.xVelocity = 0;
}

setInterval(moveMan, 20);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);