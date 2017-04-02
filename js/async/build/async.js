/**
 * A simple async script manager, similar to requireJS, although
 * written bespokely and based on the Q promise library (for now).
 *
 * @TODO: implement a script tag check, to make sure aliased resources
 * are not loaded more than once.
 * @DONE: dislocate the code from depending on a specific promise implementation.
 * @DONE: remove defer anit-pattern
 * @TODO: tidy up and reduce code
 * @TODO: due to the way thens are tacked on inside async.def it is no longer
 *        possible to do `async('name', ['dep']).then(function(){ ... });` as
 *        the resolve function. You can still use thens that will trigger once
 *        everything is resolved. This would be good to fix, if possible.
 */
/**
 * Load scripts in the way that isn't synchronous
 */
var async = function(){
  return async.def.apply(this, arguments);
};
/**
 * Async Logging, if requested
 */
String(window.location).indexOf('debug') != -1 && (async.log = function(){
  var args = Array.prototype.slice.call(arguments); args.unshift('async', '--');
  return console.log.apply(console, args);
});
// a useful temporary object
async.tmp = {};
// reference the Promise handler, native or q-lite
async.promiser = Q || Promise || Q;
/**
 * Adds new registry definitions for async to use. This code can be called
 * in two ways. First global definitions:
 *
 *     async.registry({ ... })
 *
 * Or, related definitions:
 *
 *     async.registry(name, { ... })
 *
 * Definitions must registered in this manner in order for async to know
 * how to treat them when they are loaded.
 *
 * ### Overview
 *
 * When defining a registry, the structure can be broken down into two levels.
 *
 * ### Registry type (optional)
 *
 * First level describes the type of registry. Most of my libraries use only
 * two types currently, 'dev' and 'build'. The reason for this is that the
 * registry can change when introducing build processes, that may combine
 * separate development scripts down into one. You could theorectically use the
 * the registry type for other things however.
 *
 * For example, in the following the 'theory.example' entity is in its own
 * include in development, but when running after build it is already present
 * as part of the 'theory' definition:
 *
 *     async.registry('theory', {
 *       'dev': {
 *         'theory.example': { file: 'src/theory.example.js', asynced: true }
 *       },
 *       'build': {
 *         'theory.example': { asynced: true }
 *       }
 *     })
 *
 * Registry type only really makes sense for related definitions, those where
 * the registry is linked to a partiuclar definition name.
 *
 * ### Definitions
 *
 * The next level actually defines the items to be loaded or resolved. Each
 * item in the list should represent a naned script to load, or resolve.
 * Each high-level key represents the name of the registered item, the object
 * stored under that key holds the config for async.
 *
 * Allowable properties/formats for this object/value are:
 *
 * #### String value
 *
 * You can define the path to the script directly, without the need for a
 * wrapper config object.
 *
 *     {
 *       'theory': 'src/theory.js',
 *       'jQuery': 'vendor/jquery/jquery-min.js'
 *     }
 *
 * #### Object value, with properties
 *
 * You can also define more detailed information, using a sub object.
 *
 *     {
 *       'theory': { path: 'src/theory.js' },
 *       'jQuery': { path: 'vendor/jquery/jquery-min.js' }
 *     }
 *
 * Allowable properties of the sub object, all are optional:
 *
 * - path:
 *     A string absolute (or relative path to the rendering HTML file).
 *     The href value you would expect to see in the script tag.
 * - resolve:
 *     A function that should return the entity the script is
 *     loading i.e. `function{ return jQuery; }` useful for definitions
 *     that do not load using the async system e.g. vendor scripts
 * - asynced:
 *     A boolean to flag to tell the async system that the script to
 *     be referenced or loaded is wrapped with the async wrapped. Using
 *     the async system means dependencies can be managed, and the
 *     eventual resolved/exported item is automatically handled.
 * - file:
 *     When creating a 'related registry' you can use 'file' instead
 *     of 'path' to supply a partial path. Async will calculate the
 *     full path based on the 'base' property of the parent registry item.
 * - base:
 *     When creating a registry item that represents a bundle or package
 *     that is also controlled via the async system, you can define the
 *     base path to where the script can be found. This then used
 *     inconjunction with 'file' properties with the included bundle to
 *     correctly calculate the paths of the scripts to load.
 *   use:
 *     Defines what registry type this item should use for its registry
 *     look ups.
 *
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
    if ( base.use ) {
      if ( mixin[base.use] ) {
        mixin = mixin[base.use];
      }
      else {
        throw new Error('unimplemented use value ' + base.use);
      }
    }
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
 * Wrapper to enable switching between Promise implementations
 */
