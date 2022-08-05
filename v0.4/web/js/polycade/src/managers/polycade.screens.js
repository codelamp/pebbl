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
     *
     */
    children: function(){
      
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
          t.merge(entity, item);
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
        var ref = String(fragment);
        var results = JSON.search(jsonExternal, '//*[id="#' + ref + '"]', true);
        if ( results && results[0] ) {
          _.extend(jsonRef, results[0]);
        }
        else {
          ref = ref.replace(/([^\/]+\-[^\/]+)/gi, '*[@d:name="$1"]/d:item');
          var results = JSON.search(jsonExternal, '//'+ ref + '', true);
          if ( results && results[0] ) {
            _.extend(jsonRef, results[0]);
          }
          else {
            throw new Error('unable to find fragment', fragment);
          }
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
        path: path.replace(/^\//, ''),// + '?nc=' + (new Date().getTime()),
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
        loader.json(name, 'assets/data/screens/' + name + '.json?nc=' + (new Date().getTime()));
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