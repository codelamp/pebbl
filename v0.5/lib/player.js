class PlayerEntity {
  
  constructor() {
    this.entity = Bodies.rectangle(400, 550, 8, 12, {
      restitution: 0.4,
      friction: 1,
      render: {
        strokeStyle: '#ffffff',
        sprite: {
          texture: './assets/bean-circle.png',
          xScale: 0.07 * 1,
          yScale: 0.1 * 1
        }
      }
    });
    this.entity.isPreventedFromRotating = true;
    this.entity.isPlayer = true;
    Body.setInertia(this.entity, Infinity); // prevent body from rotation forces
    
    this.shadowEntity = this._createShadowEntity();
    
    this.shadowCaster = new ShadowCaster({
      shadowCastingEntity: this.entity,
      shadowEntity: this.shadowEntity,
      _offsetCallback: (shadowPercentage) => {
        const { originalMeta } = this.shadowEntity.render.sprite;

        this.shadowEntity.render.sprite.xOffset = originalMeta.xOffset + ((1 - shadowPercentage) * 5);
      }
    });
  }
  
  _createShadowEntity() {
    const shadowEntity = Bodies.circle(600, 400, 5, {
      isStatic: true,
      density: 5,
      restitution: 0,
      inertia: Infinity,
      timeScale: 0.5,
      friction: 1,
      render: {
        strokeStyle: '#ffffff',
        opacity: 0.25,
        sprite: {
          texture: './assets/round-shadow.png',
          xOffset: 0.25,
          //yOffset: -0.7,
          xScale: 0.1 * 1,
          yScale: 0.15 * 1
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
  
  activateJumpAbility() {
    function jumpAllowedListener(event) {
      var pairs = event.pairs;

      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];
        if (pair.bodyB === player.entity.parts[0]) {
          jumpAllowed = (
            pair.collision.normal.y > 0 && 
            Math.abs(pair.collision.normal.y) > (Math.abs(pair.collision.normal.x)/3)
          );
        }
        else if (pair.bodyA === player.entity.parts[0]) {
          jumpAllowed = (
            pair.collision.normal.y < 0 && 
            Math.abs(pair.collision.normal.y) > (Math.abs(pair.collision.normal.x)/3)
          );
        }
      }
    }
    
    Events.on(engine, 'collisionStart', jumpAllowedListener);
    return () => Events.off(engine, 'collisionStart', jumpAllowedListener);
  }
  
  update() {
    this.shadowCaster.update();
  }
  
}