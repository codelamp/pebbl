/**
 * The trigger manager for polycade
 */
async('polycade.entities.base', ['jq', 'Phaser', 'theory'], function($, Phaser, t){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entites || {};
  var base = polycade.entities.base || {};

  /**
   * adornment entity
   */
  polycade.entities.base = t.base.mix(base, {

    prep: function( options ){

      var sprite, body, ibody, u = undefined;

      this.options = options;
      this.vars = {};
      
      sprite = this.options.sprite;
      body = this.options.body;
      ibody = this.options.ibody;
      
      if ( sprite ) {
        this.sprite = this.phaser.add.sprite(
          this.options.sprite.position.x,
          this.options.sprite.position.y,
          this.options.sprite.source
        );
        this.position = this.sprite.position;
        (sprite.anchor !== u)             && (this.sprite.anchor = sprite.anchor);
        (sprite.blendMode !== u)          && (this.sprite.blendMode = sprite.blendMode);
        if ( body ) {
          this.phaser.physics.enable(this.sprite, Phaser.Physics.ARCADE);
          (body.collideWorldBounds !== u) && (this.sprite.body.collideWorldBounds = body.collideWorldBounds);
          (body.allowGravity !== u)       && (this.sprite.body.allowGravity = body.allowGravity);
          (body.immovable !== u)          && (this.sprite.body.immovable = body.immovable);
        }
        if ( ibody ) {
          ibody = _.clone(ibody);
          ibody.owner = this;
          this.sprite.ibody = polycade.imagination.body.create(ibody);
        }
      }
      
      if ( options.events ) {
        for ( var key in options.events ) {
          if ( !this.sprite.events[key] ) {
            this.sprite.events[key] = new Phaser.Signal();
          }
          if ( this.sprite.events[key] ) {
            this.sprite.events[key].add(t.bind(options.events[key], this));
          }
        }
      }
      
      this.sprite.events.added && this.sprite.events.added.dispatch();
      
      //this.options.add    && this.on('add', this.options.add);
      //this.options.update && this.on('update', this.options.update);
      //this.options.resize && this.on('resize', this.options.resize);
    
    },

    update: function(){
      //if ( this.sprite && this.sprite.ibody ) {
      //  this.sprite.ibody.update();
      //}
      //return this.trigger('update');
    },

    /**
     * Check collision, handling with either default Phaser or an ibody
     */
    collide: function( sprite ){
      if ( this.sprite && this.sprite.ibody ) {
        return this.sprite.ibody.collide( sprite );
      }
      else if ( this.sprite ) {
        return this.phaser.physics.arcade.collide(sprite, this.sprite);
      }
    }

  });

  return base;
  
});