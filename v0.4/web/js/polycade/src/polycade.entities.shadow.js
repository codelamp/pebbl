/**
 * The trigger manager for polycade
 */
async('polycade.entities.shadow', ['jq', 'Phaser', 'theory', 'underscore'], function($, Phaser, t, _){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entities || {};

  /**
   *
   */
  polycade.entities.shadow = t.base.mix(polycade.entities.shadow || {}, {

    /**
     *
     */
    prep: function(owner, options){
      this.owner = owner;
      this.source = options.source;
      this.handlers = t.bindCollection(this.handlers, this);
      this.events = {};
      this.events.update = new Phaser.Signal();
      this.events.resize = new Phaser.Signal();
      
      this.sprite = new polycade.phaser.sprite(
        this, -999, -999, options.source.cacheName ? options.source.cacheName : options.source
      );
      /*
      if ( options.group ) {
        options.group.add(this.sprite);
      }
      else {
        this.phaser.add.existing(this.sprite);
      }
      this.shadow.anchor = {x:0.5, y:0.7};
      this.shadow.alpha = 0.3;
      this.shadow.scale.y = 0.2;
      this.shadow.baseAlpha = 0.3;
      this.shadow.position = {x:500, y:500};
      this.sprite.bringToTop();
      */
      return this;
    },

    /**
     *
     */
    makeSimple: function(){
      this.events.resize.add(this.handlers.resize);
      this.events.update.remove(this.handlers.update);
    },

    /**
     *
     */
    makeTracking: function(){
      this.events.resize.remove(this.handlers.resize);
      this.events.update.add(this.handlers.update);
    },

    /**
     *
     */
    cast: function(){
      var oxy = this.i.game.globalPosition(this.i.owner);
      var sxy = this.i.game.globalPosition(this.i.source);
      var ang = Phaser.Point.angle(oxy, sxy);

      console.log(ang);
    },

    /**
     *
     */
    handlers: {

      resize: function(){
        this.cast();
      },

      update: function(){
        this.cast();
      }

    }

  });

  console.log('SHADOW', polycade.entities);

  return polycade.entities.shadow;

});