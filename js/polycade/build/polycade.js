/**
 * The trigger manager for polycade
 */
async('polycade.adornment', ['jq', 'Phaser', 'theory'], function($, Phaser, theory){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entites || {};
  var local = polycade.entities.adornment || {};

  /**
   * adornment entity
   */
  polycade.entities.adornment = theory.base.mix(local, {

    prep: function( options ){

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
          this.sprite.ibody = polycade.imagination.body.create(ibody);
        }
      }
      this.options.add    && this.on('add', this.options.add);
      this.options.update && this.on('update', this.options.update);
      this.options.resize && this.on('resize', this.options.resize);
      this.trigger('add');
    
    },

    update: function(){
      if ( this.sprite && this.sprite.ibody ) {
        this.sprite.ibody.update();
      }
      return this.trigger('update');
    },

    /**
     * Check collision, handling with either default Phaser or an ibody
     */
    collide: function( sprite ){
      if ( this.sprite && this.sprite.ibody ) {
        return this.sprite.ibody.collide( sprite );
      }
      else if ( this.sprite ) {
        return this.game.physics.arcade.collide(sprite, this.sprite);
      }
    }

  });

  return local;
  
});
/**
 * The polycade game handler
 */
async.tmp.includes = ['underscore', 'jq', 'theory', 'Phaser'];
async.tmp.managers = ['polycade.events', 'polycade.layers', 'polycade.assets'];
async('polycade.game', async.tmp.includes, async.tmp.managers, function(_, $, theory, Phaser){

  var polycade = async.ref('polycade', {}), local = polycade.game || {};

  /**
   * The game handler for polycade
   */
  polycade.game = theory.base.mix(local, {

    name: 'polycade.game',

    prep: function(){
      this.events = polycade.manager('events').namespace('polycade').create();
      this.layers = polycade.manager('layers').namespace('polycade').create();
      this.assets = polycade.manager('assets').namespace('polycade').create();
      return this;
    }

    /*
    prep: function(){

      var game = this;

      this.layers = polycade.manager('layers').namespace(this.ns).create();
      this.events = polycade.manager('events').namespace(this.ns).create(this.handlers.events);
      //this.triggers = polycade.manager('triggers').namespace(this.ns).create(this.handlers.triggers);
      this.assets = polycade.manager('assets').namespace(polycade.ns).create();

      this.options = options;
      this.assets.load('assets/screens/testbed.json').then(function(data){


        ///////////////////////

        // once we've loaded the screen information, create Phaser
        game.phaser = new Phaser.Game('100', '100', Phaser.AUTO, jQuery(this.options.container)[0], {
          preload: this.triggers.preloads,
          create: this.triggers.builds,
          update: this.triggers.updates,
          render: this.triggers.renders
        }, true);
      });

    },

    preload: function(){
      this.phaser.load.json('pebble-a', pebbl.assets['entities.pebble-a'].ibody);
    }
    */

  });

  return polycade.game;

});
/**
 * The code that powers the ibody handling, an extension body
 * which allows for polycode collision testing.
 */
