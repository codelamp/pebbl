const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Events = Matter.Events;
const Body = Matter.Body;
const Bounds = Matter.Bounds;
const Bodies = Matter.Bodies;
const Common = Matter.Common;
const Query = Matter.Query;
const Composite = Matter.Composite;
const Constraint = Matter.Constraint;
const Vertices = Matter.Vertices;
const Vector = Matter.Vector;
const Axes = Matter.Axes;
const Svg = Matter.Svg;
const engine = Engine.create();
const runner = Runner.create();
const originalGravity = { ...engine.gravity };

engine.gravity.x = 0;
engine.gravity.y = 0;

const isMobile = navigator.userAgent.indexOf("Mobile") > 0;

engine.timing.timeScale = isMobile ? 0.85 : 1;
originalGravity.y = isMobile ? originalGravity.y * 0.5 : originalGravity.y;
const jumpConfig = {
  repeat: isMobile ? 5 : 5
};

const interop = {
  set gravity(v) {
    originalGravity.y = v;
  },
  get gravity() {
    return originalGravity.y;
  },
  set timeScale(v) {
    engine.timing.timeScale = v;
  },
  get timeScale() {
    return engine.timing.timeScale;
  },
  set jumpRepeat(v) {
    jumpConfig.repeat = v;
  },
  get jumpRepeat() {
    return jumpConfig.repeat;
  }
}

const scene = new MountainScene();
const viewport = new ViewportHandler();
const render = Render.create({
    element: scene.container,
    engine: engine,
    options: {
      width: viewport.width,
      height: viewport.height,
      showAngleIndicator: false,
      wireframes: false
    }
});

var floatingPebble = Bodies.rectangle(600, 100, 70, 60, {
  density: 5,
  restitution: 0,
  inertia: Infinity,
  timeScale: 0.5,
  friction: 1,
  render: {
    strokeStyle: '#ffffff',
    sprite: {
      texture: './assets/pebble-a.png',
      xScale: 1,
      yScale: 1
    }
  }
});
floatingPebble.isPreventedFromRotating = true;
floatingPebble.localGravity = { x: 0, y: 0.5, scale: 0.001 };
Body.scale(floatingPebble, 0.5, 0.5);
Body.setInertia(floatingPebble, Infinity);

var floatingPebbleShadow = Bodies.circle(600, 400, 5, {
  isStatic: true,
  density: 5,
  restitution: 0,
  inertia: Infinity,
  timeScale: 0.5,
  friction: 1,
  render: {
    strokeStyle: '#ffffff',
    opacity: 0,
    sprite: {
      texture: './assets/round-shadow.png',
      xScale: 0.35,
      yScale: 0.5
    }
  }
});
floatingPebbleShadow.collisionFilter = {
  group: -1,
  category: 2,
  mask: 0
};
floatingPebbleShadow.isPreventedFromRotating = true;
floatingPebbleShadow.localGravity = { x: 0, y: 0, scale: 0 };
Body.setInertia(floatingPebbleShadow, Infinity);

var floatingPebble2 = Bodies.rectangle(700, 100, 70, 60, {
  density: 5,
  restitution: 0,
  inertia: Infinity,
  timeScale: 0.5,
  friction: 1,
  render: {
    strokeStyle: '#ffffff',
    sprite: {
      texture: './assets/pebble-b.png',
      xScale: 1,
      yScale: 1
    }
  }
});
floatingPebble2.isPreventedFromRotating = true;
floatingPebble2.localGravity = { x: 0, y: 0.5, scale: 0.001 };
Body.scale(floatingPebble2, 0.5, 0.5);
Body.setInertia(floatingPebble2, Infinity);

var floatingPebble2Shadow = Bodies.circle(600, 400, 5, {
  isStatic: true,
  density: 5,
  restitution: 0,
  inertia: Infinity,
  timeScale: 0.5,
  friction: 1,
  render: {
    strokeStyle: '#ffffff',
    opacity: 0,
    sprite: {
      texture: './assets/round-shadow.png',
      xScale: 0.35,
      yScale: 0.5
    }
  }
});
floatingPebble2Shadow.collisionFilter = {
  group: -1,
  category: 2,
  mask: 0
};
floatingPebble2Shadow.isPreventedFromRotating = true;
floatingPebble2Shadow.localGravity = { x: 0, y: 0, scale: 0 };
Body.setInertia(floatingPebble2Shadow, Infinity);

