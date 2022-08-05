/**
 * By default we turn gravity off and apply it on a per-update basis.
 */
function applyBespokeGravityListener() {
  const listener = () => {
    for (const body of bodies) {
      if (body.isFloating) {
        continue;
      }

      if (body.isPreventedFromRotating) {
        Matter.Body.setAngularVelocity(player.entity, 0);
        Matter.Body.setAngle(player.entity, 0);
      }

      if (body.localGravity) {
        body.force.y += body.mass * body.localGravity.y * body.localGravity.scale;
        body.force.x += body.mass * body.localGravity.x * body.localGravity.scale;        
      }
      else {
        body.force.y += body.mass * originalGravity.y * originalGravity.scale;
        body.force.x += body.mass * originalGravity.x * originalGravity.scale;
      }
    }
  };

  Events.on(engine, 'beforeUpdate', listener);
  return () => Events.off(engine, 'beforeUpdate', listener);
}