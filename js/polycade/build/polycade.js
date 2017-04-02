async('polycade.base', ['theory'], function(t){

  var polycade = async.ref('polycade', {});

  return (polycade.base = t.mergeAndClone(t.base, {

    /**
     * prepare the options object
     */
    prepOptions: function(options){
      return this.options = t.mergeAndClone(this.defaultOptions || {}, options);
    }

  }));

});
/**
 * The trigger manager for polycade
 */
async('polycade.entities.base', ['jq', 'Phaser', 'theory', 'underscore'], function($, Phaser, t, _){

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
      return; //// @TODO: remove
      ibody = _.clone(options);
      ibody.owner = this;
      this.sprite.ibody = polycade.imagination.body.create(options);
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
/**
 * The trigger manager for polycade
 */
async('polycade.entities.adornment', ['jq', 'Phaser', 'theory'], function($, Phaser, theory){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entities || {};
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
async.tmp.includes = ['underscore', 'jq', 'theory', 'Phaser', 'verge', 'q'];
async.tmp.managers = ['polycade.events', 'polycade.screens', 'polycade.assets'];
async.tmp.core = ['polycade.entities.base', 'polycade.entities.shadow', 'polycade.controllers.user'];

/**
 * Prep the requirements for polycade.game
 */
async('polycade.game', async.tmp.includes, async.tmp.managers, async.tmp.core, function(_, $, t, Phaser, v, Q){

  var polycade = async.ref('polycade', {});

  console.log(polycade.base.mix);

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
      this.phaser = new Phaser.Game(100, 100, Phaser.AUTO, this.i.container[0], this.phaserHandlers, true, true);
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
    'defiant':                     { file: 'node_modules/defiant/dist/defiant.min.js',  resolve: function(){ return Defiant; } },
    'q':                           { resolve: function(){ return async.promiser; } },
    // polycade managers
    'polycade.events':             { file: 'src/managers/polycade.events.js', asynced: true },
    'polycade.screens':            { file: 'src/managers/polycade.screens.js', asynced: true },
    'polycade.assets':             { file: 'src/managers/polycade.assets.js', asynced: true },
    // polycade core
    'polycade.base':               { file: 'src/polycade.base.js',   asynced: true },
    'polycade.game':               { file: 'src/polycade.game.js',   asynced: true },
    'polycade.entities.base':      { file: 'src/polycade.entities.base.js', asynced: true },
    'polycade.entities.shadow':    { file: 'src/polycade.entities.shadow.js', asynced: true },
    'polycade.entities.adornment': { file: 'src/polycade.entities.adornment.js', asynced: true },
    'polycade.controllers.user':   { file: 'src/polycade.controllers.user.js', asynced: true },
    'polycade.imagination.body':   { file: 'src/polycade.imagination.body.js', asynced: true }
  },
  build: {
    // vendor
    'jq':                          { file: 'node_modules/jqlite/jqlite.min.js',         resolve: function(){ return jqlite; } },
    'underscore':                  { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                      { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                       { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'verge':                       { file: 'vendor/verge/verge.min.js',                 resolve: function(){ return verge; } },
    'defiant':                     { file: 'node_modules/defiant/dist/defiant.min.js',  resolve: function(){ return Defiant; } },
    'q':                           { resolve: function(){ return async.promiser; } },
    // polycade managers
    'polycade.events':             { asynced: true },
    'polycade.screens':            { asynced: true },
    'polycade.assets':             { asynced: true },
    // polycade core
    'polycade.base':               { asynced: true },
    'polycade.game':               { asynced: true },
    'polycade.entities.base':      { asynced: true },
    'polycade.entities.shadow':    { asynced: true },
    'polycade.entities.adornment': { asynced: true },
    'polycade.controllers.user':   { asynced: true },
    'polycade.imagination.body':   { asynced: true }
  }
});

async('polycade', ['jq', 'theory', 'underscore'], ['polycade.base'], function($, t, _){

  var polycade = async.ref('polycade', {});

  /**
   * Set-up the polycade object, but also allow early mixins
   */
  polycade = polycade.base.mix(polycade, {


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
async('polycade.events', ['jq', 'theory', 'Phaser', 'underscore'], function($, theory, Phaser, _){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};
  var local;

  /**
   * The event manager for polycade
   */
  polycade.managers.events = theory.base.mix(polycade.managers.events || {}, local = {
    
    /**
     * Enhance an existing phaser events object
     */
    createFrom: function(obj){
      return _.extend(obj, local);
    },
    
    prep: function(options){
      options = options || {};
      return this;
    },
    
    splitNames: function(names){
      return names.split(' '); // @TODO: improve
    },
    
    on: function(name, callback, context, priority, args){
      _.each(this.splitNames(name), this.onEach, { events: this, handler: [callback, context, priority, args] });
      return this;
    },
    
    off: function(name, callback, context){
      _.each(this.splitNames(name), this.offEach, { events: this, handler: [callback, context] });
      return this;
    },
    
    onEach: function(name){
      !this.events[name] && (this.events[name] = new Phaser.Signal());
      this.events[name].add.apply(this.events[name], this.handler);
      return this;
    },
    
    offEach: function(){
      this.events[name] && this.events[name].remove.apply(this.events[name], this.handler);
      return this;
    },
    
    trigger: function(name, params){
      this[name] && this[name].dispatch(params);
      return this;
    },
    
    extend: function(options){
      for ( var key in options ) {
        options[key] && options[key].call && this.on(key, options[key], this);
      }
    }
    
  });

  return polycade.managers.events;

});
/**
 * The event/trigger manager for polycade
 */
async('polycade.screens', ['underscore', 'theory', 'Phaser', 'q', 'defiant'], function(_, t, Phaser, q, d){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};

  /**
   *
   */
  t.navigate = t.base.mix({}, {

    /**
     *
     */
    prep: function(target){
      this.i = {};
      this.i.targets = target.join ? target : [target];
      // chained items should follow us as we chain each time,
      // but still being new instances to avoid historical modifications
      this.chained = this.chained ? Object.create(this.chained) : {};
      this.chained.stored = this.chained.stored ? this._reinstanceStored() : [];
      this.chained.withRecall = this.chained.withRecall || false;
      this.chained.allowDuplicates = this.chained.allowDuplicates || false;
    },

    /**
     *
     */
    allowDuplicates: function(){
      this.chained.allowDuplicates = true;
      return this;
    },

    /**
     *
     */
    search: function(selector){
      var targets = [], stored = [], tl;
      _.each(this.i.targets, function(target, i){
        var result = JSON.search(target, selector);
        tl = targets.length;
        result && (targets = this.chained.allowDuplicates ? targets.concat(result) : _.union(targets, result));
        this._extendStored(stored, this.chained.stored[i], targets.length - tl);
      }, this);
      return this.create(targets)._setStored(stored);
    },

    /**
     *
     */
    store: function(name, callback, context){
      context = context || this;
      _.each(this.i.targets, function(target, i){
        if ( !this.chained.stored[i] ) { this.chained.stored[i] = {}; }
        this.chained.stored[i][name] = callback && callback.call
          ? callback.call(context, target, i)
          : (callback !== undefined ? callback : target)
        ;
      }, this);
      return this;
    },

    /**
     * Step each selected target and run a callback
     */
    each: function(callback, context, args){
      context = context || this;
      _.each(this.i.targets, function(target, i){
        if ( this.chained.withRecall ) {
          callback.apply(context, [target, i, this.chained.stored[i]].concat(args));
        }
        else {
          callback.apply(context, [target, i].concat(args));
        }
      }, this);
      return this;
    },

    /**
     *
     */
    enableRecall: function(){
      this.chained.withRecall = true;
      return this;
    },

    /**
     *
     */
    disableRecall: function(){
      this.chained.withRecall = false;
      return this;
    },

    /**
     *
     */
    _extendStored: function(stored, item, count){
      if ( !item ) return this;
      for ( var i=0; i<count; i++ ) {
        stored.push(item);
      }
      return this;
    },
    
    _reinstanceStored: function(){
      var i, l = this.chained.stored.length, stored = [];
      for ( i=0; i<l; i++ ) {
        stored[i] = _.extend({}, this.chained.stored[i]);
      }
      return stored;
    },
    
    _setStored: function(stored){
      this.chained.stored = stored;
      return this;
    },

    /**
     *
     */
    eachOwn: function(callback, context){
      var targets = [], stored = [], tl; context = context || this;
      _.each(this.i.targets, function(target, i){
        var result = _.map(target, function(val, key){
          callback.call(context, val, key);
          return val;
        });
        tl = targets.length;
        result && (targets = this.chained.allowDuplicates ? targets.concat(result) : _.union(targets, result));
        this._extendStored(stored, this.chained.stored[i], targets.length - tl);
      }, this);
      return this.create(targets)._setStored(stored);
    },

    /**
     *
     */
    mapOwn: function(callback, context){
      var targets = [], stored = [], tl; context = context || this;
      _.each(this.i.targets, function(target, i){
        var result = _.map(target, callback, context);
        tl = targets.length;
        result && (targets = this.chained.allowDuplicates ? targets.concat(result) : _.union(targets, result));
        this._extendStored(stored, this.chained.stored[i], targets.length - tl);
      }, this);
      return this.create(targets)._setStored(stored);
    },

    /**
     *
     */
    log: function(f){
      f ? console.log(f.apply(this)) : console.log(this.i.targets);
      return this;
    }

  });

  t.collectionNamed = t.base.mix({}, {

    prep: function(){
      this.i = {};
      this.i.items = {};
      this.events = {};
      this.events.added = new Phaser.Signal();
      this.events.removed = new Phaser.Signal();
    },

    add: function(name, val){
      if ( !this.i.items[name] ) {
        this.i.items[name] = val;
      }
      this.events.added.dispatch(name, val);
    },

    remove: function(){
      if ( this.i.items[name] ) {
        delete this.i.items[name];
      }
      this.events.removed.dispatch(name);
    },

    get: function(){
      return this.i.items;
    }

  });

  /**
   * Needs to be broken out into its own file
   */
  polycade.screen = t.base.mix(polycade.screen || {}, {

    /**
     *
     */
    prep: function(options){
      options.game && (this.game = options.game);
      if ( !this.game ) { throw new Error('please define a game property an instance of polycade.game'); }
      this.phaser = this.game.phaser;
      this.name = options.name;
      this.groups = t.collectionNamed.create();
      this.adornments = t.collectionNamed.create();
      this.baseGroup = new Phaser.Group(this.phaser);
      this.baseGroup.visible = false;
      this.handlers = t.bindCollection(this.handlers, this);
      this.groups.events.added.add(this.handlers.groupAdded);
    },

    handlers: {
      groupAdded: function(name, group){
        this.parseGroup(group);
      }
    },

    enable: function(){
      this.baseGroup.visible = true;
    },

    disable: function(){
      this.baseGroup.visible = false;
    },

    parseGroupItem: function(item){
      if ( item.sprite ) {
        t.merge(item, {
          sprite: {
            group: this.baseGroup
          }
        });
      }
      if ( item.shadow ) {
        t.merge(item, {
          shadow: {
            group: this.baseGroup
          }
        });
      }
      console.log('parseGroupItem', item);
      this.game.entities.base.create(item);
      //switch ( item.type ) {
      //  case 'adornment':
          ////
      //  break;
      //}
    },

    parseGroup: function(group){
      group.element = new Phaser.Group(this.phaser);
      this.baseGroup.add(group.element);
      var nav = t.navigate.create(group.json)
        .search('*/items')
        .each(function(item){
          var entity = {};
          if ( item['@internal'] ) { item = item['@internal']; }
          if ( item.join ) {
            t.mergeMany(entity, item);
          }
          else {
            t.merge(entity, item);
          }
          this.parseGroupItem(entity);
        }, this)
      ;
      /*
      nav
        .search('/* /definitions/*')
        .search('/* /groups')
        .eachOwn(function(val, key){
          this.groups.add(key, { json: val });
        }, this)
      */
      //group.create(100, 100, 'plant');
    },

    /**
     * Load from a JSON blob directly
     */
    loadFromJSON: function(json, baseURI){
      if ( !json.definitions ) throw new Error('unexpected format of JSON');
      return Q.Promise(this["loadFromJSON.Promise"]({
        json: json,
        baseURI: baseURI,
        loader: new Phaser.Loader(this.phaser)
      })).then(this["loadFromJSON.dataComplete"]());
    },

    /**
     *
     */
    'loadFromJSON.Promise': function(work){
      return _.bind(function(resolve, reject){

        this['loadFromJSON.jsonPreprocess'](work);

        work.resolve = resolve;
        work.reject = reject;
        work.loader.onLoadComplete.add(this['loadFromJSON.externalsComplete'](work));
        work.loader.onFileError.add(this['loadFromJSON.externalsFailed'](work));
        work.externalRefs = JSON.search(work.json, '//*[@ref and not(starts-with(@ref,"#"))]');
        work.externalFiles = {};
        _.each(work.externalRefs, this['loadFromJSON.eachDataPath'](work));
        work.loader.start();
      }, this);
    },

    /**
     *
     */
    'loadFromJSON.jsonPreprocess': function(work){
      var nav = t.navigate.create(work.json);
      nav
        .allowDuplicates()
        .search('//*[id]') // find all ids (in order)
        .store('id') // store those ids
        .search('//*[@ref]') // find all @refs that occur further down the tree from the ids
        .enableRecall() // use navigates recall ability to access the stored 'id' values
        // collect the found ids and apply them to the $ref entities for use later
        .each(function(val, key, recall){
          if ( val['@ids'] ) {
            val['@ids'].push(recall.id.id);
          }
          else {
            val['@ids'] = [recall.id.id];
          }
        })
      ;
    },

    /**
     * If for some reason, everything worked...
     */
    'loadFromJSON.externalsComplete': function(work){
      return _.bind(function(){
        var self = this;
        Q.all(_.map(work.externalFiles, this['loadFromJSON.eachExternalFile'](work)))
          .then(function(){
            self.json = work.json;
            work.internalRefs = JSON.search(work.json, '//*[@ref]');
            if ( work.internalRefs.length ) {
              _.each(work.internalRefs, function(jsonRef){
                var internalNode, ref = jsonRef['@ref'].substr(1);
                // @BADHACK: due to the way defiantjs can't handle hyphens, and converts arrays.
                // The converted structure that defiantjs uses is different for items that have a
                // hyphen in the name, to those that don't.
                ref = ref.replace(/([^\/]+\-[^\/]+)/gi, '*[@d:name="$1"]/d:item');
                ref = ref.replace(/^#\//, '');
                ref = '/*' + ref;
                internalNode = JSON.search(self.json, ref);
                if ( internalNode ) {
                  jsonRef['@internal'] = internalNode;
                }
              });
            }
            work.internalRefs.length && console.log('internal refs', work.internalRefs);
            work.resolve(self);
          })
        ;
      }, this);
    },

    /**
     * If for some reason, something failed... @TODO:
     */
    'loadFromJSON.externalsFailed': function(work){
      return _.bind(function(){
        work.reject(this);
      }, this);
    },

    /**
     * For each external JSON ref, load the requested JSON.
     */
    'loadFromJSON.eachDataPath': function(work){
      return _.bind(function(jsonRef, i){
        var item = this.jsonRefToPathItem(jsonRef), existing;
        // if we already have an external file of the same path
        if ( work.externalFiles[item.path] ) {
          existing = work.externalFiles[item.path];
          if ( existing.jsonRef.join ) {
            existing.jsonRef.push(item.jsonRef);
            existing.fragment.push(item.fragment);
          }
          else {
            existing.jsonRef = [existing.jsonRef, item.jsonRef];
            existing.fragment = [existing.fragment, item.fragment];
          }
        }
        else {
          work.externalFiles[item.path] = item;
        }
        console.log('loading', item.type, item.path);
        work.loader[item.type](item.path, item.path);
      }, this);
    },

    /**
     *
     */
    'loadFromJSON.mergeExternalFragment': function(jsonRef, jsonExternal, fragment){
      if ( fragment ) {
        var results = JSON.search(jsonExternal, '//*[id="#' + String(fragment) + '"]', true);
        if ( results && results[0] ) {
          _.extend(jsonRef, results[0]);
        }
        else {
          throw new Error('unable to find fragment', fragment);
        }
      }
      else {
        _.extend(jsonRef, jsonExternal);
      }
      delete jsonRef['@ref'];
    },

    /**
     * Step each loaded external JSON and place it as part of the requesting JSON object(s)
     */
    'loadFromJSON.eachExternalFile': function(work){
      return _.bind(function(item){
        var i;
        switch ( item.type ) {
          case 'json':
            item.json = this.phaser.cache.getJSON(item.path);
            if ( item.jsonRef.join ) {
              for ( i=0; i<item.jsonRef.length; i++ ) {
                this['loadFromJSON.mergeExternalFragment'](item.jsonRef[i], item.json, item.fragment[i]);
              }
            }
            else {
              this['loadFromJSON.mergeExternalFragment'](item.jsonRef, item.json, item.fragment);
            }
            return Q.Promise(this["loadFromJSON.Promise"]({
              json: item.json,
              baseURI: item.path,
              loader: new Phaser.Loader(this.phaser)
            }));
          break;
          case 'image':
            item.image = this.phaser.cache.getImage(item.path);
            if ( item.jsonRef.join ) {
              for ( i=0; i<item.jsonRef.length; i++ ) {
                item.jsonRef[i].cacheName = item.path;
                item.jsonRef[i].image = item.image;
                delete item.jsonRef[i]['@ref'];
              }
            }
            else {
              item.jsonRef.cacheName = item.path;
              item.jsonRef.image = item.image;
              delete item.jsonRef['@ref'];
            }
            return Q.when(item);
          break;
        }
        return Q.when(true);
      }, this);
    },

   /**
    * Process the data loaded into screen entities
    * ----------------------- YOU ARE HERE!
    */
   'loadFromJSON.dataComplete': function(){
      return _.bind(function(){
        try {
          console.log(this.json);
          var nav = t.navigate.create(this.json);
          nav
            .search('/*/definitions/*')
            .search('/*/groups')
            .eachOwn(function(val, key){
              this.groups.add(key, { json: val });
            }, this)
          ;
        } catch (ex) {console.log(ex);}
        console.log(this.groups.get());
        return this;
      }, this);
    },

    parseURL: function(url) {
      var parser = document.createElement('a'), searchObject = {}, queries, split, i;
      // Let the browser do the work
      parser.href = url;
      // Convert query string to object
      queries = parser.search.replace(/^\?/, '').split('&');
      for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
      }
      return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
      };
    },

    /**
     *
     */
    jsonRefToPathItem: function(jsonRef){

      var ref = jsonRef['@ref'], path = ref, fragment = '', parts, offset;
      if ( ref.indexOf('data://') === 0 ) {
        parts = ref.replace('data://', '/assets/data/').split('#'), type = 'unknown';
        path = parts[0];
        fragment = parts[1];
      }
      else if ( jsonRef['@ids'] ) {
        // @TODO: better id combination and path handling
        path = jsonRef['@ids'].join('').replace('data://', 'http://none/assets/data/');
        parts = this.parseURL(path);
        offset = parts.pathname.lastIndexOf('/');
        path = parts.pathname.substring(0, offset) + '/' + ref;
      }
      else {
        path = 'unknown';
      }
      switch ( true ) {
        case ref.indexOf('.json') != -1:
          type = 'json';
          break;
        case ref.indexOf('.png') != -1:
        case ref.indexOf('.jpg') != -1:
        case ref.indexOf('.jpeg') != -1:
          type = 'image';
          break;
      }
      return {
        type: type,
        jsonRef: jsonRef,
        path: path,
        fragment: fragment
      };
    },

    /**
     * There are multiple stages to loading a screen:
     * - initial screen JSON
     * - any subsequent $ref external references
     * - screen processing
     */
    load: function(game, name){
      var _screen = this.create({ name: name, game: game }), loader = new Phaser.Loader(_screen.phaser);
      return Q.Promise(function(resolve, reject){
        loader.onLoadComplete.add(function(){
          _screen.loadFromJSON(_screen.phaser.cache.getJSON(name))
            .then(resolve)
            ['catch'](reject)
          ;
        });
        loader.onFileError.add(function(){
          reject(_screen);
        });
        loader.json(name, 'assets/data/screens/' + name + '.json');
        loader.start();
      });
    },

    trash: function(){

    }

  });

  /**
   * The asset manager for polycade
   */
  polycade.managers.screens = t.base.mix(polycade.managers.screens || {}, {

    /**
     *
     */
    prep: function(options){
      options = this.options = options || {};
      this.game = this.game || options.game;
      this.entities = {};
      this.entities.screen = polycade.screen.namespace();
      this.handlers = t.bindCollection(this.handlers, this);
      this.cache = {};
      this.promises = {};
      this.phaser = this.game.phaser;
    },

    /**
     * Go off an prep everything that is required to ignite a particular
     * screen. This will do everything in the background, and not effect
     * the current screen (if any).
     */
    fetch: function(name){
      if ( this.cache[name] ) {
        // in case we prime cache from somewhere other than loading
        if ( !this.promises[name] ) {
          this.promises[name] = Q.when(this.cache[name]);
        }
        return this.promises[name];
      }
      // if we aren't cached, but we have a promise, then we are loading.
      else if ( this.promises[name] ) {
        return this.promises[name];
      }
      else {
        this.promises[name] = this.entities.screen.load(this.game, name)
          .then(this.handlers.screenLoaded)
        ;
        return this.promises[name];
      }
    },

    /**
     * Unload a screen from being managed.
     */
    unfetch: function(name){
      this.cache[name].trash();
      delete this.promises[name];
      delete this.cache[name];
    },

    handlers: {

      screenLoaded: function(screen){
        return (this.cache[name] = screen);
      }

    }

  });

  return polycade.managers.assets;

});