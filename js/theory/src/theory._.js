async.registry('theory', {
  src: {
    // plugins have a dependency on 'theory'
    'theory.plugins.array':      { file: 'src/plugins/theory.array.js',     asynced: true },
    'theory.plugins.events':     { file: 'src/plugins/theory.events.js',    asynced: true },
    'theory.plugins.transform':  { file: 'src/plugins/theory.transform.js', asynced: true },
    'theory.plugins.creator':    { file: 'src/plugins/theory.creator.js',   asynced: true },
    'theory.plugins.broadcast':  { file: 'src/plugins/theory.broadcast.js', asynced: true },
    'theory.plugins.expreg':     { file: 'src/plugins/theory.expreg.js',    asynced: true },
    // all others assume to be loaded simultaneously with 'theory' as part of the package
    'theory.is':                 { file: 'src/theory.is.js',                asynced: true },
    'theory.has':                { file: 'src/theory.has.js',               asynced: true },
    'theory.to':                 { file: 'src/theory.to.js',                asynced: true },
    'theory.base':               { file: 'src/theory.base.js',              asynced: true },
    'theory.run':                { file: 'src/theory.run.js',               asynced: true }
  },
  build: {
    // plugins have a dependency on 'theory'
    'theory.plugins.array':      { file: 'build/plugins/theory.array.min.js',     asynced: true },
    'theory.plugins.events':     { file: 'build/plugins/theory.events.min.js',    asynced: true },
    'theory.plugins.transform':  { file: 'build/plugins/theory.transform.min.js', asynced: true },
    'theory.plugins.creator':    { file: 'build/plugins/theory.creator.min.js',   asynced: true },
    'theory.plugins.broadcast':  { file: 'build/plugins/theory.broadcast.min.js', asynced: true },
    'theory.plugins.expreg':     { file: 'build/plugins/theory.expreg.min.js',    asynced: true },
    // all others assume to be loaded simultaneously with 'theory' as part of the package
    'theory.is':                 { asynced: true },
    'theory.has':                { asynced: true },
    'theory.to':                 { asynced: true },
    'theory.base':               { asynced: true },
    'theory.run':                { asynced: true }
  }
});

/**
 * Theory is just a framework for other plugin scripts
 */
