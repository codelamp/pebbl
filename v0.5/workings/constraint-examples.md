      /*
      var floatingPebbleToLevitationSensorA = Constraint.create({
          bodyA: floatingPebble,
          pointA: {
            x: 40,
            y: 0
          },
          pointB: {
            x: 0,
            y: 0
          },
          bodyB: levitationSensorA,
          stiffness: 1,
          render: {
              visible: true
          }
      });
      */
      /*
      var floatingPebbleToLevitationSensorB = Constraint.create({
          bodyA: floatingPebble,
          pointA: {
            x: -40,
            y: 0
          },
          pointB: {
            x: 0,
            y: 0
          },
          bodyB: levitationSensorB,
          stiffness: 1,
          render: {
              visible: true
          }
      });
      var floatingPebbleToLevitationSensorC = Constraint.create({
          bodyA: levitationSensorA,
          pointA: {
            x: 0,
            y: 0
          },
          pointB: {
            x: 0,
            y: 0
          },
          bodyB: levitationSensorB,
          stiffness: 1,
          render: {
              visible: true
          }
      });
      */
      /*
      var FloatingPebble = Composite.create({
        bodies: [levitationSensorA, levitationSensorB, floatingPebble],
        constraints: [
          floatingPebbleToLevitationSensorA,
          floatingPebbleToLevitationSensorB,
          floatingPebbleToLevitationSensorC,
        ]
      });
      */
        /*
      var FloatingPebble = Body.create({
        parts: [levitationSensorA, levitationSensorB, floatingPebble],
        //friction: 0, //0.001,
      });*/
      /*
      var floatingPebble = Bodies.rectangle(450, 50, 80, 80);
      var boxC = Bodies.rectangle(450, 10, 50, 50);
      */