var ground = Bodies.rectangle(400, 610, 810, 60, {
  isStatic: true,
  label: 'ground',
  render: {
    strokeStyle: 'rgba(0,0,0,0)',
    fillStyle: 'rgba(0,0,0,0)',
    lineWidth: 1
  }
});

var colliderRight = Bodies.rectangle(scene.width, 305, 50, 550, {
  isStatic: true,
  label: 'wallRight',
  render: {
    strokeStyle: 'rgba(0,0,0,0)',
    fillStyle: 'rgba(0,0,0,0)',
    lineWidth: 1
  }
});

var colliderLeft = Bodies.rectangle(0, 305, 50, 550, {
  isStatic: true,
  label: 'wallLeft',
  render: {
    strokeStyle: 'rgba(0,0,0,0)',
    fillStyle: 'rgba(0,0,0,0)',
    lineWidth: 1
  }
});

var colliderTop = Bodies.rectangle(scene.width/2, 0, scene.width, 60, {
  isStatic: true,
  label: 'wallTop',
  render: {
    strokeStyle: 'rgba(0,0,0,0)',
    fillStyle: 'rgba(0,0,0,0)',
    lineWidth: 1
  }
});

var colliderFloor = Bodies.circle(scene.width/2, 12000, 12000 - 500, {
  density: 1,
  restitution: 0,
  friction: 1,
  angle: 0,
  inertia: Infinity,
  isStatic: true,
  render: {
    strokeStyle: 'rgba(0,0,0,0)',
    fillStyle: 'rgba(0,0,0,0)',
  }
}, 100);

var rock1 = Bodies.rectangle(800, 450, 50, 50, {
  density: 5,
  restitution: 0,
  inertia: Infinity,
  timeScale: 0.5,
  friction: 1,
  isStatic: true,
  render: {
    strokeStyle: '#ffffff',
    sprite: {
      texture: './assets/rock-1.png',
      xScale: 0.25,
      yScale: 0.25
    }
  }
});
rock1.isPreventedFromRotating = true;
rock1.isFloating = true;
//Body.scale(rock1, 0.25, 0.25);
Body.setInertia(rock1, Infinity);

const rockPolygon = [
  [56.999,634.999],
  [0.000,428.000],
  [3.999,385.000],
  [86.999,252.999],
  [107.999,250.999],
  [103.000,114.999],
  [115.999,83.000],
  [184.000,44.999],
  [261.999,18.999],
  [382.000,0.000],
  [455.999,2.999],
  [502.000,50.999],
  [536.000,90.000],
  [539.999,336.000],
  [607.000,340.999],
  [699.000,342.999],
  [718.000,368.000],
  [693.000,586.999],
  [704.999,619.000],
  [728.000,645.999],
  [728.000,678.000],
  [366.000,774.000],
  [75.999,742.999],
  [8.000,725.000],
  [8.000,705.000],
  [56.999,634.999]
];

const rock1vxs = rockPolygon.map(([x, y]) => ({ x, y }));

const rock1CollisionEntity = Matter.Bodies.fromVertices(800 + 42, 450 + 23, rock1vxs, {
  restitution: 0,
  friction: 1,
  isStatic: true,
  render: {
    fillStyle: 'rgba(0,0,0,0)'
  }
});

Body.scale(rock1CollisionEntity, 0.25, 0.25);

var tree1 = new StaticTree({ type: 'tree1', x: 1100, y: 430 });
var tree2 = new StaticTree({ type: 'tree2', x: 200, y: 430 });

const floorEntities = Composite.create({
  label: 'floorEntities'
});
Composite.add(floorEntities, colliderFloor);
Composite.add(floorEntities, rock1CollisionEntity);
Composite.add(floorEntities, tree1.collisionEntity);

const floatingPebbleShadowCaster = new ShadowCaster({
  shadowCastingEntity: floatingPebble,
  shadowEntity: floatingPebbleShadow,
  shadowRange: 200
});
const floatingPebble2ShadowCaster = new ShadowCaster({
  shadowCastingEntity: floatingPebble2,
  shadowEntity: floatingPebble2Shadow,
  shadowRange: 200
});

floatingPebbleShadowCaster.setShadowCatchingEntities(floorEntities);
floatingPebble2ShadowCaster.setShadowCatchingEntities(floorEntities);

const player = new PlayerEntity();

player.shadowCaster.setShadowCatchingEntities(floorEntities);

let direction = 0;
let directionTick = 0;
let jump = 0;
let jumping = 0;
let jumpAllowed = false;

const keysPressed = {};