async.defer = function(){
  var resolver, rejecter, notifier, promise = async.promise(function(resolve, reject, notify){
    resolver = resolve;
    rejecter = reject;
    notifier = notify;
  });
  resolver && (promise.resolve = resolver);
  rejecter && (promise.reject = rejecter);
  notifier && (promise.notify = notifier);
  return promise;
};
/**
 * Wrapper to enable switching between Promise implementations
 */
async.promise = function(callback){
  if ( async.promiser.Promise ) {
    return async.promiser.Promise(callback);
  }
  else {
    return new async.promiser(callback);
  }
};
/**
 * Simple look up for the registry
 */
async.registry.get = function(name){
  return this._[name] || null;
};
/**
 * Simple add to the registry
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
 * Define a named entity, specifying its dependencies, and resolve functions.
 *
 * - async.def(name, func{})
 * - async.def(name, deps[], func{})
 * - async.def(name, deps[], deps[], func{})
 * - async.def(name, deps[], deps[], func{}, func{}, ...)
 */
async.def = function(name){
  async.log && async.log('async()', name);
  var i, l, args = arguments, key, item, stored = async.storeOrReference(name), data;
  stored.def = name;
  stored.list = [];
  stored.names = [];
  stored.asynced = true; // automatically assume this for now
  stored.addScript = async.addScript;
  stored.addDependency = async.addDependency;
  stored.thens = [];
  stored.defBeforeAdded = !stored.added;
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
  stored.q = async.promiser.all(stored.list);
  //console.log('>>>', stored.def, stored.q, stored.list);
  // add spreads if we have them
  for ( i=0, l=stored.thens.length; (i<l) && (item=stored.thens[i]); i++ ) {
    // spread each resolved item to an argument in the completion handler
    stored.q = stored.q.then(function(){
      return item.apply(this, arguments[0]);
    });
  }
  // if there may have been dependencies, handle triggering the resolution of them
  // resolve the dependency chain for definintion
  stored.q = stored.q.then(function(){
    if ( stored.dependencies ) {
      if ( async.log ) {
        var log = {};
        for ( var i=0; i<stored.names.length; i++ ) {
          log[stored.names[i]] = async.storeOrReference(stored.names[i]);
        }
        async.log('resolving entire dependency chain for', stored.def, 'as', log);
      }
      stored.dependencies.deferred.notify && stored.dependencies.deferred.notify(arguments);
      stored.dependencies.deferred.resolve.apply(stored.dependencies.deferred, arguments);
    }
    return arguments[0];
  });
  // reject the dependency chain
  stored.q = stored.q['catch'](function(ex){
    if ( stored.dependencies ) {
      stored.dependencies.deferred.notify('rejected');
      stored.dependencies.deferred.reject(ex);
    }
    throw ex;
  });
  // add the resolved to the end of the chain
  async.log && (stored.q = stored.q.then(function(reference){
    async.log('full completion for script', stored.def, reference);
    return reference;
  }));
  //
  //stored.q = stored.q.progress(function(){
  //  console.log('progress event fired for', stored.def, Array.prototype.slice.call(arguments, 0));
  //});
  // if this is a definition add, then we may need to extend data.dependencies
  return stored.q;
};
/**
 * Return a resolved reference by name, if it exists
 */
