/**
 * The trigger manager for polycade
 */
async('polycade.entities.base', ['jq', 'Phaser', 'theory', 'underscore'], function($, Phaser, t, _){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entites || {};
  var base = polycade.entities.base || {};
  var u = undefined;

  /**
   * Create a polycade extended sprite
   */
  polycade.phaser = {};
  polycade.phaser.sprite = function(entity, x, y, source){
    Phaser.Sprite.call(this, entity.phaser, x, y, source);
    this.polycade = entity;
  };
  polycade.phaser.sprite.prototype = Object.create(Phaser.Sprite.prototype);
  polycade.phaser.sprite.prototype.constructor = polycade.phaser.sprite;

  /**
   * entity base
   */
  polycade.entities.base = t.base.mix(base, {

    prep: function( options ){

      this.options = options;
      this.vars = {};
      
      options.sprite && this.prepSprite(options.sprite);
      options.body   && this.prepBody(options.body);
      options.ibody  && this.prepiBody(options.ibody);
      options.events && this.prepEvents(options.events);
      
      this.sprite.events.added && this.sprite.events.added.dispatch();
      
      //this.options.add    && this.on('add', this.options.add);
      //this.options.update && this.on('update', this.options.update);
      //this.options.resize && this.on('resize', this.options.resize);
    
    },
    
    /**
     *
     */
    prepSprite: function(options){
      this.sprite = new polycade.phaser.sprite(
        this,
        options.position.x,
        options.position.y,
        options.source
      );
      this.phaser.add.existing(this.sprite);
      this.position = this.sprite.position;
      (options.anchor !== u)             && (this.sprite.anchor = options.anchor);
      (options.blendMode !== u)          && (this.sprite.blendMode = options.blendMode);
    },
    
    /**
     *
     */
    prepBody: function(options){
      this.phaser.physics.enable(this.sprite, Phaser.Physics.ARCADE);
      (options.collideWorldBounds !== u) && (this.sprite.body.collideWorldBounds = options.collideWorldBounds);
      (options.allowGravity !== u)       && (this.sprite.body.allowGravity = options.allowGravity);
      (options.immovable !== u)          && (this.sprite.body.immovable = options.immovable);
    },

    /**
     *
     */
    prepiBody: function(options){
      ibody = _.clone(options);
      ibody.owner = this;
      this.sprite.ibody = polycade.imagination.body.create(options);
    },

    /**
     *
     */
    prepEvents: function(options){
      for ( var key in options ) {
        if ( !this.sprite.events[key] ) {
          this.sprite.events[key] = new Phaser.Signal();
        }
        if ( this.sprite.events[key] ) {
          this.sprite.events[key].add(t.bind(options[key], this));
        }
      }
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