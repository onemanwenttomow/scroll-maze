// https://colorhunt.co/palette/42533
// https://greensock.com/scrolltrigger/

var blockWidth = Math.floor(window.innerWidth / 100);

console.log("blockWidth: ", blockWidth);

var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Composites = Matter.Composites, 
    Body = Matter.Body;
    Events = Matter.Events;

var moveBallLeft = false;
var moveBallRight = false;

var gameOver = false;
var gameWon = false;

// create an engine
var engine = Engine.create();

var windowWidth = window.innerWidth;
var pageHeight = document.body.scrollHeight;

var w = 31,
    h = 31;
var dm = new ROT.Map.DividedMaze(w, h);

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        height: h * blockWidth + blockWidth,
        width: w * blockWidth + blockWidth,
        background: "#3f0097",
        wireframes: false,
    },
});

var maze = new Array(w);
for (let x = 0; x < w; x++) {
    maze[x] = new Array(h);
}

function userCallback(x, y, value) {
    // console.log('x, y, value: ',x, y, value);
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        maze[x][y] = 0; // create walls around edges of map
        return;
    }
    maze[x][y] = value === 0 ? 1 : 0;
}

// console.log('maze: ',maze);

dm.create(userCallback);

var objectsToAddToWorld = [];

var wallOptions = {
    render: {
        fillStyle: "#fff",
    },
    isStatic: true,
    label: "wall",
};

var ball = Bodies.circle(blockWidth, blockWidth, blockWidth / 2 - 1, {
    render: {
        fillStyle: "#ffadb9",
    },
    restitution: 0.6,
    label: "ball",
});

objectsToAddToWorld.push(
    Bodies.rectangle(
        blockWidth - blockWidth,
        h * blockWidth - blockWidth,
        blockWidth,
        2000,
        wallOptions
    )
);
objectsToAddToWorld.push(
    Bodies.rectangle(
        w * blockWidth + blockWidth,
        h * blockWidth - blockWidth,
        blockWidth,
        2000,
        wallOptions
    )
);
objectsToAddToWorld.push(
    Bodies.rectangle(0, blockWidth - blockWidth, 2000, blockWidth, wallOptions)
);
console.log("100 - blockWidth: ", blockWidth - blockWidth);
objectsToAddToWorld.push(
    Bodies.rectangle(
        blockWidth - blockWidth,
        h * blockWidth + blockWidth,
        2000,
        blockWidth,
        wallOptions
    )
);
objectsToAddToWorld.push(ball);

// add all of the bodies to the world
World.add(engine.world, objectsToAddToWorld);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

function draw() {
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            if (maze[x][y] === 1) {
                var wall = Bodies.rectangle(
                    x * blockWidth + blockWidth,
                    y * blockWidth + blockWidth,
                    blockWidth,
                    blockWidth,
                    wallOptions
                );
                World.add(engine.world, wall);
            }
        }
    }
}

draw();

// function rotateOnScroll(angle) {
//     Body.rotate(rotatableLedge, angle);
// }

var canvas = document.querySelector("canvas");
var degree = 0;
var gravityX = 0;
var gravityY = 1;
var gravityCheck = 0;

function rotateCanvas(scrollAmount) {
    degree += scrollAmount / 100;
    if (degree > 360) {
        degree -= 360;
    }

    if (degree < -360) {
        degree += 360;
    }
    gravityCheck = Math.floor(degree);
    engine.world.gravity.y = degToYGravity(gravityCheck);
    engine.world.gravity.x = degToXGravity(gravityCheck);
    canvas.style.transform = "translate(-50%, -50%) rotate(" + degree + "deg)";
}

function degToYGravity(deg) {
    deg = Math.abs(deg);
    if (deg >= 0 && deg <= 90) {
        return 1 - deg / 90;
    } else if (deg > 90 && deg <= 180) {
        return 1 + -deg / 90;
    } else if (deg > 180 && deg <= 270) {
        return -(3 - deg / 90);
    } else if (deg > 270 && deg <= 360) {
        return deg / 90 - 3;
    }
}

function degToXGravity(deg) {
    var sign = Math.sign(deg);
    deg = Math.abs(deg);
    if (deg >= 0 && deg <= 90) {
        return (deg / 90) * sign;
    } else if (deg > 90 && deg <= 180) {
        return (2 - deg / 90) * sign;
    } else if (deg > 180 && deg <= 270) {
        return (2 - deg / 90) * sign;
    } else if (deg > 270 && deg <= 360) {
        return (3 - deg / 90) * sign;
    }
}

var goal = Bodies.rectangle(
    blockWidth + blockWidth * Math.floor(w / 2),
    blockWidth + blockWidth * Math.floor(w / 2),
    blockWidth*1.1,
    blockWidth*1.1,
    {
        label: "goal",
        isStatic: true,
        render: {
            fillStyle: "#ffadb9",
        },
    }
);

World.add(engine.world, goal);

ScrollTrigger.create({
    start: "top top",
    end: "bottom 50%+=100px",
    onToggle: (self) => console.log("toggled, isActive:", self.isActive),
    onUpdate: (self) => {
        // console.log(
        //     "progress:",
        //     self.progress.toFixed(3),
        //     "direction:",
        //     self.direction,
        //     "velocity",
        //     self.getVelocity()
        // );
        rotateCanvas(self.getVelocity());
    },
});

document.addEventListener("click", function () {
});

var gameWon = false;

Matter.Events.on(engine, 'collisionStart', function(event) {
    var bodyA = event.pairs[0].bodyA.label;
    var bodyB = event.pairs[0].bodyB.label;
    console.log('collision!');
    console.log('bodyA, bodyB: ',bodyA, bodyB);
    if (bodyA.includes("ball") && bodyB === "goal") {
        console.log("winner!!!")
        gameWon = true;
    }
});

Events.on(engine, 'beforeUpdate', function() {
    if (gameWon) {
        if (engine.world.bodies.filter(body => body.label === 'goal')[0].area > 800000) {
            return;
        }
        console.log("you win :):):)!");
        Body.scale(goal, 1.01, 1.01);
        console.log('engine.world: ',engine.world.bodies.filter(body => body.label === 'goal')[0]);
        return;
    }
});