async('theory', ['underscore'], ['theory.is', 'theory.has', 'theory.to', 'theory.base', 'theory.run'], function(_, is, has, to, base, run){

  var theory = async.ref('theory', {}), t = theory;
      theory.plugins = theory.plugins || {};
      theory.global = this || (function(){return this;})();
      theory.undefined = undefined;

  /**
   * Extend `a` with properties in `b`, with optional `options`.
   *
   * @memberof! theory
   * @method
   * @param {Object} a Destination object
   * @param {Object} b Source object
   * @param {Object} [options] Modify the behaviour with options
   * @param {Boolean} [options.overwrite] Properties in `b` that collide in `a` will overwrite.
   * @param {Boolean} [options.debug] Output the keys found in `b` as we go.
   */
  theory.extend = function(a, b, options){
    for ( var i in b ) {
      if ( a[i] === undefined || (options && options.overwrite) ) {
        if ( options && options.debug ) { console.log(i); }
        if ( options && options.each ) {
          a[i] = options.each(b[i], i);
        }
        else {
          a[i] = b[i];
        }
      }
      else {
        t.extend(a[i], b[i]);
      }
    }
    return a;
  };

  theory.extend(t, {

    /**
     * Simple logging wrapper that checks for console existence before use.
     *
     * @memberof! theory
     * @method
     */
    log: function(obj, name){
      name && console.groupCollapsed(name);
      console.dir && console.dir(obj);
      name && console.groupEnd();
    },


    /**
     * A wrapped implementation of defineProperty.
     *
     * @memberof! theory
     * @method
     */
    define: function(context, attribute, desc){
      if ( !Object.defineProperty ) return false;
      return Object.defineProperty(context, attribute, desc);
    },

    /*
     * Simple binding method
     *
     * @memberof! theory
     * @method
     */
    bind: function( method, context ){
      var f = function(){
        return method.apply(context||this, arguments);
      };
      /// @TODO: should we honor additional attributes on functions here?
      f.bound = method;
      return f;
    },

    /**
     * Bind a group of items to one context
     *
     * @memberof! theory
     * @method
     */
    bindCollection: function( collection, context, collect ){
      var i, bound = collect || {};
      for ( i in collection ) {
        if ( collection.hasOwnProperty ) {
          if ( collection.hasOwnProperty(i) && is.callable(collection[i]) ) {
            bound[i] = t.bind(collection[i], context);
          }
        }
        else if ( is.callable(collection[i]) ) {
          bound[i] = t.bind(collection[i], context);
        }
      }
      return bound;
    },

    /*
     * Bind layered collections all at once.
     *
     * @memberof! theory
     * @method
     * @todo this needs implentation -- or deletion.
     */
    bindCollectionRecursive: function(){},

    /**
     * Unbind a specific bound method, bound by t.bind
     *
     * @memberof! theory
     * @method
     */
    unbind: function( method ){
      if ( method.bound ) {
        return method.bound;
      }
    },

    /*
     * make a primitive into a primitive object
     *
     * @TODO: Look into whether this is needed any more, it may be that
     * assignement to the primitive will create a primitive object.
     *
     * @TODO: Support for undefined, NaN and null.
     */
    promotePrimitive: function(o){
      var po = o;
      switch ( typeof o ) {
        case 'number':  po = new Number(o); break;
        case 'boolean': po = new Boolean(o); break;
        case 'string':  po = new String(o); break;
      }
      if ( po !== o ) {
        po.original = o;
      }
      return po;
    },

    /*
     * Simple code to step along an object structure
     * without tripping warnings.
     */
    step: function(obj){
      if ( !obj ) return null;
      for ( var i=1, a=arguments, l=a.length; obj && (i<l); i++ ) {
        obj = obj[a[i]];
      }
      return obj;
    },

    /**
     * Limit a method to only being called again after a timelimit
     */
    timelimit: function( method, limit, getNow ){
      return function(){
        var n = getNow();
        if ( !method.lastCalled || ((n - method.lastCalled) > limit) ) {
          method.lastCalled = n;
          method.lastReturn = method.apply(this, arguments);
          return method.lastReturn;
        }
        else {
          return method.lastReturn || null;
        }
      };
    },

    /**
     * A bit like a hybrid between clone and extend.
     *
     * Will work recursively switching out everything with a new reference.
     *
     * This code will ignore primitives.
     *
     * it is designed to be used to "clone" creator's internal i objects.
     *
     * @todo investigate the difference of behaviour been hasOwnProp and not.
     * @todo implement clones for other types of reasonable objects i.e. Date?
     */
    dereference: function(a, options){
      var i, dereference = this.dereference;
      if ( is.object(a) ) {
        var b = {};
        for ( i in a ) {
          a[i] && (b[i] = dereference.call(this, a[i]));
        }
        return b;
      }
      else if ( is.array(a) && !a.ignoreDereference ) {
        b = [];
        for ( i=0, l=a.length; i<l; i++ ) {
          b[i] = a[i] ? dereference.call(this, a[i]) : a[i];
        }
        return b;
      }
      else if ( is.callable(a) ) {
        b = function(){return a.apply(this, arguments);};
      }
      return a;
    },

    /*
     *
     */
    callableReference: function(ref){
      return function(){ return ref; };
    },

    /**
     * Temporary function to handle errors, currently just throws them for now.
     *
     * @memberof! theory
     * @method
     * @param {Error} e The `Error()` object to handle.
     * @return {Void} This function throws an error, so does not return anything.
     */
    error: function(e){
      throw e;
    },

    /**
     * Create a wrapped method. The function passed as `method` is expected to return a closure.
     * It is the closure that will actually be returned by this code, keeping the `wrapper` object
     * trapped within its scope.
     *
     * You can specify an optional context for the wrapper to be called with, otherwise it'll
     * default to `t.global`.
     *
     * @memberof! theory
     * @type {Function}
     * @param {Function} method
     * @param {Object} wrapper
     * @param {Any} [context=t.global]
     * @return {Function}
     * @example
     *     var a = t.wrapper(function(data){
     *       return function(){
     *         return data.wrappedInfo;
     *       };
     *     },{
     *       wrappedInfo: 'that will be trapped in scope'
     *     });
     *
     *     a(); /// 'that will be trapped in scope'
     */
    wrapper: function(method, wrapper, context){
      var args;
      if ( wrapper && wrapper.join ) {
        args = wrapper;
      }
      else if ( wrapper ) {
        args = [wrapper];
      }
      if ( method && method.apply ) {
        return method.apply(context||t.global, args||[{}]);
      }
      return null;
    }

  });

  /**
   * Create a method with some special abilities:
   *
   * 1. Add attributes to the method, treating the function as an object.
   * 2. Implement argument overloading.
   * 3. Implement arguments translating to an args object.
   * 4. Add a `.clone()` method to the function, for easy duplication.
   *
   * @memberof! theory
   * @method
   * @param {Object} desc An object that describes the desired method behaviour.
   * @param {Object} context
   * @param {Object} attribute
   * @return {Function} A formulated method that handles requested abilities and ultimately calls any code passed in via `desc`.
   *
   * @todo expose the description object in some way from the returned method, although don't call it ".description" because that interfered with the `.namespace()` code
   */
  theory.method = function(desc, context, attribute){
    var method, argsToArray = Array.prototype.slice, argsHandler;
    if ( desc.defaults ) {
      argsHandler = function(args){
        args = argsToArray.call(args, 0);
        /// if we have an array of defaults
        if ( desc.defaults.length ) {
          while ( args.length <= desc.defaults.length ) {
            args[args.length] = desc.defaults[args.length];
          }
        }
        return args;
      };
    }
    if ( desc.call ) {
      method = function(){
        var args = argsHandler ? argsHandler(arguments) : arguments;
        return desc.call.apply(context||this, args);
      };
      //method.toSource = function(){
      //  return String(desc.call);
      //};
    }
    /// @TODO: call or method? choose one!
    else if ( desc.method ) {
      if ( is.callable(desc.method) ) {
        method = function(){
          var args = argsHandler ? argsHandler(arguments) : arguments;
          return desc.method.apply(context||this, args);
        };
      }
      else {

      }
    }
    else if ( desc.overloads ) {
      method = t.overload(desc.overloads);
    }
    if ( desc.attributes ) {
      method = t.extend(method, desc.attributes, { overwrite: true });
    }
    if ( method ) {
      /// create a cloned method based on the original description
      method.clone = function(context2){ return t.method(desc, context2||context); };
    }
    else {
      throw new Error('method failed creation. ' + JSON.stringify(desc));
    }
    /// process after everything else is setup
    if ( is.callable(desc.after) ) {
      desc.after(desc);
    }
    return method;
  };

  /**
   * Take an object and clone it shallow or deep.
   *
   * @example
   * var a = {a:{b:{c:123}}}, b = t.clone(a);
   * console.log(a === b, a.a === b.a); // false, true
   *
   * @example
   * var c = t.clone(a, true);
   * console.log(a === b, a.a === c.a, a.a.b.c === c.a.b.c); // false, false, false
   *
   * @memberof! theory
   * @method
   */
  theory.clone = t.method({
    hint: 't.clone',
    defaults: [null, false, 0],
    required: [true],
    method: function(obj, deep, level){
      if ( is['void'](obj) ) { obj = this; } /// @TODO: default deep?
      var key, dup;
      if ( !level || (deep && deep.call && deep.call(obj, obj, level)) || deep === true || (is.number(deep) && (deep < level)) ) {
        switch ( true ) {
          //
          case is.element(obj):
            dup = obj.cloneNode();
          break;
          //
          case is.object(obj):
            if ( is.bool(obj) ) { dup = new Boolean(obj); }
            else if ( is.number(obj) ) { dup = new Number(obj); }
            else if ( is.string(obj) ) { dup = new String(obj); }
            else if ( is.literalObject(obj) ) { dup = {}; }
            else {
              try { console.warn('unable to clone', obj); } catch(ex){};
              throw new Error('unable to clone object, see console for details.');
            }
            for ( key in obj ) {
              if ( !Object.prototype.hasOwnProperty || Object.prototype.hasOwnProperty.call(obj, key) ) {
                if ( level < 10 ) {
                  dup[key] = t.clone(obj[key], deep, level+1);
                }
              }
            }
          break;
          //
          case is.array(obj):
            dup = [];
            for ( key=0, l=obj.length; key<l; key++ ) {
              dup.push(t.clone(obj[key], deep, level+1));
            }
          break;
          //
          default:
            dup = obj;
          break;

        }
      }
      else {
        dup = obj;
      }
      return dup;
    }
  });

  /*
   * Borrow -- allows functionality of other objects to be attached
   * elsewhere.
   *
   *   E.g. Borrow all the "own keyed" values from a to b
   *
   *   t.borrow().all()
   *     .from(a)
   *     .giveTo(b)
   *   ;
   *
   *   E.g. Proxy and bind array methods 'push' and 'shift' on to another object.
   *
   *   var b = { list:[] };
   *
   *   t.borrow('push', 'shift')
   *     .preserveContext()
   *     .from(b.list)
   *     .giveTo(b)
   *   ;
   *
   *   E.g. Or actually use the array methods from the context of b
   *
   *   var b = {};
   *
   *   t.borrow('push', 'shift')
   *     .from(Array.prototype)
   *     .giveTo(b)
   *   ;
   */
  theory.borrow = t.wrapper(function(){
    var borrow = {
      i: {
        all: null,
        src: null,
        dst: null,
        ctx: null,
        items: null
      },
      from: function(source){
        this.i.src = arguments.length > 1 ? arguments : [source];
        return this;
      },
      all: function(v){
        this.i.all = (arguments.length && !v) ? false : 1;
        return this;
      },
      allOwn: function(v){
        this.i.all = (arguments.length && !v) ? false : 2;
        return this;
      },
      preserveContext: function(){
        this.i.ctx = true;
        return this;
      },
      withContext: function(context){
        this.i.ctx = context;
        return this;
      },
      giveTo: function(dest, modifier){
        this.i.dst = arguments.length > 1 ? arguments : [dest];
        this.apply(modifier);
        return this;
      },
      not: function(){
        /// @TODO: need to not()
        return this;
      },
      applyItem: function(obj, key, val, modifier){
        if ( modifier ) {
          val = modifier(obj, key, val);
        }
        /// create our borrowed item in terms of context
        if ( val && val.bind ) {
          val = this.i.ctx ? val.bind(this.i.ctx === true ? obj : this.i.ctx) : val;
        }
        /// shortcut for one destination
        if ( this.i.dst.length == 1 ) {
          this.i.dst[0][key] = val;
        }
        else {
          /// long cut for multiple dests
          /// step and apply to each destination
          for ( var a=this.i.dst, l=a.length, i=0, r; (r=a[i]),(i<l); i++ ) {
            r[key] = val;
          }
        }
      },
      apply: function(modifier){
        var r,a,i,l, rr,aa,ii,ll, m;
        if ( this.i.all ) {
          for ( a=this.i.src, l=a.length, i=0; (r=a[i]),(i<l); i++ ) {
            for ( aa in r ) {
              if ( this.i.all === 1 || Object.prototype.hasOwnProperty.call(r, aa) ) {
                if ( (m=r[aa]) ) {
                  this.applyItem(r, aa, m, modifier);
                }
              }
            }
          }
        }
        else if ( this.i.items ) {
          for ( a=this.i.items, l=a.length, i=0; (r=a[i]),(i<l); i++ ) {
            /// step each source until we find the item to borrow
            for ( aa=this.i.src, ll=aa.length, ii=0; (rr=aa[ii]),(ii<ll); ii++ ) {
              if ( (m=rr[r]) ) {
                this.applyItem(rr, r, m, modifier);
              }
            }
          }
        }
        return this;
      }
    };
    /// the actual function returned
    return function(first){
      var obj = Object.create(borrow);
          obj.i = t.dereference(obj.i);
          obj.i.items = (first && first.join) ? first : arguments;
      return obj;
    };
  });

  return theory;

});