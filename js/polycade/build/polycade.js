/**
 * The trigger manager for polycade
 */
async('polycade.entities.base', ['jq', 'Phaser', 'theory'], function($, Phaser, theory){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entites || {};
  var base = polycade.entities.base || {};

  /**
   * adornment entity
   */
  polycade.entities.base = theory.base.mix(base, {

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
          this.sprite.events[key] && this.sprite.events[key].add(options.events[key]);
        }
      }
      
      //this.options.add    && this.on('add', this.options.add);
      //this.options.update && this.on('update', this.options.update);
      //this.options.resize && this.on('resize', this.options.resize);
    
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
        return this.phaser.physics.arcade.collide(sprite, this.sprite);
      }
    }

  });

  return base;
  
});
/**
 * The trigger manager for polycade
 */
async('polycade.entities.adornment', ['jq', 'Phaser', 'theory'], function($, Phaser, theory){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entites || {};
  var adornment = polycade.entities.adornment || {};

  /**
   * adornment entity
   */
  polycade.entities.adornment = theory.base.mix(adornment, {

    prep: function( options ){

    },

    update: function(){

    },

    /**
     * Check collision, handling with either default Phaser or an ibody
     */
    collide: function( sprite ){

    }

  });

  return adornment;
  
});
/**
 * The polycade game handler
 */
