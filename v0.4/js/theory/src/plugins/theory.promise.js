async('theory.plugins.promise', ['theory'], function(theory){

  var t = theory; theory.plugins = theory.plugins || {};

  /*
   * Simple promise wrapper
   *
   * @TODO: an old implementation that could be improved to replace Q?
   * or perhaps Q will replace this. I've copied it here just to keep for now.
   *
   * @namespace
   */
  t.plugins.promise = t.creator.callable({
    
    i: {},
    
    /*
     * Create a new promise
     */
    create: function(resolution){
      return this.prep.apply(Object.create(this), arguments);
    },
    
    /*
     * Create a list of promises that can be pushed to. The promises
     * will then be converted to either a Promise.all or Promise.race
     */
    list: t.creator.callable({
      
      i: {
        promises: null
      },
      
      prep: function(){
        this.i = Object.create(this.i);
        this.i.promises = [];
        return this;
      },
      
      add: function(item){
        this.i.promises.push( is.promise(item) ? item : new Promise(item) );
        return this;
      },
      
      getAll: function(){
        return Promise.all.call(Promise, this.i.promises);
      },
      
      getRace: function(){
        return Promise.race.call(Promise, this.i.promises);
      },
      
      get: function(){
        
      }
      
    }),
    
    prep: function(resolution){
      var self = this;
      this.i = Object.create(this.i);
      if ( resolution ) {
        this.i.resolution = function(resolve, reject){
          self.i.resolve = resolve;
          self.i.reject = reject;
          resolution && resolution.apply(self, arguments);
        };
        this.i.promise = new Promise(this.i.resolution);
      }
      return this;
    },
    
    then: function(resolved, rejected){
      if ( this.i.then ) {
        var i, a = this.i.then.slice(0), l = a.length;
        this.i.then.length = 0;
        for ( i=0; i<l; i++ ) {
          this.then.apply(this, a[i]);
        }
      }
      if ( arguments.length ) {
        if ( this.i.promise ) {
          this.i.promise.then.apply(this.i.promise, arguments);
        }
        else {
          if ( !this.i.then ) { this.i.then = []; }
          this.i.then.push(arguments);
        }
      }
      return this;
    },
    
    resolve: function(){ /// @TODO: chech that the promise isnt already resolved.
      if ( this.i.resolve ) {
        this.i.resolve.apply(null, arguments);
      }
      else {
        this.i.promise = Promise.resolve.apply(Promise, arguments);
        this.then();
      }
      return this;
    },
    
    reject: function(){
      if ( this.i.resolve ) {
        this.i.reject.apply(null, arguments);
      }
      else {
        this.i.promise = Promise.reject.apply(Promise, arguments);
        this.then();
      }
      return this;
    },
    
    getPromise: function(){
      return this.i.promise;
    }
    
  });
  
  return t.plugins.promise;
  
});