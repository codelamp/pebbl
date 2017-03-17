/**
 * A simple async script manager, similar to requireJS, although
 * written bespokely and based on the Q promise library (for now).
 *
 * @TODO: implement a script tag check, to make sure aliased resources
 * are not loaded more than once.
 */
var Q=Q; if ( !Q ) throw new Error('async requires q.js');
/**
 * Load scripts in the best way ;)
 */
var async = function(){
  if ( String(window.location).indexOf('debug') != -1 ) {
    async.log = function(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift('async', '--');
      return console.log.apply(console, args);
    };
  }
  if ( arguments[0] && arguments[0].substr ) {
    return async.def.apply(this, arguments);
  }
  else {
    return async.obj.apply(this, arguments);
  }
};
// reference q-lite
async.Q = Q;
/**
 * Update the registry, or pull an item from it
 */
async.registry = function(mixin){
  var key, base, item;
  if ( !this.registry._ ) {
    this.registry.waiting = {};
    this.registry._ = {};
  }
  // handle the async.registry('base-name', {...}) variant. This is
  // where a sub-registry can base its paths on another registry item
  // that implements a base: property.
  if ( arguments.length == 2 ) {
    base = async.registry.get(mixin);
    if ( !base ) {
      throw new Error('missing base for ' + mixin);
    }
    if ( !base.base ) {
      throw new Error('base property missing from base');
    }
    mixin = arguments[1];
    for ( key in mixin ) {
      if ( Object.prototype.hasOwnProperty.call(mixin, key) ) {
        item = mixin[key];
        if ( item.file ) {
          item.path = base.base + item.file;
        }
        this.registry.add(key, item);
      }
    }
  }
  // otherwise fallback to the default registry handling
  else {
    if ( Object.assign ) {
      Object.assign(this.registry._, mixin);
    }
    else {
      for ( key in mixin ) {
        if ( Object.prototype.hasOwnProperty.call(mixin, key) ) {
          this.registry.add(key, mixin[key]);
        }
      }
    }
  }
};
/**
 *
 */
async.registry.get = function(name){
  return this._[name] || null;
};
/**
 *
 */
async.registry.add = function(key, val){
  this._[key] = val;
  async.log && async.log('adding registry data for', key);
  // handle items waiting for registry information
  if ( this.waiting[key] ) {
    for ( var i=0, l=this.waiting[key].length; i<l; i++ ) {
      this.waiting[key][i]();
    }
  }
};
/**
 * Called with an object defintion of scripts
 *
 * - async.obj({ ... })
 *
 * Each item in the list should represent a script to load
 *
 * Allowable properties/formats are:
 *
 * ### string value
 *
 *     key: 'path'
 *
 * ### object value, with properties
 *
 *     key: { path: '' }
 *
 * Allowable properties of the object are:
 *
 * - path:
 *     a string absolute or relative path (as you would in the script tag)
 * - resolve:
 *     an optional function that should return the entity the script is
 *     loading i.e. function{ return jQuery; }
 * - dependencies:
 *     a boolean to flag the async processing should wait for dependencies
 *     for this script before being counted as ready.
 *
 */
async.obj = function(){
  async.log && async.log('async.obj');
  var i, l, args = arguments, key, item, ctx = {
    list: [],
    add: async.addScript,
    queue: async.queue,
    thens: []
  };
  for ( i=0, l=args.length; (i<l) && (item=args[i]); i++ ) {
    // if function, treat as thenable
    if ( item.apply ) {
      ctx.thens.push(item);
      continue;
    }
    // skip unexpected items
    if ( item.join || item.split || !isNaN(item) ) continue;
    // step the items in the object
    for ( key in item ) {
      if ( Object.prototype.hasOwnProperty.call(item, key) ) {
        ctx.add(key, item[key]);
      }
    }
  }
  // make the queue
  ctx.queue();
  // add spreads if we have them
  for ( i=0, l=ctx.thens.length; (i<l) && (item=ctx.thens[i]); i++ ) {
    // spread each resolved item to an argument in the completion handler
    ctx.q = ctx.q.spread(item);
  }
  return ctx.q;

};
/**
 * Called with a named definition for one script
 *
 * - async.def(name, func{})
 * - async.def(name, deps[], func{})
 * - async.def(name, deps[], deps[], func{})
 * - async.def(name, deps[], deps[], func{}, func{}, ...)
 *
 */
