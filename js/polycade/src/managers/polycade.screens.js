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

    prep: function(target){
      this.i = {};
      this.i.targets = target.join ? target : [target];
    },

    search: function(selector){
      var targets = [];
      _.each(this.i.targets, function(target, i){
        var result = JSON.search(target, selector);
        console.log(i, result, target, selector);
        result && (targets = _.union(targets, result));
      });
      return t.navigate.create(targets);
    },

    eachOwn: function(callback, context){
      var targets = []; context = context || this;
      _.each(this.i.targets, function(target, i){
        var result = _.map(target, function(val, key){
          callback.call(context, val, key);
          return val;
        });
        result && (targets = _.union(targets, result));
      });
      return t.navigate.create(targets);
    },

    mapOwn: function(callback, context){
      var targets = []; context = context || this;
      _.each(this.i.targets, function(target, i){
        var result = _.map(target, callback, context);
        result && (targets = _.union(targets, result));
      });
      return t.navigate.create(targets);
    },

    log: function(){
      console.log(this.i.targets);
      return this;
    }

  });

  t.collectionNamed = t.base.mix({}, {

    prep: function(){
      this.i = {};
      this.i.items = {};
    },

    add: function(name, val){
      if ( !this.i.items[name] ) {
        this.i.items[name] = val;
      }
    },

    remove: function(){
      if ( this.i.items[name] ) {
        delete this.i.items[name];
      }
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
      this.name = options.name;
      this.game = options.game;
      this.phaser = options.game.phaser;
      this.groups = t.collectionNamed.create();
      this.adornments = t.collectionNamed.create();
    },

    /**
     * Load from a JSON blob directly
     */
    loadFromJSON: function(json){
      if ( !json.definitions ) throw new Error('unexpected format of JSON');
      return Q.Promise(this["loadFromJSON.Promise"]({
        json: json,
        loader: new Phaser.Loader(this.phaser)
      })).then(this["loadFromJSON.dataComplete"]());
    },

    /**
     *
     */
    'loadFromJSON.Promise': function(work){
      return _.bind(function(resolve, reject){
        work.resolve = resolve;
        work.reject = reject;
        work.loader.onLoadComplete.add(this['loadFromJSON.externalsComplete'](work));
        work.loader.onFileError.add(this['loadFromJSON.externalsFailed'](work));
        work.externalRefs = JSON.search(work.json, '//*[starts-with(@ref,"data://")]');
        work.externalFiles = {};
        _.each(work.externalRefs, this['loadFromJSON.eachDataPath'](work));
        work.loader.start();
      }, this);
    },

    /**
     * If for some reason, everything worked...
     */
    'loadFromJSON.externalsComplete': function(work){
      return _.bind(function(){
        var self = this;
        Q.all(_.map(work.externalFiles, this['loadFromJSON.eachExternalFile'](work))).then(function(){
          self.json = work.json;
          work.resolve(self);
        });
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
                _.extend(item.jsonRef[i], item.json);
              }
            }
            else {
              _.extend(item.jsonRef, item.json);
            }
            return Q.Promise(this["loadFromJSON.Promise"]({
              json: item.json,
              loader: new Phaser.Loader(this.phaser)
            }));
          break;
          case 'image':
            item.image = this.phaser.cache.getImage(item.path);
            if ( item.jsonRef.join ) {
              for ( i=0; i<item.jsonRef.length; i++ ) {
                item.jsonRef[i].cacheName = item.path;
                item.jsonRef[i].image = item.image;
              }
            }
            else {
              item.jsonRef.cacheName = item.path;
              item.jsonRef.image = item.image;
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
         var nav = t.navigate.create(this.json);
         nav
           .search('/*/definitions/*').log()
           .search('/*/groups').log()
           .mapOwn(function(val, key){
             this.groups.add(key, val);
             return {
               name: key,
               data: val
             };
           }, this)
          ;
       } catch (ex) {console.log(ex);}
       console.log(this.groups.get());
       return this;
     }, this);
   },

    /**
     *
     */
    jsonRefToPathItem: function(jsonRef){
      // @TODO:
      var parts = jsonRef['@ref'].replace('data://', '/assets/data/').split('#'), type = 'unknown';
      switch ( true ) {
        case jsonRef['@ref'].indexOf('.json') != -1:
          type = 'json';
          break;
        case jsonRef['@ref'].indexOf('.png') != -1:
        case jsonRef['@ref'].indexOf('.jpg') != -1:
        case jsonRef['@ref'].indexOf('.jpeg') != -1:
          type = 'image';
          break;
      }
      return {
        type: type,
        jsonRef: jsonRef,
        path: parts[0],
        fragment: parts[1]
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

      var game = options.game;

      this.entities = {};
      this.entities.screen = polycade.screen.namespace('polycade-' + game.id);

      this.handlers = t.bindCollection(this.handlers, this);

      this.cache = {};
      this.promises = {};
      this.game = game;
      this.phaser = game.phaser;
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