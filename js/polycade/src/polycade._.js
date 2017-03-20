async.registry('polycade', {
  src: {
    // vendor
    'jq':                        { file: 'node_modules/jqlite/jqlite.js',             resolve: function(){ return jqlite; } },
    'underscore':                { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                    { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                     { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'q':                         { resolve: function(){ return async.promiser; } },
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
    'q':                         { resolve: function(){ return async.promiser; } },
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