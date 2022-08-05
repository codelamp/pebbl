/**
 *
 */
polycade.player = {
  
  is: null,
  vars: null,
  options: null,
  velocity: null,
  tilt: null,
  world: null,
  bubbles: null,
  
  create: function(){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  /**
   *
   */
  prep: function( options ){
    this.options = options;
    this.vars = {};
    this.tweens = {};
    this.is = {
      stretching: false,
      grounded: false
    };
    this.was = {
      strecthing: false,
      grounded: false
    };
    this.velocity = {
      x: VelocityRange.create(-200, 0, 200, 10),
      y: VelocityRange.create(-200, 0, 200, 10)
    };
    this.tilt = VelocityRange.create(-0.3, 0, 0.3, 0.01);
    this.world = options.world;
    this.bubbles = [];
    /// mix in event handling
    mix.eventHandling.apply(this);
    ///
    this.options.add && this.on('add', this.options.add);
    this.options.make && this.on('make', this.options.make);
    this.options.build && this.on('build', this.options.build);
    this.options.update && this.on('update', this.options.update);
    /// disable the update method until needed
    this.update = null;
    ///
    if ( this.options.api ) {
      this.api = go.bindCollection(this.options.api, this);
    }
    return this;
  },
  
  /**
   *
   */
  make: function(){
    var x = 0, y = 0;
    if ( this.options.position ) {
      x = this.options.position.x;
      y = this.options.position.y;
    }
    //this.group = this.game.add.group();
    this.sprite = this.game.add.sprite(x, y);
    this.sprite.owner = this;
    this.trigger('make');
    this.trigger('build');
    return this;
  },
  
  /**
   *
   */
  update: function(){
    return this.trigger('update');
  },
  
  /**
   *
   */
  hasSpeech: function(){
    return !!this.bubbles.length;
  },
  
  /**
   *
   */
  updateSpeech: function(){
    if ( !this.vars.speechUpdated || ((this.game.time.now - this.vars.speechUpdated) > 1000) ) {
      this.vars.speechUpdated = this.game.time.now;
      this.bubbles[0].qtip('option', 'position.target', [
        this.sprite.x * this.game.scale.scaleFactorInversed.x,
        this.sprite.y * this.game.scale.scaleFactorInversed.y
      ]);
    }
  },
  
  /**
   *
   */
  speak: function( msg, lifespan, delay ){
    return this.world.speak(this, msg, lifespan, delay);
  },
  
  /**
   *
   */
  motionless: function(){
    var p1 = this.sprite.previousPosition,
        p2 = this.sprite.position,
        ml = this.vars.motionless
    ;
    this.vars.motionless = (Math.abs(p2.x - p1.x) < 0.1) && (Math.abs(p2.y - p1.y) < 0.1);
    if ( this.vars.motionless ) {
      if ( !ml ) {
        this.vars.motionlessSince = this.game.time.now;
      }
      if ( (this.game.time.now - this.vars.motionlessSince) > 400 ) {
        return true;
      }
    }
    return false;
  },
  
  /**
   *
   */
  grounded: function(){
    return this.sprite.body.onFloor() 
        || this.sprite.body.wasTouching.down
        || this.sprite.body.touching.down
    ;
  },
  
  /**
   *
   */
  addTo: function( container ){
    delete this.update; /// re-enabled the update function
    this.game = container.game;
    this.make(); /// we can only be made if game exists
    this.position = this.sprite.position;
    this.trigger('add');
    container.addChild( this.sprite );
    //this.game.camera.deadzone = new Phaser.Rectangle(100, 50, this.game.camera.width-200, this.game.camera.height-200);
    return this;
  },
  
  /**
   *
   */
  tick: function(){
    //if ( this.graphics ) {
    //  this.graphics.x = this.sprite.x;
    //  this.graphics.y = this.sprite.y;
    //}
  },
  
  /**
   *
   */
  castShadow: function(dx, dy, against){
    this.world.castShadow(this, dx, dy, against);
  }
  
};