async.ref = function(name, fallback, overwrite){
  if ( ! async.ref.list ) {
    async.ref.list = {};
  }
  if ( async.ref.list[name] === undefined || overwrite ) {
    async.ref.list[name] = fallback;
  }
  return async.ref.list[name] || fallback;
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
  async.log && async.log('adding/referencing script', name);
  stored = async.storeOrReference(name);
  stored.added = true;
  // if we have data, but aren't "loading", set the script loading
  if ( stored.loading ) return;
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
  }
  // if we are already waiting, we can skip this set-up
  if ( !stored.waiting ) {
    // get the loader
    loader = originalLoader = async.load();
    // add a wait for any dependencies that this script relies on
    loader = loader.then(function(){
      // this is only possible if the async.def has been called prior to async.addScript
      // for the same script. This occurs when scripts have been combined into one
      // via a build process and do not need to be individually loaded.
      if ( stored.defBeforeAdded ) {
        async.log && async.log('not waiting (2) for dependencies for', name);
        return null;
      }
      else if ( stored.asynced ) {
        async.log && async.log('waiting for dependencies for', name);
        stored.dependencies = { deferred: async.defer() };
        console.log(name, stored.dependencies.deferred, stored.dependencies.deferred.resolve);
        return stored.dependencies.deferred;
      }
      else {
        async.log && async.log('not waiting for dependencies for', name);
        return null;
      }
    });
    // add the resolved to the end of the chain
    async.log && (loader = loader.then(function(){
      async.log('about to trigger the resolve for', name);
      return arguments[0];
    }));
    // add the resolver
    loader = loader.then(function(){
      stored.resolve
        ? async.log && async.log('resolving using function', name)
        : async.log && async.log('resolving using return value', name)
      ;
      return stored.resolve ? stored.resolve() : arguments[0];
    });
    loader = loader.then(function(entity){
      async.log && async.log('resolved for', name, 'as', Array.prototype.slice.call(arguments, 0));
      stored.resolved = true;
      async.ref(name, entity, true);
      return entity;
    });
    // expose the load for use with dependencies
    stored.loader = loader;
    stored.originalLoader = originalLoader;
    // the final trigger
    list.push(stored.q || loader);
  }
  if ( data ) {
    stored.waiting = false;
    stored.loading = true;
    // @TODO: do away with the clunky originalLoader
    if ( stored.path ) {
      stored.originalLoader.url(stored.path);
    }
    else {
      async.log && async.log('no path so auto-resolving', name);
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
  var self = this, stored = async.storeOrReference(name);
  if ( stored.loader && !stored.waiting ) {
    if ( this.q ) {
      // Queue already created, no more dependencies can be added.
      async.log && async.log('queue already created, cannot update dependency (1)', name, 'for', this.def);
      return;
    }
    async.log && async.log('adding dependency (1)', name, 'for', this.def);
    // the final trigger, things that have been asynced will have a stored.q
    // things that haven't should have a stored.loader
    this.list.push(stored.q || stored.loader);
    this.names.push(name);
  }
  else if ( data ) {
    async.log && async.log('adding dependency (2)', name, 'for', this.def);
    if ( data.join ) {
      !this.q && this.names.push(name);
      for ( var i=0; i<data.length; i++ ) {
        this.addScript(data[i], data[i]);
      }
    }
    else {
      this.addScript(name, data);
      !this.q && this.names.push(name);
    }
  }
  // if no data, and no loader yet, assume we need to wait for registry info
  else {
    // if we are already waiting, we just need to reference the promise
    if ( stored.waiting ) {
      async.log && async.log('already waiting for dependency', name, 'for', this.def);
      this.list.push(stored.q || stored.loader);
    }
    else {
      async.log && async.log('waiting for dependency', name, 'for', this.def);
      this.addScript(name);
    }
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
  var resolver, rejecter, urlSetter;
  var loader = async.promise(function(resolve, reject, notify){
    resolver = function(){
      async.log && async.log('script resolved');
      resolve();
    };
    rejecter = function(){
      async.log && async.log('script rejected');
      reject();
    };
    urlSetter = function(url){
      var script;
      if ( document.querySelector ) {
        script = document.querySelector('script[src="' + url + '"]');
        if ( script ) {
          return resolve(script);
        }
      }
      script = document.createElement('script');
      script.type = 'text/javascript';
      if (script.readyState){
        script.onreadystatechange = function(){
          if (script.readyState == 'loaded' || script.readyState == 'complete'){
            async.log && async.log('script loaded (ie)', url);
            script.onreadystatechange = null;
            resolve(script);
          }
        };
      }
      else {
        script.onload = function(){
          async.log && async.log('script loaded', url);
          resolve(script);
        };
      }
      script.src = url;
      (document.documentElement||document.body).appendChild(script);
      //document.getElementsByTagName("head")[0]
      async.log && async.log('injected script tag for', url);
      return null;
    };
  });
  loader.resolve = resolver;
  loader.reject = rejecter;
  loader.url = urlSetter;
  url && loader.url(url);
  return loader;
};