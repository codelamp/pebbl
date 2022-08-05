const pebbleConfigs = {
  pebble1: {
    scale: 1,
    polygon: [
     
       /*
      [218.000,1.000],
      [316.000,17.000],
      [333.999,23.000],
      [353.000,37.000],
      [384.999,63.999],
      [414.000,161.000],
      [391.999,215.000],
      [351.000,274.999],
      [332.999,285.999],
      [297.000,306.000],
      [254.000,307.999],
      [230.999,308.999],
      [162.000,291.999],
      [106.000,274.999],
      [12.999,190.999],
      [3.000,118.000],
      [12.999,83.000],
      [134.999,7.000],
      [187.999,2.999]//,
      //[218.000,1.000]
      */
      
      [29.000,0.000],[12.999,0.000],[5.000,2.999],[1.000,6.999],[0.000,11.999],[1.000,17.000],[5.000,22.000],[10.999,26.000],[20.999,28.000],[29.999,28.000],[35.999,25.000],[42.000,21.000],[44.999,14.000],[43.999,7.999],[37.999,2.999]
      /*
      [29.000,0.000],[12.999,0.000],[5.000,2.999],[1.000,6.999],[0.000,11.999],
      [1.000,17.000],[5.000,22.000],[10.999,26.000],[17.000,20.000],[15.000,27.000],
      [29.999,28.000],[35.999,25.000],[42.000,21.000],[44.999,14.000],[43.999,7.999],
      [37.999,2.999],[29.000,0.000]
      */
    ],
    sprite: {
      texture: './assets/pebble-a.png',
      xOffset: 0.1,
      yOffset: 0.18,
    }
  }
};

class FloatingPebble {
  
  constructor({ type = 'pebble1', x, y } = {}) {
    const pebbleConfig = pebbleConfigs[type];
    let vxs = pebbleConfig.polygon.map(([x, y]) => ({ x, y }));

    console.log(Vertices.isConvex(vxs));

    this.collisionEntity = Matter.Bodies.fromVertices(x, y, vxs, {
      restitution: 0,
      friction: 1,
      isStatic: true,
      render: {
        fillStyle: 'rgba(0,0,0,0)',
      }
    });
    
    //this.collisionEntity = this.collisionEntity.parts[0];

    console.log(this.collisionEntity);

    Body.scale(this.collisionEntity, pebbleConfig.scale, pebbleConfig.scale);

    this.entity = Bodies.rectangle(x, y, 1, 1, {
      restitution: 0,
      friction: 1,
      isStatic: true,
      render: {
        sprite: {
          ...pebbleConfig.sprite,
          xScale: pebbleConfig.scale,
          yScale: pebbleConfig.scale,
          xOffset: -0.03,
          yOffset: -0.1
        }
      }
    });

    this.entity.isPreventedFromRotating = true;
    this.shadowEntity = this._createShadowEntity({ x, y });
  }
  
  _createShadowEntity() {
    const shadowEntity = Bodies.circle(this.entity.position.x, this.entity.position.y + 84, 5, {
      isStatic: true,
      render: {
        strokeStyle: '#ffffff',
        opacity: 0.15,
        sprite: {
          texture: './assets/round-shadow.png',
          xOffset: 0.05,
          xScale: 0.3,
          yScale: 0.3
        }
      }
    });

    shadowEntity.collisionFilter = {
      group: -1,
      category: 2,
      mask: 0
    };
    shadowEntity.isPreventedFromRotating = true;
    shadowEntity.localGravity = { x: 0, y: 0, scale: 0 };
    Body.setInertia(shadowEntity, Infinity);
    
    return shadowEntity;
  }
  
  update() {
    
  }
  
  getEntities() {
    return [this.shadowEntity, this.entity, this.collisionEntity];
  }
}