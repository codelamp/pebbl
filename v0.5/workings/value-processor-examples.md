      var ExtendRight = new ValueProcessor({
        value: 0,
        target: 0,
        easeFn: easeOutBounce,
        meta: {
          body: player.entity
        }
      });

      ExtendRight.onchange.add((vp) => {
        var body = vp.meta.body;
        var value = vp.value;
        var lastValue = vp.meta.lastValue;
        var lastAngle = body.angle;
  
        // because the scale is relative, we need to convert our tween to a diff
        var diffValue = lastValue !== undefined ? value - lastValue : value;
  
        // we must zero angle otherwise scale distorts
        Body.setAngle(vp.meta.body, 0);
        // apply our horizontal scale + tween
        Body.scale(vp.meta.body, 1 + diffValue, 1);
  
        body.render.sprite.xScale = ((body.bounds.max.x - body.bounds.min.x) / 100) * 3.5;
        body.render.sprite.yScale = ((body.bounds.max.y - body.bounds.min.y) / 100) * 3.5;
  
        // set back the correct angle
        Body.setAngle(vp.meta.body, lastAngle);
  
        vp.meta.lastValue = value;
        scaleApplied = 1 + diffValue;
      });

      var ScaleUp = new ValueProcessor({
        value: 0,
        target: 0,
        easeFn: easeOutQuad,
        meta: {
          body: player.entity,
        }
      });

      ScaleUp.onchange.add((vp) => {
        var body = vp.meta.body;
        var value = vp.value;
        var valueStart = vp.valueStart;
        var lastValue = vp.meta.lastValue;
        var lastAngle = body.angle;
  
        // because the scale is relative, we need to convert our tween to a diff
        var diffValue = lastValue !== undefined
          ? (value - valueStart) - (lastValue - valueStart)
          : (value - valueStart);
  
        // we must zero angle otherwise scale distorts
        Body.setAngle(vp.meta.body, 0);
        // apply our horizontal scale + tween
        Body.scale(body, 1 + diffValue, 1 + diffValue);
  
        body.render.sprite.xScale = ((body.bounds.max.x - body.bounds.min.x) / 100) * 3.5;
        body.render.sprite.yScale = ((body.bounds.max.y - body.bounds.min.y) / 100) * 3.5;
  
        // set back the correct angle
        Body.setAngle(vp.meta.body, lastAngle);
  
        vp.meta.lastValue = value;
      });

      var LevitateFloatingPebble = new ValueProcessor({
        value: 0,
        target: 0,
        easeFn: easeOutQuad,
        meta: {
          body: floatingPebble,
          angle: 180,
          bodies
        }
      });

      LevitateFloatingPebble.onchange.add((vp) => {
        var body = vp.meta.body;
        var angle = vp.meta.angle;
        var bodies = vp.meta.bodies;
      });