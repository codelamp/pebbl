/**
 * The trigger manager for polycade
 */
async('polycade.entities.base', ['jq', 'Phaser', 'theory', 'underscore', 'polycade.imagination.body'], function($, Phaser, t, _){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entities || {};
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
   *
   */
  polycade.objects = {};
  polycade.objects.scale = t.base.mix({}, {

    prep: function(entity, options){

      return options;

    }

  });

  /**
   *
   */
  polycade.objects.position = t.base.mix({}, {

    /**
     *
     */
    prep: function(entity, options){
      this.entity = entity;
      this.x = _.isNumber(options.x) ? { value: options.x } : options.x;
      this.y = _.isNumber(options.y) ? { value: options.y } : options.y;
      switch ( options.x['function'] ) {
        case 'percent': _get = this.xPercent; break;
        case 'pixel':
        default:
          _get = this.xPixel;
        break;
      }
      this.x.entity = entity;
      this.x.get = _get;
      switch ( options.y['function'] ) {
        case 'percent': _get = this.yPercent; break;
        case 'pixel':
        default:
          _get = this.yPixel;
        break;
      }
      this.y.entity = entity;
      this.y.get = _get;
      return this;
    },

    /**
     * @TODO: calculate position based not only on viewport
     */
    xPercent: function(){
      return this.entity.game.viewport.width * this.value;
    },

    /**
     *
     */
    xPixel: function(){
      return this.value;
    },

    /**
     *
     */
    yPercent: function(){
      return this.entity.game.viewport.height * this.value;
    },

    /**
     *
     */
    yPixel: function(){
      return this.value;
    },

    /**
     *
     */
    applyTo: function(target){
      target = target || {};
      target.x = this.x();
      target.y = this.y();
      return target;
    }

  });

  /**
   * entity base
   */
  polycade.entities.base = t.base.mix(base, {

    prep: function( options ){
      options = this.options = options || {};
      // set up instances for our invocation
      this.prepHandlers();
      // prep any optional handlers
      options.sprite     && this.prepSprite(options.sprite);
      options.body       && this.prepBody(options.body);
      options.ibody      && this.prepiBody(options.ibody);
      true               && this.prepEvents(options.events);
      options.shadow     && this.prepShadow(options.shadow);
      options.controller && this.prepController(options.controller);
      // @TODO: temporary
      options.id     && (this.game[options.id] = this);
      return this;
    },

    /**
     * Objects tend to be subobjects that would benefit from
     * having a local instance stored that we can extend/namespace
     * without affecting other code.
     *
     * Handlers are just functions that should be attached as event
     * listeners.
     */
    prepHandlers: function(){
      // namespace any sub objects to us, so any changes are kept internal
      this.objects = {};
      this.objects.position = polycade.objects.position.namespace();
      this.objects.scale = polycade.objects.scale.namespace();
      // bind our sub handler objects to ourselves
      this.handlers = t.bindCollection(this.handlers || {}, this);
      return this;
    },

    /**
     * A Polycade entity can be a Sprite, or it can be an invisible body
     * those that implement sprites will run through this function.
     */
    prepSprite: function(options){
      this.sprite = new polycade.phaser.sprite(
        this, -999, -999, options.source.cacheName ? options.source.cacheName : options.source
      );
      this.sprite.processors = {
        position: this.objects.position.create(this, options.position),
        scale: this.objects.scale.create(this, options.scale)
      };
      //this.sc = {};
      //this.sc.position = this.sprite.processors.position;
      //this.sc.scale = this.sprite.processors.scale;
      if ( options.group ) {
        options.group.add(this.sprite);
      }
      else {
        this.phaser.add.existing(this.sprite);
      }

      var x = this.sprite.processors.position.x.get();
      var y = this.sprite.processors.position.y.get();

      this.sprite.position.x = x;
      this.sprite.position.y = y;

      this.sprite.inputEnabled = true;
      this.sprite.events.onInputDown.add(function(){
        alert(this.options.id);
      }, this);

      //this.sprite.position.x = this.game.viewport.width / 2;
      //this.sprite.position.y = this.game.viewport.height;

      //this.sprite.pivot.x = this.sprite.position.x - x;//this.sprite.position.x - this.game.viewport.width / 2;
      //this.sprite.pivot.y = (this.sprite.position.y - y);
      //this.sprite.pivot.y = this.game.viewport.height;

      (options.scale !== u)              && (this.sprite.scale = options.scale);
      (options.anchor !== u)             && (this.sprite.anchor = options.anchor);
      (options.blendMode !== u)          && (this.sprite.blendMode = options.blendMode);
      return this;
    },

    /**
     * If an entity has a body, then standard Phaser physicality will be added
     */
    prepBody: function(options){
      this.phaser.physics.enable(this.sprite, Phaser.Physics.ARCADE);
      (options.collideWorldBounds !== u) && (this.sprite.body.collideWorldBounds = options.collideWorldBounds);
      (options.allowGravity !== u)       && (this.sprite.body.allowGravity = options.allowGravity);
      (options.immovable !== u)          && (this.sprite.body.immovable = options.immovable);
      return this;
    },

    /**
     * If an entity has an ibody, then polycade's imagination handling will be enabled
     * this gives added collision ability for use inside Arcade Physics.
     */
    prepiBody: function(options){
      if ( options.disabled ) return;
      this.sprite.ibody = polycade.imagination.body.create(options);
      this.sprite.ibody.debugDraw(this.phaser, this.sprite);
      return this;
    },

    /**
     * If the options object contains an event collection
     * set-up those functions as listeners.
     */
    prepEvents: function(options){
      // create an event handler for this entity
      if ( this.sprite ) {
        this.events = this.game.events.createFrom(this.sprite.events);
      }
      else {
        this.events = this.game.events.create();
      }
      // extend the listened to events
      options && this.events.extend(options);
      return this;
    },

    /**
     * Prepare the shadow entity, if there is one
     */
    prepShadow: function(options){
      this.shadow = this.game.entities.shadow.create(this, options);
      return this;
    },

    /**
     *
     */
    prepController: function(options){
      
      return this;
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

  console.log('BASE', polycade.entities);

  return base;

});