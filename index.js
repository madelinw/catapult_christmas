"use strict;"

// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Constraint = Matter.Constraint,
    Events = Matter.Events;

var defaultCategory = 0x0001;
var draggableCategory = 0x0002;

// create a Matter.js engine
var engine = Engine.create(document.body);

var pinata = Bodies.rectangle(450, 300, 80, 100, {
    render: { sprite: { texture: './pinata.png' } },
});
pinata.hitsLeft = 3;

var mickey = Bodies.circle(400, 300, 50, {
    render: { sprite: { texture: './mickey.png' } },
    collisionFilter: {
        category: draggableCategory,
    },                           
});
var airplane= Bodies.circle(350, 300, 50, {
    render: { sprite: { texture: './airplane.png' } },
    collisionFilter: {
        category: draggableCategory,
    },                           
});
var santa = Bodies.circle(450, 300, 50, {
    render: { sprite: { texture: './santa.png' } },
    collisionFilter: {
        category: draggableCategory,
    },                           
});


var roof = Bodies.rectangle(400, 0, 810, 60, {isStatic: true});
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var magnifier = Bodies.rectangle(400, 180, 80, 80, { 
    isStatic: true ,
    render: { sprite: { texture: './magnifying.png' } }
});
var left = Bodies.rectangle(0, 0, 60, 1600, {isStatic: true});
var right = Bodies.rectangle(810 , 0, 60, 1600, {isStatic: true});

var anchor = {x: 400, y: 30};
var string =  Constraint.create({ 
    pointA: anchor, 
    bodyB: pinata, 
    stiffness: 0.9, 
    render: { 
        lineWidth: 5, 
        strokeStyle: '#dfa417' 
    } 
});
var mouseConstraint = MouseConstraint.create(engine, {
    collisionFilter: {
        mask: draggableCategory,
    }
});

var rockOptions = { 
    density: 0.004, 
    collisionFilter: {
        category: draggableCategory,
    },                           
    render: { /*sprite: { texture: './img/rock.png' } (*/ } 
};
var     rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
        anchor = { x: 170, y: 450 },
        elastic = Constraint.create({ 
            pointA: anchor, 
            bodyB: rock, 
            stiffness: 0.05, 
            render: { 
                lineWidth: 5, 
                strokeStyle: '#000000' 
            } 
        });

// add all of the bodies to the world
World.add(engine.world, [
    pinata, roof, string, ground, mouseConstraint,
    left, right, rock, elastic
]);

var isFinderGame = false;
function finderGame() {
    mickey.velocity = {x: 2 * Math.random(), y: 2 * Math.random()};
    airplane.velocity = {x: 2 * Math.random(), y: 2 * Math.random()};
    santa.velocity = {x: 2 * Math.random(), y: 2 * Math.random()};
    World.remove(engine.world, [pinata, string, rock, elastic]);
    World.add(engine.world, [mickey, airplane, santa]);
    var i = 0;
    for (i = 0; i < 50; i++) {
        var circle = Bodies.circle(400, 300, Math.random() * 20 + 5);
        circle.velocity = {x: 2 * Math.random(), y: 2 * Math.random()};
        World.add(engine.world, circle);
    }
    setTimeout(function() { 
        showMessage("Drag to magnify!");
        World.add(engine.world, magnifier); 
    }, 1000);
    isFinderGame = true; 
}

function showMessage(message) {
    document.getElementById("message").innerHTML = message;
}

// an example of using collisionStart event on an engine
Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    // change object colours to show those starting a collision
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        if (!isFinderGame && (pair.bodyA == pinata || pair.bodyB == pinata)) {
            var other = pair.bodyA == pinata ? pair.bodyB : pair.bodyA;
            var speed = Math.sqrt(
                other.velocity.x * rock.velocity.x + rock.velocity.y * rock.velocity.y
            );
            if (speed > 0.4 && other.detached) {
                pinata.hitsLeft--;
                if (pinata.hitsLeft <= 0) {
                    finderGame();
                }
            }
        } else if (
            pair.bodyA == mickey && pair.bodyB == magnifier ||
            pair.bodyA == magnifier && pair.bodyB == mickey) {
            showMessage("Hong Kong Disneyland ticket");
        } else if (
            pair.bodyA == airplane && pair.bodyB == magnifier ||
            pair.bodyA == magnifier && pair.bodyB == airplane) {
            showMessage("UA179 to Hong Kong (01/29-02/07)");
        } else if (
            pair.bodyA == santa && pair.bodyB == magnifier ||
            pair.bodyA == magnifier && pair.bodyB == santa) {
            showMessage("Merry christmas!!!");
        }
    }
});

Events.on(engine, 'afterUpdate', function() {
    if (mouseConstraint.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430)) {
        rock.detached = true;
        rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
        World.add(engine.world, rock);
        elastic.bodyB = rock;
    }
});

var renderOptions = engine.render.options;
renderOptions.wireframes = false;
renderOptions.showAngleIndicator = false;

// run the engine
Engine.run(engine);