async.def = function(name){
  async.log && async.log('async.def', name);
  var i, l, args = arguments, key, item, stored = async.storeOrReference(name), data;
  stored.def = name;
  stored.list = [];
  stored.names = [];
  stored.addScript = async.addScript;
  stored.addDependency = async.addDependency;
  stored.queue = async.queue;
  stored.thens = [];
  // remove the first arg, which is name
  Array.prototype.shift.call(args);
  // loop each (possible) dependency and (possible) thenable function
  for ( i=0, l=args.length; (i<l) && (item=args[i]); i++ ) {
    // if function, treat as thenable
    if ( item.apply ) {
      stored.thens.push(item);
      continue;
    }
    // if item is a string, treat as a reference to an existing script
    if ( item.split ) {
      stored.addDependency(item);
    }
    else if ( item.join ) {
      for ( key=0; key<item.length; key++ ) {
        data = async.registry.get(item[key]);
        if ( data ) {
          stored.addDependency(item[key], data);
        }
        else {
          stored.addDependency(item[key]);
        }
      }
    }
    else {
      for ( key in item ) {
        if ( Object.prototype.hasOwnProperty.call(item, key) ) {
          stored.addDependency(key, item[key]);
        }
      }
    }
  }
  async.log && async.log('async.def', stored.def, 'queue created from', stored.list.length, 'dependencies', stored.names, stored.list);
  // create the queue
  stored.queue();
  // store the reference
  stored.q = stored.q.tap(function(entity){
    //async.reference(stored.def, entity);
  });
  // add spreads if we have them
  for ( i=0, l=stored.thens.length; (i<l) && (item=stored.thens[i]); i++ ) {
    // spread each resolved item to an argument in the completion handler
    stored.q = stored.q.spread(item);
  }
  // if there may have been dependencies, handle triggering the resolution of them
  if ( stored.asynced ) {
    // resolve the dependency chain for definintion
    stored.q = stored.q.tap(function(){
      if ( async.log ) {
        var log = {};
        for ( var i=0; i<stored.names.length; i++ ) {
          log[stored.names[i]] = async.storeOrReference(stored.names[i]);
        }
        async.log('resolving entire dependency chain for', stored.def, 'as', log);
      }
      stored.dependencies.deferred.resolve.apply(stored.dependencies.deferred, arguments);
    });
    // reject the dependency chain
    stored.q = stored.q.fail(function(ex){
      stored.dependencies.deferred.reject(ex);
    });
  }
  // add the resolved to the end of the chain
  async.log && (stored.q = stored.q.tap(function(reference){
    async.log('full completion for script', stored.def, reference);
  }));
  // if this is a definition add, then we may need to extend data.dependencies
  return stored.q;
};
/**
 * if we don't have an object stored for this name, create one
 */
async.storeOrReference = function(name){
  var stored;
  if ( !async.store ) { async.store = {}; }
  if ( !(stored = async.store[name]) ) {
    stored = async.store[name] = {};
    async.log && async.log('storing', name);
  }
  else {
    async.log && async.log('referencing', name, stored);
  }
  return stored;
};
/**
 * Called for every script that is declared in an async config object
 *
 * - This is called by async.obj for each key/value found
 */