async.tmp.includes = ['underscore', 'jq', 'theory', 'Phaser', 'verge'];
async.tmp.managers = ['polycade.events', 'polycade.layers', 'polycade.assets', 'polycade.entities.base'];
async('polycade.game', async.tmp.includes, async.tmp.managers, function(_, $, t, Phaser, v){

  var polycade = async.ref('polycade', {}), local = polycade.game || {};

  /**
   * The game handler for polycade
   */
  polycade.game = t.base.mix(local, {

    name: 'polycade.game',

    prep: function(options){
      this.options = options;
      
      this.viewport = { element: window };
      this.viewport.width = v.viewportW();
      this.viewport.height = v.viewportH();
      this.viewport.ratio = this.viewport.width / this.viewport.height;
      
      this.viewport.element.addEventListener('resize', function(){
        console.log('resize');
      });
      
      this.events = polycade.manager('events').namespace('polycade').create();
      this.layers = polycade.manager('layers').namespace('polycade').create();
      this.assets = polycade.manager('assets').namespace('polycade').create();
      
      this.entities = {};
      this.entities.base = polycade.entities.base.namespace('polycade.game');
      
      this.handlers = t.bindCollection(this.handlers);
      this.phaserHandlers = t.bindCollection(this.phaserHandlers);
      
      this.i = {};
      this.i.container = $(this.options.container);
      
      // shared object
      this.phaser = new Phaser.Game(100, 100, Phaser.AUTO, this.i.container[0], this.phaserHandlers, true);
      
      return this;
    },
    
    handlers: {
      
      resize: function(){
        this.viewport.width = this.viewport.element.width();
        this.viewport.height = this.viewport.element.height();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.phaser.scale.setGameSize(this.viewport.width, this.viewport.height);
        this.phaser.world.setBounds(
          0,0,
          Math.max(this.viewport.width, this.dims.width),
          Math.min(this.viewport.height, this.dims.height)
        );
        //this.options.cameraTarget && this.game.camera.follow( this.options.cameraTarget.sprite, Phaser.Camera.FOLLOW_PLATFORMER );
      }
      
    },
    
    phaserHandlers: {
    
      preloads: function(){
        this.phaser.load.image('pic', 'assets/backgrounds/world-a/mountain-a.png');
        this.phaser.load.image('plant', 'assets/entities/plant-a.png');
        this.phaser.load.image('sky', 'assets/backgrounds/world-a/sky.jpg');
        this.phaser.load.image('shadow', 'assets/effects/round-shadow.png');
        //this.phaser.load.json('pebble-a', pebbl.assets['entities.pebble-a'].ibody);
      },
      
      creates: function(){
        
        this.entities.base.game = this;
        this.entities.base.phaser = this.phaser;
        
        /// start the simple physics ball rolling
        this.phaser.physics.startSystem(Phaser.Physics.ARCADE);
        /// create the background sky
        this.bg = this.phaser.add.sprite(0,0, 'sky');
        this.bg.anchor = {x:0.5, y:0};
        this.bg.fixedToCamera = false;
        
        this.plant = this.entities.base.create({
          sprite: {
            source: 'plant',
            position: { x:300, y:300 },
            anchor: { x:0.5, y:1 }
          },
          body: {
            collideWorldBounds: false,
            immovable: true,
            allowGravity: false
          },
          _ibody: {
            container: this.imagination,
            source: 'plant',
            debug: true
          },
          events: {
            onAddedToGroup: function(){
              this.shadow = this.phaser.add.sprite(0,0, 'shadow');
              this.shadow.anchor = { x:0.4, y:0.5 };
              this.shadow.alpha = 0.2;
              this.shadow.scale.x = 0.3;
              this.shadow.scale.y = 0.2;
              this.shadow.baseAlpha = 0.3;
              this.sprite.bringToTop();
            },
            resize: function(){
              //this.position.x = this.phaser.world.bounds.width * 0.85;
              //this.position.y = world.globe.nearestPoint(this.position.x, 0).y + 4;
              this.shadow.position.x = this.position.x;
              this.shadow.position.y = this.position.y;
              //this.update();
            }
          }
        });
        
        /*
        //  Create a BitmapData
        var bmd = this.phaser.make.bitmapData(320, 256);

        //  Draw an image to it
        bmd.copy('pic');

        //  Draw a few random shapes to it
        bmd.circle(100, 100, 32, 'rgba(255,0,0,0.8)');
        //bmd.rect(110, 40, 64, 120, 'rgba(255,0,255,0.8)');

        //  Here the sprite uses the BitmapData as a texture
        this.sprite = this.phaser.add.sprite(300, 300, bmd);

        this.sprite.anchor.set(0.5);
        */
      },
      
      updates: function(){
        //this.sprite.rotation += 0.01;
      },
      
      renders: function(){
        
      },
      
      resize: function(){
        console.log(this);
      }
      
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
    'jq':                          { file: 'node_modules/jqlite/jqlite.js',             resolve: function(){ return jqlite; } },
    'underscore':                  { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                      { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                       { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'verge':                       { file: 'vendor/verge/verge.min.js',                 resolve: function(){ return verge; } },
    'q':                           { resolve: function(){ return async.promiser; } },
    // polycade managers
    'polycade.events':             { file: 'src/managers/polycade.events.js', asynced: true },
    'polycade.layers':             { file: 'src/managers/polycade.layers.js', asynced: true },
    'polycade.assets':             { file: 'src/managers/polycade.assets.js', asynced: true },
    // polycade core
    'polycade.game':               { file: 'src/polycade.game.js',   asynced: true },
    'polycade.entities.base':      { file: 'src/polycade.entities.base.js', asynced: true },
    'polycade.entities.adornment': { file: 'src/polycade.entities.adornment.js', asynced: true },
    'polycade.imagination.body':   { file: 'src/polycade.imagination.body.js', asynced: true }
  },
  build: {
    // vendor
    'jq':                          { file: 'node_modules/jqlite/jqlite.min.js',         resolve: function(){ return jqlite; } },
    'underscore':                  { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                      { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                       { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'verge':                       { file: 'vendor/verge/verge.min.js',                 resolve: function(){ return verge; } },
    'q':                           { resolve: function(){ return async.promiser; } },
    // polycade managers
    'polycade.events':             { asynced: true },
    'polycade.layers':             { asynced: true },
    'polycade.assets':             { asynced: true },
    // polycade core
    'polycade.game':               { asynced: true },
    'polycade.entities.base':      { asynced: true },
    'polycade.entities.adornment': { asynced: true },
    'polycade.imagination.body':   { asynced: true },
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
async('polycade.assets', ['underscore', 'theory', 'Phaser', 'q'], function(_, theory, Phaser, q){

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