async('polycade.imagination.body', ['jq', 'Phaser', 'theory', 'PolyK'], function($, Phaser, theory, PolyK){

  var polycade = async.ref('polycade', {});
      polycade.imagination = polycade.imagination || {};

  /**
   * imagination body
   */
  polycade.imagination.body = theory.base.mix(polycade.imagination.body || {}, {

    prep: function( options ){

      /// http://phaser.io/docs/2.6.2/Phaser.Physics.Arcade.html#collide
      /// game.physics.collide(balls, balls, ballHitBallHandler, ballHitBallProcess, this);

    },

    collide: function(){

    }

  });

  return polycade.imagination.body;

});
async.registry('polycade', {
  src: {
    // vendor
    'jq':                        { file: 'node_modules/jqlite/jqlite.js',             resolve: function(){ return jqlite; } },
    'underscore':                { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                    { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                     { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'Q':                         { resolve: function(){ return async.Q; } },
    // polycade managers
    'polycade.events':           { file: 'src/managers/polycade.events.js', asynced: true },
    'polycade.layers':           { file: 'src/managers/polycade.layers.js', asynced: true },
    'polycade.assets':           { file: 'src/managers/polycade.assets.js', asynced: true },
    // polycade core
    'polycade.game':             { file: 'src/polycade.game.js',   asynced: true },
    'polycade.adornment':        { file: 'src/polycade.adornment.js', asynced: true },
    'polycade.imagination.body': { file: 'src/polycade.imagination.body.js', asynced: true }
  },
  build: {
    // vendor
    'jq':                        { file: 'node_modules/jqlite/jqlite.min.js',         resolve: function(){ return jqlite; } },
    'underscore':                { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                    { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                     { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'Q':                         { resolve: function(){ return async.Q; } },
    // polycade managers
    'polycade.events':           { asynced: true },
    'polycade.layers':           { asynced: true },
    'polycade.assets':           { asynced: true },
    // polycade core
    'polycade.game':             { asynced: true },
    'polycade.adornment':        { asynced: true },
    'polycade.imagination.body': { asynced: true },
  }
});

async('polycade', ['jq', 'theory', 'Phaser'], ['polycade.game'], function($, theory, Phaser){

  var polycade = async.ref('polycade', {});

  /**
   * Set-up the polycade object, but also allow early mixins
   */
  polycade = theory.base.mix(polycade, {

    manager: function(n){
      return polycade.managers[n];
    }

    /*
    is: null,
    ns: 'polycade',

    prep: function( options ){
      return this;
    },

    manager: function(n){
      return polycade.managers[n];
    },

    preload: function( callback ){
      return this.events.on('preload', callback);
    },

    make: function(){
      this.events.trigger('make');
    },

    handlers: {

      events: {

        make: function(){
          this.viewport = { element: jQuery(window) };
          this.viewport.width = this.viewport.element.width();
          this.viewport.height = this.viewport.element.height();
          this.viewport.ratio = this.viewport.width / this.viewport.height;
          this.dims = {
            width: 1280,
            height: 720
          };
          /// set-up the game object
          this.game = new Phaser.Game('100', '100', Phaser.AUTO, jQuery(this.options.container)[0], {
            preload: this.triggers.preloads,
            create: this.triggers.builds,
            update: this.triggers.updates,
            render: this.triggers.renders
          }, true);
        },

        build: function(){
          this.canvas = jQuery(this.game.canvas);
          this.game.physics.startSystem(Phaser.Physics.ARCADE);
          this.game.scale.minWidth = 0;
          this.game.scale.minHeight = 0;
          this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE; //USER_SCALE; //USER_SCALE; //.EXACT_FIT;
          this.game.camera.deadzone = null;
          this.viewport.element.resize(this.events.resize);
          run.later(this.events.resize, 50);
        },

        resize: function(){
          this.viewport.width = this.viewport.element.width();
          this.viewport.height = this.viewport.element.height();
          this.viewport.ratio = this.viewport.width / this.viewport.height;
          this.game.scale.setGameSize(this.viewport.width, this.viewport.height);
          this.game.world.setBounds(
            0,0,
            Math.max(this.viewport.width, this.dims.width),
            Math.min(this.viewport.height, this.dims.height)
          );
          this.options.cameraTarget && this.game.camera.follow( this.options.cameraTarget.sprite, Phaser.Camera.FOLLOW_PLATFORMER );
          this.events.trigger('resize');
        }

      },

      triggers: {

        preloads: function(){
          this.is.preloading = true;
          return this.events.trigger('preload');
        },

        builds: function(){
          this.is.preloading = false;
          this.is.preloaded = true;
          return this.events.trigger('build');
        },

        updates: function(){
          return this.events.trigger('update');
        },

        renders: function(){
          this.events.trigger('render:before');
          this.events.trigger('render');
          this.events.trigger('render:after');
        }

      }

    }*/

  });

  return polycade;

});
/**
 * The event/trigger manager for polycade
 */
async('polycade.assets', ['underscore', 'theory', 'Phaser', 'Q'], function(_, theory, Phaser, Q){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};

  /**
   * The asset manager for polycade
   */
  polycade.managers.assets = theory.base.mix(polycade.managers.assets || {}, {

    /**
     *
     */
    load: function(path){

      return Q.defer().promise;

    }

  });

  return polycade.managers.assets;

});
/**
 * Make sure the base polycade exists
 */
async('polycade.events', ['jq', 'theory', 'Phaser', 'theory.plugins.events'], function($, theory, Phaser){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};

  /**
   * The event manager for polycade
   */
  polycade.managers.events = (function(mixin){

    var local = theory.base.mix(theory.plugins.events.create(), mixin || {}, {

    });

    return local;

  })(polycade.managers.events);

  return polycade.managers.events;

});
/**
 * Make sure the base polycade exists
 */
async('polycade.layers', ['jq', 'theory', 'Phaser'], function($, theory, Phaser){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};

  /**
   * The event manager for polycade
   */
  polycade.managers.layers = (function(mixin){

    var local = theory.base.mix(mixin || {}, {

      name: 'polycade.layers',

      prep: function( options ){
        return this;
      },

      /**
       * Create a new layer
       */
      createLayer: function(){
        return $('<div />');
      },

      /**
       * Take a list of layer elements, or selectors, and
       * convert them down to jQuery objects.
       */
      resolveLayers: function( layers ){
        var ret = {};
        if ( layers ) {
          for ( var i in layers ) {
            ret[i] = $(layers[i]);
          }
        }
        return ret;
      }

    });

    return local;

  })(polycade.managers.layers || {});

  return polycade.managers.layers;

});