function toKeyName(keyCode) {
  if (keyCode == 38) return 'up';
  if (keyCode == 39) return 'right';
  if (keyCode == 37) return 'left';
  if (keyCode == 40) return 'down';
  if (keyCode == 191) return 'actionX';

  return String(keyCode);
}

document.onkeydown = document.onkeyup = (e) => {
  if (e.which === 82 || e.which === 224) {
    return;
  }
  
  var keyName = toKeyName(e.which);

  e.preventDefault();
  keysPressed[keyName] = e.type === 'keydown';
};

setInterval(() => {
  if (!keysPressed.up && jumping) {
    jumping = 0;
  }
  if (keysPressed.up && jumpAllowed) {
    jumping = jumpConfig.repeat;
    jumpAllowed = false;
  }

  if (keysPressed.right) {
    direction = 1;
  }
  else if (keysPressed.left) {
    direction = -1;
  }
  else {
    direction = 0;
  }
  
  if (jumping > 0) {
    Body.applyForce(
      player.entity,
      player.entity.position,
      { x: direction * 0.0001, y: -0.0003 * jumping }
    )
    jumping--;
  }
  
  if (jumpAllowed && !jumping && direction) {
    Body.applyForce(player.entity, { x:0, y:0 }, { x: direction * 0.0005, y: -0.0008 })
    jumpAllowed = false;
  }
  else if (direction) {
    Body.applyForce(player.entity, { x:0, y:0 }, { x: direction * 0.0001, y: 0 })
  }
}, 50);

var collection = Composite.create({
  label: 'grounditems'
});
Composite.add(collection, player.entity);
Composite.add(collection, ground);

colliderFloor.isGround = true;
ground.isGround = true;
player.entity.isGround = true;

var bodies;
var angle = 180;

Events.on(engine, 'beforeUpdate', function() {
  floatingPebbleShadowCaster.update();
  floatingPebble2ShadowCaster.update();
  player.update();
});

Events.on(engine, 'afterUpdate', function() {
  var startPoint = { x: floatingPebble.position.x, y: floatingPebble.position.y };
  var endPoint = { x: startPoint.x, y: startPoint.y + 90 };
  var collisions = Query.ray(bodies, startPoint, endPoint);
  var depth;
  var isCollided = collisions.some((collision) => {
    if (!collision.body.isGround) return;
    depth = collision.depth;
    return collision.collided;
  });

  if (isCollided) {
    Body.applyForce(floatingPebble, { x:0, y:0 }, { x: 0, y: -11 })
  }
});

var angle2 = 0;
Events.on(engine, 'afterUpdate', function() {
  angle2 += 2;
  if (angle2 > 360) {
    angle2 = angle2 - 360;
  }
  var offset = Math.sin(angle2 * 0.0174533) * 10;
  var startPoint = { x: floatingPebble2.position.x, y: floatingPebble2.position.y };
  var endPoint = { x: startPoint.x, y: startPoint.y + 150 + offset };
  var collisions = Query.ray(bodies, startPoint, endPoint);
  var depth;
  var isCollided = collisions.some((collision) => {
    if (!collision.body.isGround) return;
    depth = collision.depth;
    return collision.collided;
  });

  if (isCollided) {
    Body.applyForce(floatingPebble2, { x:0, y:0 }, { x: 0, y: -depth })
  }
});

/* shake
setTimeout(() => {
  viewport.verticalShakeProcessor.setTargets(
    viewport.height/2 - 14,
    viewport.height/2 + 14,
    viewport.height/2 - 8,
    viewport.height/2 + 5,
    viewport.height/2
  );
}, Math.random() * 1000 + 5000);
*/

var floatingPebbleA = new FloatingPebble({ x: 400, y: 400 });

Composite.add(engine.world, [
  ...scene.getEntities(),
  ...viewport.getEntities(),
  ...tree1.getEntities(),
  ...tree2.getEntities(),
  rock1,
  rock1CollisionEntity,
  floatingPebbleShadow,
  floatingPebble2Shadow,
  floatingPebble,
  floatingPebble2,
  ...floatingPebbleA.getEntities(),
  player.shadowEntity,
  player.entity,
  colliderRight,
  colliderLeft,
  colliderTop,
  ground,
  colliderFloor,
]);

bodies = Composite.allBodies(engine.world);

Render.run(render);
Runner.run(runner, engine);

player.activateJumpAbility();

applyBespokeGravityListener();
applyTrackingViewport();
applyResizeViewport();
applyOnscreenControls();