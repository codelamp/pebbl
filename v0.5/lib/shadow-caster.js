/**
 * This shadow caster works on the principal that the shadow entity is set
 * as static. It is then automatically moved to the right location after
 * a raytraced collision is calculated.
 */
class ShadowCaster {
  
  constructor({ shadowCastingEntity, shadowEntity, offsetCallback, shadowRange = 75 }) {
    this.shadowCastingEntity = shadowCastingEntity;
    this.shadowCatchingEntities = { bodies: [] };
    this.shadowEntity = shadowEntity;
    this.shadowRange = shadowRange;
    this.offsetCallback = offsetCallback;
  }
  
  setShadowCatchingEntities(shadowCatchingEntities) {
    this.shadowCatchingEntities = shadowCatchingEntities;
  }
  
  update() {
    const { shadowCastingEntity, shadowCatchingEntities, shadowEntity } = this;
    const pointA = { x: shadowCastingEntity.position.x, y: shadowCastingEntity.position.y - 200 };
    const pointB = { x: shadowCastingEntity.position.x, y: shadowCastingEntity.position.y - 50 };
    const pointC = { x: shadowCastingEntity.position.x, y: shadowCastingEntity.position.y + 50 };
    const pointD = { x: shadowCastingEntity.position.x, y: shadowCastingEntity.position.y + 200 };
    const shadowIntersections1 = raycast(shadowCatchingEntities.bodies, pointA, pointB);
    const shadowIntersections2 = raycast(shadowCatchingEntities.bodies, pointB, pointC);
    const shadowIntersections3 = raycast(shadowCatchingEntities.bodies, pointC, pointD);
    const shadowIntersections = [...shadowIntersections1, ...shadowIntersections2, ...shadowIntersections3];
    const { offsetCallback } = this;
    const [shadowCaught] = shadowIntersections
      // because we start scanning before our real position (don't ask) we need
      // to filter out any collisions that actually occur before our start
      .filter((a) => a.point.y >= shadowCastingEntity.position.y)
      // as we always raycasting downwards, we don't need to diff against start
      .sort((a, b) => {
        if (a.point.y > b.point.y) return 1;
        if (a.point.y < b.point.y) return -1;
        return 0;
      });

    if (!shadowEntity.render.sprite.originalMeta) {
      shadowEntity.render.sprite.originalMeta = {
        xScale: shadowEntity.render.sprite.xScale || 1,
        yScale: shadowEntity.render.sprite.yScale || 1,
        xOffset: shadowEntity.render.sprite.xOffset || 0,
        yOffset: shadowEntity.render.sprite.yOffset || 0
      };
    }

    if (shadowCaught) {
      const dy = shadowCaught.point.y - shadowCastingEntity.position.y;
      const dyp = Math.min(1 / this.shadowRange * dy, 1);
      const idyp = Math.max(1 - dyp, 0);
      const paddingIntoCollisionEntity = 2;
      const shadowPoint = {
        x: shadowCastingEntity.position.x,
        y: shadowCastingEntity.position.y + dy + paddingIntoCollisionEntity
      };
      Body.setPosition(shadowEntity, shadowPoint);
      
      const ninetyRadians = Math.PI / 2;
      const shadowAngle = shadowCaught.normal.direction + ninetyRadians;
      const shadowAngleBound = Math.min(Math.max(shadowAngle, -ninetyRadians), ninetyRadians);
      const shadowAngleNorm = 1 - (1 / ninetyRadians * Math.abs(shadowAngleBound));
      Body.setAngle(shadowEntity, shadowAngle);

      const lastOpacity = shadowEntity.render.opacity;
      const newOpacity = 0.3 * idyp * shadowAngleNorm;
      let diffOpacity = newOpacity - lastOpacity;
      if (diffOpacity > 0.05) {
        diffOpacity = 0.05;
      }
      if (diffOpacity < -0.05) {
        diffOpacity = -0.05;
      }

      shadowEntity.render.opacity = lastOpacity + diffOpacity;
  
      const { originalMeta } = shadowEntity.render.sprite;
      const lastScaleX = shadowEntity.render.sprite.xScale;
      const lastScaleY = shadowEntity.render.sprite.yScale;
      const newScaleX = originalMeta.xScale * idyp;
      const newScaleY = originalMeta.yScale * idyp;
      let diffScaleX = newScaleX - lastScaleX;
      let diffScaleY = newScaleY - lastScaleY; 
      if (diffScaleX > 0.05) {
        diffScaleX = 0.05;
      }
      if (diffScaleX < -0.05) {
        diffScaleX = -0.05;
      }
      if (diffScaleY > 0.05) {
        diffScaleY = 0.05;
      }
      if (diffScaleY < -0.05) {
        diffScaleY = -0.05;
      }
      
      shadowEntity.render.sprite.xScale = lastScaleX + diffScaleX;
      shadowEntity.render.sprite.yScale = lastScaleY + diffScaleY;

      if (keysPressed.actionX && shadowCastingEntity.isPlayer) {
        console.log(shadowAngleNorm);
      }

      if (offsetCallback) {
        offsetCallback(dyp);
      }
    }
    
  }
  
}