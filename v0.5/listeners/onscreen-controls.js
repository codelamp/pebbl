/**
 * The onscreen controls actually cheat and control things by abusing the
 * exposed keyboard object.
 */
function applyOnscreenControls() {
  const onEnd = (e) => {
    keysPressed.up = false;
    keysPressed.down = false;
    keysPressed.right = false;
    keysPressed.left = false;
  };
  const onMove = (e, data) => {
    keysPressed.up = false;
    keysPressed.down = false;
    keysPressed.right = false;
    keysPressed.left = false;
  
    if (!data.direction) return;
    if (data.distance < 10) {
      return;
    }

    var d = data.angle.degree;
    if ((d > (360 - 65) && d <= 360) || ((d >= 0) && d <= (0 + 65))) {
      keysPressed.right = true;
    }
    if (d > (90 - 65) && d <= (90 + 65)) {
      keysPressed.up = true;
    }
    if (d > (180 - 65) && d <= (180 + 65)) {
      keysPressed.left = true;
    }
    if (d > (270 - 65) && d <= (270 + 65)) {
      keysPressed.down = data.distance > 40;
    }

    /*
    keysPressed.right = data.direction.angle === 'right' && data.distance > 20;
    keysPressed.left = data.direction.angle === 'left' && data.distance > 20;
    keysPressed.down = data.direction.angle === 'down' && data.distance > 40;
    keysPressed.up = data.direction.angle === 'up' && data.distance > 40;
    */
  };

  const joy = nipplejs.create({
    zone: scene.container,
    //mode: 'semi',
    mode: 'dynamic',
    catchDistance: 150,
    color: 'white',
    multitouch: true
  });

  joy.on('end', onEnd);
  joy.on('move', onMove);
  
  return () => {
    // @TODO how to destroy/remove joy?
    joy.off('end', onEnd);
    joy.off('move', onMove);
  };
}