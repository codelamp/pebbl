/**
 * Our viewport is represented by an invisible rectangle entity on the scene.
 * This allows us to peform collisions against it. Once outside of that region
 * the player triggers the viewport to retarget. This keeps the player in the
 * viewport and the visible part of the scene.
 */
function applyTrackingViewport() {
  const listener = () => {
    const isPlayerOutsideOfViewport = (
      player.entity.position.x > viewport.entity.bounds.max.x ||
      player.entity.position.x < viewport.entity.bounds.min.x
    );
  
    // @TODO vertical panning (less likely needed)
    if (isPlayerOutsideOfViewport && !viewport.horizontalPanProcessor.hasMoreTicks()) {
      const hsw = (viewport.entity.bounds.max.x - viewport.entity.bounds.min.x) / 2;
      const viewportRight = player.entity.position.x + hsw;
      const viewportLeft = player.entity.position.x - hsw;
      
      let px = player.entity.position.x;
      
      if (viewportRight > scene.width) {
        px = scene.width - hsw;
      }
      if (viewportLeft < 0) {
        px = hsw;
      }
      
      viewport.horizontalPanProcessor.setTarget(px);
    }
    
    if (viewport.horizontalPanProcessor.hasMoreTicks()) {
      viewport.horizontalPanProcessor.tick();
    }
    if (viewport.verticalPanProcessor.hasMoreTicks()) {
      viewport.verticalPanProcessor.tick();
    }
    if (viewport.verticalShakeProcessor.hasMoreTicks()) {
      viewport.verticalShakeProcessor.tick();
    }
  };

  Events.on(engine, 'afterUpdate', listener);
  return () => Events.off(engine, 'afterUpdate', listener);
}