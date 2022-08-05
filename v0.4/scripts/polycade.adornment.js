/**
 * Adornments are game world sprites that are essentially static
 * some animation may be possible later however.
 * but essentially static animation...
 *
 * figure that one out.
 */
polycade.adornment = {
  
  create: function( options ){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  prep: function( options ){
    /// listen to those loverly eventles
    mix.eventHandling.apply(this);
    var sprite, body, ibody, u = undefined;
    this.options = options;
    this.game = this.options.game;
    this.world = this.options.world || null;
    this.vars = {};
    if ( (sprite=this.options.sprite) ) {
      this.sprite = this.game.add.sprite(
        this.options.sprite.position.x,
        this.options.sprite.position.y,
        this.options.sprite.source
      );
      this.position = this.sprite.position;
      (sprite.anchor !== u)             && (this.sprite.anchor=sprite.anchor);
      (sprite.blendMode !== u)          && (this.sprite.blendMode=sprite.blendMode);
      if ( (body=this.options.body) ) {
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        (body.collideWorldBounds !== u) && (this.sprite.body.collideWorldBounds=body.collideWorldBounds);
        (body.allowGravity !== u)       && (this.sprite.body.allowGravity=body.allowGravity);
        (body.immovable !== u)          && (this.sprite.body.immovable=body.immovable);
      }
      if ( (ibody=this.options.ibody) ) {
        ibody = _.clone(ibody);
        ibody.owner = this;
        this.sprite.ibody = imagination.body.create(ibody);
      }
    }
    this.options.add    && this.on('add', this.options.add);
    this.options.update && this.on('update', this.options.update);
    this.options.resize && this.on('resize', this.options.resize);
    this.trigger('add');
    return this;
  },
  
  update: function(){
    if ( this.sprite && this.sprite.ibody ) {
      this.sprite.ibody.update();
    }
    return this.trigger('update');
  },
  
  collide: function( sprite ){
    if ( this.sprite && this.sprite.ibody ) {
      return this.sprite.ibody.collide( sprite );
    }
    else if ( this.sprite ) {
      return this.game.physics.arcade.collide(sprite, this.sprite);
    }
  },
  
  /**
   *
   */
  nearestPoint: function(x, y, p){
    if ( this.sprite && this.sprite.ibody ) {
      p = this.sprite.ibody.polygonEdgefindGlobal(x, y);
      return p && p.point || {};
    }
    return null;
  },
  
  /**
   *
   */
  castShadow: function(dx, dy, against){
    this.world.castShadow(this, dx, dy, against);
  }
  
};