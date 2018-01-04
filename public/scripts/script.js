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
const jumpSpeed = 22;
let onGround = false;
let lrUp = true;

function gravity() {
	if (!onGround) {
		manPosition.yVelocity += gravitySpeed;
	}
}

function hitTest() {
	//console.log(man.offsetTop + man.offsetHeight, ground.offsetTop);
	if (man.offsetTop + man.offsetHeight <= ground.offsetTop) {
		onGround = false;
	} else {
		onGround = true;
		manPosition.yVelocity = 0;
		if (lrUp) {
			manPosition.xVelocity = 0;
		}
		manPosition.y = ground.offsetTop - man.offsetHeight + 1;
	}
}

function moveMan() {
	gravity();
	manPosition.x += manPosition.xVelocity;
	manPosition.y += manPosition.yVelocity;
	man.style.left = `${manPosition.x}px`;
	man.style.top = `${manPosition.y}px`;
	hitTest();
}

function handleKeyDown(e) {
	// if (e.key === 'ArrowDown') {
	// 	manPosition.y += speed;
	// 	moveMan();
	// } else if (e.key === 'ArrowUp') {
	// 	manPosition.y -= speed;
	// 	moveMan();
	// } else 
	if (e.key === 'ArrowLeft') {
		manPosition.xVelocity = -speed;
		lrUp = false;
	} else if (e.key === 'ArrowRight') {
		manPosition.xVelocity = speed;
		lrUp = false;
	} else if (e.key === ' ') {
		if (onGround) {
			manPosition.yVelocity = -jumpSpeed;
		}
	}
}
function handleKeyUp(e) {
	if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
		lrUp = true;
	}
}

setInterval(moveMan, 20);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);