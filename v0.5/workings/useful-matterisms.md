    //Body.setVelocity(player, { x: direction * 2 * scaleApplied, y: -2 });
    //Body.applyForce(player, { x:1, y:0 })
    //directionTick = 8;
    //Body.translate(player, { x: direction * 4 * scaleApplied, y: 0 });
    //Body.setAngularVelocity(player, 0.07 * direction);
    //Body.applyForce(player, { x:0, y:0 }, { x: direction * 0.0001, y:0 })
    //Body.setAngularVelocity(player, 0);
    //Body.setAngle(player, 0);
    //Body.setVelocity(player, { x: direction * 2 * scaleApplied, y: 0 });
    //Body.translate(player, { x: direction * 4 * scaleApplied, y: 0 });
    //Body.setAngularVelocity(player, 0.07 * direction);
    
    
    
    /*
    Events.on(engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;
     
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];

            if (pair.bodyA === collider) {
                pair.bodyB.render.strokeStyle = colorB;
            } else if (pair.bodyB === collider) {
                pair.bodyA.render.strokeStyle = colorB;
            }
        }
    });
    */

    Events.on(engine.world, 'afterAdd', function(a) {
      console.log('-- added', a);
    });