async.addScript = function(name, data){
  var loader, originalLoader, stored, list = this.list;
  async.log && async.log('adding script', name);
  stored = async.storeOrReference(name);
  // if we have data, but aren't "loading", set the script loading
  if ( stored.loading ) return;
  // if we are already waiting, we can skip this set-up
  if ( !stored.waiting ) {
    // get the loader
    loader = originalLoader = async.load();
    // we don't know the state yet
    stored.asynced = null;
    // add a wait for any dependencies that this script relies on
    loader = loader.then(function(){
      stored.dependencies = { deferred: Q.defer() };
      stored.asynced
        ? async.log && async.log('waiting for deps', name)
        : async.log && async.log('not waiting for deps', name)
      ;
      return stored.asynced ? stored.dependencies.deferred.promise : null;
    });
    // add the resolved to the end of the chain
    async.log && (loader = loader.tap(function(){
      async.log('about to trigger the resolve for', name);
    }));
    // add the resolver
    loader = loader.then(function(){
      stored.resolve && async.log && async.log('resolving using function', name);
      return stored.resolve ? stored.resolve() : arguments[0];
    });
    async.log && (loader = loader.tap(function(){
      async.log('resolved for', name, 'as', Array.prototype.slice.call(arguments, 0));
      stored.resolved = true;
    }));
    // expose the load for use with dependencies
    stored.loader = loader;
    stored.originalLoader = originalLoader;
    // the final trigger
    list.push(loader);
  }
  // if we have been provided with data/path info, we can start now
  if ( data ) {
    // anything that is asynced should always resolve with the return value
    // of the async function
    if ( data.asynced ) {
      stored.asynced = true;
      stored.resolve = data.resolve;
    }
    // triggered for any script that isn't 'async'-ified
    else {
      stored.asynced = false;
      stored.resolve = data.resolve || async.resolver(name);
    }
    stored.path = data.substr ? data : data.path;
    stored.waiting = false;
    stored.loading = true;
    // @TODO: do away with the clunky originalLoader
    if ( stored.path ) {
      stored.originalLoader.url(stored.path);
    }
    else {
      stored.originalLoader.resolve();
    }
  }
  else {
    // otherwise we have to wait
    stored.waiting = true;
  }
};

/**
 * Only called for scripts that use a async() wrapper inside their definition
 *
 * - This is called for each dependency declared by an async wrapper call inside a script
 */
async.addDependency = function(name, data){
  async.log && async.log('adding dependency', name, 'for', this.def);
  var self = this, stored = async.storeOrReference(name);
  if ( stored.loader && !stored.waiting ) {
    // the final trigger, things that have been asynced will have a stored.q
    // things that haven't should have a stored.loader
    this.list.push(stored.q || stored.loader);
    this.names.push(name);
  }
  else if ( data ) {
    if ( data.join ) {
      this.names.push(name);
      for ( var i=0; i<data.length; i++ ) {
        this.addScript(data[i], data[i]);
      }
    }
    else {
      this.addScript(name, data);
      this.names.push(name);
    }
  }
  // if no data, and no loader yet, assume we need to wait for registry info
  else {
    async.log && async.log('waiting for dependency', name, 'for', this.def);
    this.addScript(name);
    if ( !async.registry.waiting[name] ) {
      async.registry.waiting[name] = [];
    }
    async.registry.waiting[name].push(function(){
      var data = async.registry.get(name);
      async.log && async.log('waiting ended for dependency', name);
      if ( data ) {
        self.addDependency(name, data);
      }
      else {
        throw new Error('after waiting, data still not available for' + name);
      }
    });
  }
};
/**
 *
 */
async.queue = function(){
  return (this.q = Q.all(this.list));
};
/**
 * Return a default resolve function, incase one isn't specified by the user
 */
async.resolver = function(name){
  return function(){
    var global = (function(){return this;}());
    return global[name];
  };
};
/**
 * Async loader, but using script tag for full browser support
 */
async.load = function(url){
  var d = Q.defer(), loader = d.promise;
  loader.resolve = function(){d.resolve();};
  loader.reject = function(){d.reject();};
  loader.url = function(url){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState){
      script.onreadystatechange = function(){
        if (script.readyState == 'loaded' || script.readyState == 'complete'){
          async.log && async.log('script loaded (ie)', url);
          script.onreadystatechange = null;
          d.resolve();
        }
      };
    }
    else {
      script.onload = function(){
        async.log && async.log('script loaded', url);
        d.resolve();
      };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
    async.log && async.log('injected script tag for', url);
  };
  url && loader.url(url);
  return loader;
};