/**
 * The polycade game handler
 */
async.tmp.includes = ['underscore', 'jq', 'theory', 'Phaser', 'verge', 'q'];
async.tmp.managers = ['polycade.events', 'polycade.screens', 'polycade.assets'];
async.tmp.core = ['polycade.entities.base', 'polycade.entities.shadow', 'polycade.controllers.user'];

/**
 * Prep the requirements for polycade.game
 */
async('polycade.game', async.tmp.includes, async.tmp.managers, async.tmp.core, function(_, $, t, Phaser, v, Q){

  var polycade = async.ref('polycade', {});

  console.log('>>>>', polycade.base.mix);

  /**
   * The game handler for polycade
   */
  polycade.game = polycade.base.mix(polycade.game, {

    name: 'polycade.game',

    /**
     *
     */
    defaultOptions: {
      viewport: {},
      ui: {}
    },

    /**
     * Set up the polycade game object
     */
    prep: function(options){
      options = this.prepOptions(options);
      // generate a unique id
      this.id = t.guid();
      // preps
      this.prepHandlers(options);
      this.prepUI(options.ui);
      this.prepViewport(options.viewport);
      this.prepPhaser(options.phaser);
      this.deferred = Q.defer();
      return this.deferred.promise.then(this.handlers.ready);
    },

    /**
     * Some base game entities that we should namespace
     */
    prepEntities: function(context){
      this.entities = {};
      this.entities.shadow = polycade.entities.shadow.namespace(context);
      this.entities.base = polycade.entities.base.namespace(context);
    },

    /**
     * Create the instance of Phaser that we'll interact with
     */
    prepPhaser: function(){
      // shared object
      this.phaser = new Phaser.Game(100, 100, Phaser.AUTO, this.container[0], this.phaserHandlers, true, true);
    },

    prepUI: function(){
      this.container = $(this.options.container);
    },

    /**
     * Bind the handlers to this instance
     */
    prepHandlers: function(){
      // handlers
      this.handlers = t.bindCollection(this.handlers, this);
      this.phaserHandlers = t.bindCollection(this.phaserHandlers, this);
    },

    /**
     * Set-up the managers on this game instance
     */
    prepManagers: function(context){
      // prep the namespaces
      this.managers = {};
      this.managers.events = polycade.managers.events.namespace(context);
      this.managers.screens = polycade.managers.screens.namespace(context);
      this.managers.assets = polycade.managers.assets.namespace(context);
      // then create the manager instances
      this.events = this.managers.events.create();
      this.screens = this.managers.screens.create();
      this.assets = this.managers.assets.create();
    },

    /**
     * Integrate with the viewport
     */
    prepViewport: function(){
      if ( !this.viewport ) {
        this.viewport = { element: window };
        this.viewport.width = v.viewportW();
        this.viewport.height = v.viewportH();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.viewport.element.addEventListener('resize', this.handlers.resize);
      }
    },

    handlers: {

      /**
       *
       */
      ready: function(){
        var context = {
          game: this,
          phaser: this.phaser
        };
        // now that phaser is ready, we can update our namespaced objects
        this.prepEntities(context);
        this.prepManagers(context);
        this.screens.fetch('construction-puzzle').then(function(fetchedScreen){
          context.game.currentScreen = fetchedScreen;
          fetchedScreen.enable();
          context.game.handlers.resize();
        });
      },

      /**
       *
       */
      resize: function(){
        this.viewport.width = v.viewportW();
        this.viewport.height = v.viewportH();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.phaser.scale.setGameSize(this.viewport.width, this.viewport.height);
        this.phaser.world.setBounds(
          0, 0,
          Math.max(this.viewport.width, this.dims.width),
          Math.min(this.viewport.height, this.dims.height)
        );
        //this.options.cameraTarget && this.game.camera.follow( this.options.cameraTarget.sprite, Phaser.Camera.FOLLOW_PLATFORMER );

        //this.bg.y = this.phaser.world.bounds.height - 450;
        //this.bg.x = this.phaser.world.bounds.width / 2;
        //this.bgMountain.y = this.phaser.world.bounds.height - 240;

        //this.globe.sprite.events.resize.dispatch();
        //this.plant.sprite.events.resize.dispatch();

      }

    },

    phaserHandlers: {
      preload: function(){},
      create: function(){ this.deferred.resolve(this); },
      update: function(){},
      render: function(){}
    },

    /**
     * return the global xy position (from top left) for any game object
     */
    globalPosition: function(obj){
      if ( obj && obj.sprite ) {
        return obj.sprite.position;
      }
      else {
        return new Phaser.Point(0, 0);
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