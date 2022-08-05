var elm = jQuery('#log');
var log = function(msg){
  elm.html(msg);
};

(function(){
  
  var world, player, shadowCatchers = [], shadowGlobe = [], getNow = function(){ return world.game.time.now; };
  
  /**
   * Create the surrounding world
   */
  world = polycade.create({
    container: 'body',
    layers: {
      speech: '#talkies'
    },
    preload: function(){
      this.game.load.atlas('joystick', 'assets/ui/arcade-joystick.png', 'assets/ui/arcade-joystick.json');
      /// load in visual assets
      this.game.load.image('sky', pebbl.assets['backgrounds.world-a.sky'].graphic);
      this.game.load.image('globe', pebbl.assets['entities.globe-a'].graphic);
      this.game.load.image('mountain', pebbl.assets['backgrounds.world-a.mountain-a'].graphic);
      this.game.load.image('cake', pebbl.assets['entities.cake'].graphic);
      this.game.load.image('plant', pebbl.assets['entities.plant-a'].graphic);
      this.game.load.image('pebble-a', pebbl.assets['entities.pebble-a'].graphic);
      this.game.load.image('pebble-b', pebbl.assets['entities.pebble-b'].graphic);
      this.game.load.image('shadow', pebbl.assets['effects.round-shadow'].graphic);
      /// load in polygon data
      this.game.load.json('cake', pebbl.assets['entities.cake'].ibody);
      this.game.load.json('globe', pebbl.assets['entities.globe-a'].ibody);
      this.game.load.json('plant', pebbl.assets['entities.plant-a'].ibody);
      this.game.load.json('pebble-a', pebbl.assets['entities.pebble-a'].ibody);
      /// load in filters/shaders
      //this.game.load.script('filter', 'assets/filters/Fire.js');
      
    },
    build: function(){
      /// start the simple physics ball rolling
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      /// create the background sky
      this.bg = this.game.add.sprite(0,0, 'sky');
      this.bg.anchor = {x:0.5, y:0};
      this.bg.fixedToCamera = false;
      /// imagination is responsible for calculating complicated but accurate collisions
      this.imagination = imagination.container.create({
        width: this.game.world.bounds.width,
        height: this.game.world.bounds.height
      });
      
      try {
        if ( 'ontouchstart' in document.documentElement ) {
          this.pad = this.game.plugins.add(Phaser.VirtualJoystick);
          this.stick1 = this.pad.addStick(0, 0, 100, 'joystick');
          this.stick1.scale = 0.6;
          this.stick1.alignBottomLeft(48);
          //this.stick2 = this.pad.addStick(0, 0, 100, 'joystick');
          //this.stick2.scale = 0.6;
          //this.stick2.alignBottomRight(48);
          //console.log(this.stick1.alignBottomLeft);
        }
      } catch (ex) {}
      
      /// the globe is the main platform
      this.globe = polycade.adornment.create({
        game: this.game,
        sprite: {
          source: 'globe',
          position: {x:0, y:0},
          anchor: {x:0, y:1}
        },
        body: {
          collideWorldBounds: false,
          immovable: true,
          allowGravity: false
        },
        ibody: {
          container: this.imagination,
          source: 'globe',
          offset: {
            y: 30,
            x: 0
          }
        },
        resize: function(){
          this.position.x = this.game.world.bounds.width / 2 - 2384/2;
          this.position.y = this.game.world.bounds.height - 30;
          this.update();
        }
      });
      
      shadowGlobe = [this.globe];
      /// background adornments
      this.bgMountain = this.game.add.sprite(0,0, 'mountain');
      this.bgMountain.x = 400;
      this.bgMountain.y = 490;
      this.bgMountain.fixedToCamera = false;
      /// hmmm, the cake is a lie.
      this.cake = polycade.adornment.create({
        game: this.game,
        world: world,
        sprite: {
          source: 'cake',
          position: {x:0, y:0},
          anchor: {x:0.5, y:1}
        },
        body: {
          collideWorldBounds: false,
          immovable: true,
          allowGravity: false
        },
        ibody: {
          container: this.imagination,
          source: 'cake',
          offset: {x:1,y:1}
        },
        add: function(){
          this.shadow = this.game.add.sprite(0,0, 'shadow');
          this.shadow.anchor = {x:0.5, y:0.7};
          this.shadow.alpha = 0.3;
          this.shadow.scale.y = 0.2;
          this.shadow.baseAlpha = 0.3;
          this.sprite.bringToTop();
        },
        resize: function(){
          this.position.x = this.game.world.bounds.width * 0.15;
          this.position.y = world.globe.nearestPoint(this.position.x, 0).y;
        }
      });
      
      /// a pebble, a pebble, my kindom for a ....
      this.pebble = polycade.adornment.create({
        game: this.game,
        world: world,
        sprite: {
          source: 'pebble-a',
          position: {x:0, y:0},
          anchor: {x:0.5, y:1}
        },
        body: {
          collideWorldBounds: false,
          immovable: true,
          allowGravity: false
        },
        ibody: {
          container: this.imagination,
          source: 'pebble-a',
          offset: {x:1,y:1}
        },
        add: function(){
          this.shadow = this.game.add.sprite(0,0, 'shadow');
          this.shadow.anchor = {x:0.5, y:0.5};
          this.shadow.alpha = 0.3;
          this.shadow.scale.y = 0.2;
          this.shadow.baseAlpha = 0.3;
          this.sprite.bringToTop();
        },
        resize: function(){
          this.base.x = this.game.world.bounds.width * 0.60;
          this.base.y = world.globe.nearestPoint(this.base.x, 0).y - 60;
          this.position.x = this.base.x;
        },
        update: function(){
          this.vars.floatangle = this.vars.floatangle % 360 + 1;
          this.vars.offy = (Math.sin(this.vars.floatangle * this.vars.PI180) * 30);
          this.position.y = this.base.y - this.vars.offy;
        }
      });
      this.pebble.vars.PI180 = Math.PI/180;
      this.pebble.vars.floatangle = 0;
      this.pebble.base = {x:0, y:0};
      
      /// a pebble, a pebble, my kindom for a ....
      this.pebble2 = polycade.adornment.create({
        game: this.game,
        world: world,
        sprite: {
          source: 'pebble-b',
          position: {x:0, y:0},
          anchor: {x:0.5, y:1}
        },
        body: {
          collideWorldBounds: false,
          immovable: true,
          allowGravity: false
        },
        ibody: {
          container: this.imagination,
          source: 'pebble-a',
          offset: {x:1,y:1}
        },
        add: function(){
          this.shadow = this.game.add.sprite(0,0, 'shadow');
          this.shadow.anchor = {x:0.5, y:0.5};
          this.shadow.alpha = 0.3;
          this.shadow.scale.y = 0.2;
          this.shadow.baseAlpha = 0.3;
          this.sprite.bringToTop();
        },
        resize: function(){
          this.base.x = this.game.world.bounds.width * 0.52;
          this.base.y = world.globe.nearestPoint(this.base.x, 0).y - 150;
          this.position.x = this.base.x;
        },
        update: function(){
          this.vars.floatangle = this.vars.floatangle % 360 + 1;
          this.vars.offy = (Math.cos(this.vars.floatangle * this.vars.PI180) * 40);
          this.position.y = this.base.y - this.vars.offy;
        }
      });
      this.pebble2.vars.PI180 = Math.PI/180;
      this.pebble2.vars.floatangle = 0;
      this.pebble2.base = {x:0, y:0};
      
      /// the plant is actually quite truthful though
      this.plant = polycade.adornment.create({
        game: this.game,
        sprite: {
          source: 'plant',
          position: {x:0, y:0},
          anchor: {x:0.5, y:1}
        },
        body: {
          collideWorldBounds: false,
          immovable: true,
          allowGravity: false
        },
        ibody: {
          container: this.imagination,
          source: 'plant',
          debug: true
        },
        add: function(){
          this.shadow = this.game.add.sprite(0,0, 'shadow');
          this.shadow.anchor = {x:0.4, y:0.5};
          this.shadow.alpha = 0.2;
          this.shadow.scale.x = 0.3;
          this.shadow.scale.y = 0.2;
          this.shadow.baseAlpha = 0.3;
          this.sprite.bringToTop();
        },
        resize: function(){
          this.position.x = this.game.world.bounds.width * 0.85;
          this.position.y = world.globe.nearestPoint(this.position.x, 0).y + 4;
          this.shadow.position.x = this.position.x;
          this.shadow.position.y = this.position.y;
          this.update();
        }
      });
      
      //this.shadows = this.game.add.group();
      //this.shadows.alpha = 0.3;
      //this.shadows.anchor = {x:0, y:0};
      //this.shadows.fixedToCamera = false;
      //this.shadows.blendMode = PIXI.blendModes.HUE;
      //this.shadows.addChild(this.pebble.shadow);
      //this.shadows.addChild(this.pebble2.shadow);
      
      /// add some enhancements to the player @TODO: wrap this up in the player code.
      this.player.shadow = this.game.add.sprite(0,0, 'shadow');
      this.player.shadow.anchor = {x:0.5, y:0.5};
      this.player.shadow.alpha = 0.3;
      this.player.shadow.fixedToCamera = false;
      this.player.shadow.baseAlpha = 0.3;
      //this.shadows.addChild(this.player.shadow);
      //this.player.shadow.scale.setTo(0.1, 0.1);
      this.player.shadow.scale.y = 0.1;
      this.player.addTo( this.game.world );
      this.player.sprite.isPlayer = true;
      this.player.vars.height = player.sprite.height;
      this.player.sprite.fixedToCamera = false;
      this.player.cake = this.cake;
      this.player.plant = this.plant;
      
      /// set up the shadow catchers
      shadowCatchers.push( this.globe );
      shadowCatchers.push( this.plant );
      shadowCatchers.push( this.cake );
      shadowCatchers.push( this.pebble );
      shadowCatchers.push( this.pebble2 );
      
      /// @TODO: if the game world changes size, then we need to update our imagination size too.
      this.on('worldsize', function(){
        this.imagination.setSize(
          this.game.world.bounds.width,
          this.game.world.bounds.height
        );
      });
    },
    
    update: function(){
      this.player.update && this.player.update();
      this.pebble.update && this.pebble.update();
      this.pebble2.update && this.pebble2.update();
      this.layers.speech.css('left', -this.game.camera.x);
    },
    
    resize: function(){
      this.stick1 && this.stick1.alignBottomLeft(48);
      //this.stick2 && this.stick2.alignBottomRight(48);
      this.layers.speech.css('width', this.game.world.bounds.width);
      this.bg.y = this.game.world.bounds.height - 450;
      this.bg.x = this.game.world.bounds.width / 2;
      this.bgMountain.y = this.game.world.bounds.height - 240;
      this.globe.trigger('resize');
      this.pebble.trigger('resize');
      this.pebble2.trigger('resize');
      this.plant.trigger('resize');
      this.cake.trigger('resize');
    }
  });
  /**
   * Create the player character
   */
  player = world.player = polycade.player.create({
    
    position: {
      x: 500,
      y: 5
    },
    
    world: world,
    ///
    build: function(){
      var w = 5, h = 7;
      this.graphics = this.game.add.graphics(0, 0);
      this.graphics.clear();
      this.graphics.beginFill(0x447727, 1);
      this.graphics.drawEllipse(0,0, w,h);
      this.graphics.endFill();
      this.graphics.beginFill(0x5c9c34, 1);
      this.graphics.drawEllipse(w/8,-h/8, w,h*0.9);
      this.graphics.endFill();
      this.graphics.beginFill(0x71c140, 1);
      this.graphics.drawEllipse(w/5,-h/5, w*0.7,h*0.7);
      this.graphics.endFill();
      this.graphics.beginFill(0xa5f769, 1);
      this.graphics.drawEllipse(w/4,-h/4, w*0.5,h*0.5);
      this.graphics.endFill();
      this.graphics.beginFill(0xffffff, 1);
      this.graphics.drawEllipse(w/3,-h/3, w*0.25,h*0.25);
      this.graphics.endFill();
      this.graphics.anchor = {x:0.5, y:1};
      /// because we have no texture, set the dimensions to that of our graphic
      this.sprite.texture.frame.width = this.graphics.width;
      this.sprite.texture.frame.height = this.graphics.height;
      this.sprite.width = this.graphics.width;
      this.sprite.height = this.graphics.height;
      this.sprite.addChild(this.graphics);
      
      //this.speak('Wha...?', 4000, 5000);
      //this.speak('Harumph!', 4000, 20000);
      //this.speak('Bibble..', 4000, 40000);
      //this.speak('Bah!', 4000, 60000);
      
      this.vars.padVelocity = new Phaser.Point(0,0);
      this.vars.move = {
        left: null,
        right: null,
        up: null
      };
      
    },
    /// triggered when the player is added to a container
    add: function(){
      this.world.options.cameraTarget = this;
      this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
      this.sprite.body.collideWorldBounds = true;
      this.sprite.body.gravity.y = 1000;
      this.sprite.body.maxVelocity.y = 800;
      this.sprite.anchor = {x:0.5, y:0.5};
      this.sprite.body.setSize(8, 12, 0, 0);
      this.vars.baseScale = {x:1, y:1};
      this.vars.liveScale = {x:1, y:1};
      this.controls = {
        arrows: this.game.input.keyboard.createCursorKeys(),
        button: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      };
    },
    update: function(){
      
      if ( this.is.on === this.cake ) {
        this.cake.position.y -= 0.5;
      }
      
      /// handle collisions
      //this.game.physics.arcade.collide(this.sprite, platforms);
      this.world.globe.collide(this.sprite);
      this.world.cake.collide(this.sprite);
      this.world.plant.collide(this.sprite);
      this.world.pebble.collide(this.sprite);
      this.world.pebble2.collide(this.sprite);
      
      /// cast shadows
      this.castShadow(0, 1, shadowCatchers);
      this.world.pebble.castShadow(0, 1, shadowGlobe);
      this.world.pebble2.castShadow(0, 1, shadowGlobe);
      this.world.cake.castShadow(0, 1, shadowGlobe);
      
      /// update the is/was status
      this.was.grounded = this.is.grounded;
      this.was.stretching = this.is.stretching;
      this.was.motionless = this.is.motionless;
      this.was.jumping = this.is.jumping;
      this.is.grounded = this.grounded();
      this.is.motionless = this.motionless();
      
      if ( this.world.stick1 && this.world.stick1.isDown ) {
        this.game.physics.arcade.velocityFromRotation(
          this.world.stick1.rotation,
          this.world.stick1.force,
          this.vars.padVelocity
        );
        if ( this.vars.padVelocity.x > 0 ) {
          this.vars.move.left = 0;
          this.vars.move.right = this.vars.padVelocity.x;
          this.velocity.x.stretch(this.vars.move.right);
        }
        else if ( this.vars.padVelocity.x < 0 ) {
          this.vars.move.left = Math.abs(this.vars.padVelocity.x);
          this.vars.move.right = 0;
          this.velocity.x.stretch(this.vars.move.left);
        }
      }
      else if ( this.controls.arrows.left.isDown ) {
        this.vars.move.left = 1;
        this.vars.move.right = 0;
      }
      else if ( this.controls.arrows.right.isDown ) {
        this.vars.move.left = 0;
        this.vars.move.right = 1;
      }
      else if ( this.vars.move.left || this.vars.move.right ) {
        this.vars.move.left = 0;
        this.vars.move.right = 0;
        this.velocity.x.stretch(1);
      }
      
      if ( this.world.stick1 && this.world.stick1.isDown ) {
        if ( this.vars.padVelocity.y > 0 ) {
          this.vars.move.up = 0;
          this.vars.move.down = this.vars.padVelocity.y;
        }
        else if ( this.vars.padVelocity.y < 0 ) {
          this.vars.move.up = Math.abs(this.vars.padVelocity.y);
          this.vars.move.down = 0;
        }
      }
      else if ( this.controls.arrows.up.isDown ) {
        this.vars.move.up = 1;
        this.vars.move.down = 0;
      }
      else if ( this.controls.arrows.down.isDown ) {
        this.vars.move.up = 0;
        this.vars.move.down = 1;
      }
      else {
        this.vars.move.up = 0;
        this.vars.move.down = 0;
      }
      
      /// handle direction controls
      if ( this.controls.button.isDown ) {
        this.api.puff();
      }
      if ( this.vars.move.left ) {
        this.velocity.x.stepDown();
        !this.is.grounded && this.tilt.stepDown();
        if ( this.is.grounded ) {
          this.sprite.body.velocity.y = -100;
          this.vars.bouncedAt = this.game.time.now;
        }
      }
      else if ( this.vars.move.right ) {
        this.velocity.x.stepUp();
        !this.is.grounded && this.tilt.stepUp();
        if ( this.is.grounded ) {
          this.sprite.body.velocity.y = -100;
          this.vars.bouncedAt = this.game.time.now;
        }
      }
      else {
        this.velocity.x.stepZero();
      }
      if ( this.sprite.body.blocked.left || this.sprite.body.blocked.right ) {
        this.velocity.x.zero();
      }
      /// Handle animations?
      if ( this.sprite.deltaY > 0 ) {
        this.is.stretching && this.api.stretchCancel(200);
      }
      if ( this.vars.bouncedAt ) {
        this.vars.bouncedLeeway = (this.game.time.now - this.vars.bouncedAt) < 100;
      }
      if ( this.is.grounded || this.vars.bouncedLeeway ) {
        if ( !this.was.grounded && !this.vars.bouncedLeeway ) {
          !this.is.squishling && this.api.squishle();
        }
        this.velocity.x.stretch(1);
        this.is.jumping = false;
        this.tilt.stepZero(0.05);
        if ( this.vars.move.up > 0.3 ) {
          this.sprite.body.velocity.y = -500;
          this.is.jumping = true;
          this.velocity.x.stretch(1.5);
        }
      }
      else {
        if ( this.sprite.deltaY < -6 ) {
          !this.is.stretching && this.api.stretch();
        }
      }
      if ( this.is.squishling ) {
        this.api.squishleTick();
      }
      this.sprite.rotation = this.tilt.value();
      this.sprite.body.velocity.x = this.velocity.x.value();
      
      if ( this.hasSpeech() && this.is.motionless ) {
        this.updateSpeech();
      }
      
    },
    api: {
      /**
       * Squishle
       */
      squishle: function(){
        this.sprite.scale.x = this.vars.baseScale.x * 1.7;
        this.sprite.scale.y = this.vars.baseScale.y * 0.4;
        this.vars.liveScale.x = this.vars.baseScale.x;
        this.vars.liveScale.y = this.vars.baseScale.y;
        this.tweens.squishle = this.game.add.tween(this.sprite.scale);
        this.tweens.squishle.to(this.vars.liveScale, 400, Phaser.Easing.Cubic.Out, true);
        this.tweens.squishle.onComplete.add(this.api.squishleComplete);
        this.is.squishling = true;
      },
      squishleTick: function(){
        //this.sprite.anchor.y = 0.8 - ((this.sprite.scale.y - 0.5) * 2) * 0.3;
      },
      squishleCancel: function(){
        this.tweens.squishle.stop(true);
      },
      squishleComplete: function(){
        this.sprite.scale.x = this.vars.baseScale.x;
        this.sprite.scale.y = this.vars.baseScale.y;
        this.sprite.anchor.y = 0.5;
        this.is.squishling = false;
      },
      /**
       * Stretch
       */
      stretch: function(){
        this.vars.stretchStarted = this.game.time.now;
        this.sprite.scale.y = this.vars.baseScale.y * 2;
        this.vars.liveScale.x = this.vars.baseScale.x;
        this.vars.liveScale.y = this.vars.baseScale.y;
        this.tweens.stretch = this.game.add.tween(this.sprite.scale);
        this.tweens.stretch.to(this.vars.liveScale, 1000, Phaser.Easing.Cubic.InOut, true);
        this.tweens.stretch.onComplete.add(this.api.stretchComplete);
        this.is.stretching = true;
      },
      stretchComplete: function(){
        this.sprite.scale.y = this.vars.baseScale.y;
        this.is.stretching = false;
      },
      stretchCancel: function( timeLimit ){
        if ( timeLimit ) {
          this.vars.stretchSince = this.game.time.now - this.vars.stretchStarted;
          if ( this.vars.stretchSince < timeLimit ) {
            this.tweens.stretch.stop(true);
          }
        }
        else {
          this.tweens.stretch.stop(true);
        }
      },
      
      puff: go.timelimit(function(){
        if ( !this.is.puffed ) {
          this.vars.liveScale.x = 5;
          this.vars.liveScale.y = 5;
          this.vars.baseScale.x = 5;
          this.vars.baseScale.y = 5;
          this.tweens.puff = this.game.add.tween(this.sprite.scale);
          this.tweens.puff.to(this.vars.liveScale, 500, Phaser.Easing.Cubic.InOut, true, 0, 0, false);
          this.tweens.puff.onComplete.add(this.api.puffComplete);
          this.is.puffed = true;
        }
        else {
          this.vars.liveScale.x = 1;
          this.vars.liveScale.y = 1;
          this.vars.baseScale.x = 1;
          this.vars.baseScale.y = 1;
          this.tweens.puff = this.game.add.tween(this.sprite.scale);
          this.tweens.puff.to(this.vars.liveScale, 500, Phaser.Easing.Cubic.InOut, true, 0, 0, false);
          this.tweens.puff.onComplete.add(this.api.puffComplete);
          this.is.puffed = false;
        }
      }, 1000, getNow),
      puffComplete: function(){
        //this.vars.baseScale.x = 1;
        //this.vars.baseScale.y = 1;
        //this.sprite.scale.x = this.vars.baseScale.x;
        //this.sprite.scale.y = this.vars.baseScale.y;
      }
    }
  });

  world.on('render', function(){
    
    //console.log(world.plant.sprite);
    
    //this.game.debug.geom(world.plant.sprite.ibody.polygon, 'rgba(255,0,0,0.5)', true);
    
    
    //this.game.debug.cameraInfo(this.game.camera, 20, 20, 'rgb(0,0,0)');
    //if ( world.plant.sprite.body ) {
    //  console.log(world.plant.sprite.body);
    //  this.game.debug.geom(world.plant.sprite.body.polybody, 'rgba(255,0,0,0.5)', true);
    //}
    //platform && this.game.debug.body(platform, 'rgba(0,255,0,1)', true);
    //this.game.debug.bodyInfo(player.sprite, 16, 24);
    //log(player.sprite.body.right);
  });

  world.make();

})();