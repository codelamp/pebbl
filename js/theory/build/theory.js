async('theory.is', function(){

  /**
   * Check that stuff is what it should be, or perhaps not what it isn't.
   *
   *     if ( is.string(randomVariable) ) {
   *       /// do something here?
   *     }
   *     else if ( is.not.array(randomVariable) ) {
   *       /// do something else?
   *     }
   *
   * The current definition of "is" methods are integral to theory.js. You
   * can change their behaviour but this may cause theory code to do strange
   * and unimaginable things -- it could also just cause it to error and throw
   * wobblies all the time too.
   *
   * This is the reason for `is.what.type()` -- this is a system designed
   * to be used by external code. The way items are identified can be
   * changed without causing internal theory issues.
   *
   *     if ( is.what.type(randomVariable, 'string' ) {
   *       /// you can change how string is compared by redefining the `is.what.types` array
   *     }
   *
   * Obviously, it is unlikely that you would alter or even use `is.what.type`
   * for simple types -- you may as well use `is.string`.
   *
   * However `is.what.type` can be extended to cater for any type detection.
   *
   * ##### TODOs
   * 1. introduce namespacing to `is` so that separate code in the same environment cannot intefere.
   *
   * @namespace is
   * @todo: introduce namespacing to `is` so that separate code in the same environment cannot intefere.
   */
  var is = (function( undefined ){

    var is = {

      /**
       * Check that an item quacks like an array.
       *
       * @static
       * @method is.array
       * @param {any} item
       * @return {Boolean} returns true if item has `.join` method
       */
      array: function(item){
        return (item && item.join) ? true : false;
      },
      /**
       * Check that an item is "array like", meaning that it can most likely be treated
       * in the simplest sense as an array. This does not cover checking that it supports
       * array methods i.e. like `slice` or `push`; just the fact that the object has a
       * numeric key structure i.e. `item[0]`, and `.length`
       *
       * This will fail for array-likes that are empty -- this is because we can only
       * check that `.length` is a number -- which is far too open. A special case
       * is made for an arguments object, because we can detect those by checking `.toString()`.
       *
       * I fully expect this method to be expanded as this code encounters other
       * array-likes, e.g. node lists.
       *
       * @method is.arraylike
       * @param {any} item
       * @return {Boolean} returns true if item has `.length` and `[0]`, or `is.array()`, or `is.arguments()`
       */
      arraylike: function(item){
        return ((item && item.length && typeof item[0] !== 'undefined')
          || is.array(item)
          || is.arguments(item))
        ? true : false;
      },
      /**
       * Check that an item is an `Arguments` object.
       *
       * @static
       * @method is.arguments
       * @param {any} item
       * @return {Boolean} returns true if item has `.length` that is a number and reports
       * as `[object Arguments]` when `.toString()-ed`.
       */
      arguments: function(item){
        return item && is.number(item.length) && (Object.prototype.toString.call(item) === '[object Arguments]') ? true : false;
      },
      /**
       * Check that an item quacks like a string.
       *
       * @static
       * @method is.string
       * @param {any} item
       * @return {Boolean} returns true if item has .charAt method
       */
      string: function(item){
        return (typeof item != 'undefined' && item.charAt) ? true : false;
      },
      /**
       * Check that an item reports as a number.
       *
       * @static
       * @method is.number
       * @param {any} item
       * @return {Boolean} returns true if item is `typeof number` (or has been constructed by `Number`)
       */
      number: function(item){
        return ((typeof item == 'number') || (item && item.constructor === Number)) ? true : false;
      },
      /**
       * Check that an item reports as a boolean.
       *
       * @static
       * @method is.bool
       * @param {any} item
       * @return {Boolean} returns true if item is `typeof boolean` (or has been constructed by `Boolean`)
       */
      bool: function(item){
        return ((typeof item == 'boolean') || (item && item.constructor === Boolean)) ? true : false;
      },
      /**
       * Check that an item reports as a literal object, in the sense that it has been constructed
       * directly by `{}`.
       *
       * @static
       * @method is.literalObject
       * @param {any} item
       * @return {Boolean} returns true if item has a `.constructor` of Object
       */
      literalObject: function(item){
        return (typeof item === 'object') && (item.constructor === Object) ? true : false;
      },
      /**
       * Check that an item is an object. In JavaScript this is almost pointless.
       *
       * @static
       * @method is.object
       * @param {any} item
       * @return {Boolean} returns true if item reports as `typeof object`
       */
      object: function(item){
        return (typeof item === 'object');
      },
      /**
       * Check that an item is callable.
       *
       * @static
       * @method is.callable
       * @param {any} item
       * @return {Boolean} returns true if the item has `.call` and `.apply` methods
       */
      callable: function(item){
        return (item && item.call && item.apply) ? true : false;
      },
      /**
       * Check that an item quacks like an element.
       *
       * @static
       * @method is.element
       * @param {Element} item
       * @return {Boolean} returns true if the item has getElementsByTagName
       */
      element: function(item){
        return !!item.getElementsByTagName;
      },
      /**
       * Check that an item is a stored version of undefined. Stored because
       * JavaScript allows a local variable to be created called "undefined"
       * which will override the value. Obviously this doesn't avoid any
       * changes made to undefined before is.js is evaluated.
       *
       * @static
       * @method is.undefined
       * @param {any} item
       * @return {Boolean} returns true if the item === a stored version of undefined
       */
      undefined: function(item){
        return item === undefined;
      },
      /*
       * See undefined, but reverse your thinking.
       *
       * @static
       * @method is.defined
       * @param {any} item
       * @return {Boolean} returns true if the item !== a stored version of undefined
       */
      defined: function(item){
        return item !== undefined;
      },
      /**
       * Check that an item quacks like a promise.
       *
       * @static
       * @method is.promise
       */
      promise: function(item){
        return !!item && !!item.then;
      },
      /**
       * Check that an item is null. This really is just for nice readability.
       *
       * @static
       * @method is.null
       * @param {null} item
       * @return {Boolean} returns true if item === null
       */
      "null": function(item){
        return item === null;
      },
      /**
       * Check that item is a range of null values.
       *
       * @static
       * @method is.void
       * @param {null|undefined|NaN} item
       * @return {Boolean} returns true if item is NaN, undefined or null.
       */
      "void": function(item){
        return (typeof item === 'number') && isNaN(item) || (item === undefined) || (item === null);
      },
      /**
       * Check that an item is specifically the type NaN.
       *
       * @static
       * @method is.NaN
       * @param {NaN} item
       * @return {Boolean} returns true if item reports as a number, but is also isNaN.
       */
      "NaN": function(item){
        return (typeof item == 'number') && isNaN(item);
      },
      /**
       * A primitive accounts for numbers, booleans, strings, undefined, NaN and null
       *
       * @static
       * @method is.primitive
       * @param {any} item
       * @return {Boolean} returns true if item reports as not being typeof object
       */
      primitive: function(item){
        return (typeof item !== 'object');
      },
      /**
       * A primitive object accounts for primitives that have been wrapped with
       * their object counterpart
       *
       * @static
       * @method is.primitiveObject
       * @param {any} item
       * @return {Boolean} returns true if item is typeof an object, but its valueOf() reports as not being an object.
       */
      primitiveObject: function(item){
        return (typeof item === 'object') && !!item.valueOf && typeof item.valueOf() !== 'object';
      },
      /**
       * A simple test against the current, or passed in hostname -- I'm not sure
       * why this is here? I guess something used to use it... will have to find it.
       *
       * Accepts a list of locations to test. If a location starts with a dot, then
       * it will be an ends with match. If no dot, then it will be a starts with match.
       *
       * @static
       * @method is.hostname
       * @param {Array|String} locations
       * @param {String} hostname
       * @return {Boolean} returns true if a match is found between a location and hostname.
       */
      hostname: function(locations, hostname){
        !hostname && (hostname = String(window.location.host));
        !locations && (locations = []);
        if ( is.string(locations) ) { locations = [locations]; }
        for ( var p, a=locations, i=0, l=a.length, h=hostname; i<l; i++ ) {
          if ( (p = h.indexOf(a[i])) != -1 ) {
            /// if we have a dot, use an ends with match.
            if ( a[i].charAt(0) === '.' ) {
              return (p === h.length - a[i].length);
            }
            /// otherwise treat starts with match
            else if ( p === 0 ) {
              return true;
            }
          }
        }
        return false;
      },
      /**
       * Check to see if html, when parsed by the browser, doesn't change
       *
       * @static
       * @method is.markupNormalized
       * @param {String} markup
       * @return {Boolean} returns true if the mark was normalised.
       */
      markupNormalized: function(markup){
        return t.normalizeMarkup(markup) === markup; ///@TODO: This depends on theory.js
      },
      /**
       * The obligatory search for emptiness. Basically tests to see if an item is "empty"
       * Where emptiness can mean different things for different types.
       *
       * @static
       * @method is.empty
       * @param {any} item
       * @return {Boolean} returns true if deemed empty
       */
      empty: function(item){
        if ( !item ) return true;
        if ( is.number(item.length) ) {
          return !item.length;
        }
        else if ( is.primitive(item) ) {
          return !item;
        }
        //else if ( is.primitiveObject(item) ) {
        //  return !item.valueOf();
        //}
        else {
          for ( var key in item ) {
            if ( !Object.prototype.hasOwnProperty || Object.prototype.hasOwnProperty.call(item, key) ) {
              return false;
            }
          }
          return true;
        }
      },

      /**
       * You always have to know where (and what) your towel is.
       *
       * @static
       * @method is.towel
       * @param {any} item
       * @return {Boolean} returns true if you know what six times nine is.
       */
      towel: function(item){
        return item === 42;
      }

    };

    var i, createNot = function(method){
      return function(){ return !method.apply(this, arguments); };
    };

    is.not = {};
    for ( i in is ) { is.not[i] = createNot(is[i]); }

    return is;

  })( undefined );

  /**
   * Determines what has been passed as `desc`, up to a certain depth.
   *
   * This uses the {@linkcode is.what.type} method to determine types, but
   * the `depth` parameter exists to help when describing arrays.
   *
   * For example, if you pass the following:
   *
   *     is.what.type([123, 'test']);
   *
   * This will report `array` rather than the `number, string` you might've
   * been hoping for. Instead use:
   *
   *     is.what([123, 'test'], 1); // ['number', 'string']
   *     is.what([123, 'test']);    // 'array'
   *
   * The code automatically describes the outer-wrapping array using `[]`
   * mainly to dovetail nicely with {@linkcode theory.overload}. It also
   * means that the actual structure is still described, just with symbols
   * rather than words.
   *
   * ##### notes
   *
   * > The `depth` parameter does not apply to objects.
   *
   * @static
   * @memberof! is
   * @method is.what
   * @param {Object} desc
   * @param {Number} [depth=0]
   * @return {String} returns a string describing what was passed in as `desc`
   */
  is.what = function(desc, depth){
    if ( depth > 0 ) {
      if ( is.arraylike(desc) ) {
        for ( var a=[], i=0, d=depth-1, l=desc.length; i<l; i++ ) {
          a.push(this.what(desc[i], d));
        }
        return '[' + a.join(', ') + ']';
      }
    }
    return is.what.type(desc);
  };

  /**
   * Easily overriddddable type descriptions
   *
   * @static
   * @property is.what.types
   */
  is.what.types = [
    {name: 'string',   cons: String},
    {name: 'number',   cons: Number},
    {name: 'boolean',  cons: Boolean},
    {name: 'date',     cons: Date},
    {name: 'regexp',   cons: RegExp},
    {
      name: 'function',
      test: function(obj,t,c){
        return 0 ||
          (c === Function) ||
          (t === 'function') ||
          (obj.call && !!obj.apply)
        ;
      }
    },
    {
      name: 'callable',
      test: function(obj,t,c){
        return (obj.call && !!obj.apply);
      }
    },
    {
      name: 'array',
      test: function(obj,t,c){
        return 0 ||
          (c === Array) ||
          (t === 'array') ||
          (obj.join && obj.slice && !!obj.unshift) ||
          (obj[0] && typeof obj.length !== 'undefined') ||
          (is.arguments(obj))
        ;
      }
    },
    {
      name: 'event',
      test: function(obj,t,c){return !!(obj.type && (obj.target||obj.srcElement));}
    },
    {
      name: 'element',
      test: function(obj,t,c){return !!obj.getElementsByTagName;}
    },
    {
      name: 'document',
      test: function(obj,t,c){return !!obj.getElementById;}
    },
    {
      name: 'window',
      test: function(obj,t,c){return obj.location && !!obj.document;}
    }
  ];

  /**
   * This is the code Theory exposes to allow external code to modify
   * how types are recognised, mainly for use with the
   * {@linkcode theory.overload} method. By default it utilises a
   * mixture of typeof and duck testing to best guess the type of an
   * object.
   *
   * With one parameter it returns a description string, but
   * with two or more the code will test the found type against
   * each subsequent comparison parameter. If a match is found against
   * any of the comparisons, the method will return `true` otherwise
   * `false`.
   *
   * To add or change the way a type is identified, you just need to
   * change the `is.what.types` array.
   *
   * If the `obj` you are testing supports an `isWhatType` method
   * the code will use this first and foremost, falling back to the
   * `is.what.types` array checks.
   *
   * The method can be called one of two ways:
   *
   * @example
   * is.what.type({anObject:1});             // 'object'
   * is.what.type('a chain of characters');  // 'string'
   * is.what.type([123]);                    // 'array'
   *
   * @example
   * is.what.type({anObject:1}, 'object');          // true
   * is.what.type({anObject:1}, 'object', 'array'); // true
   * is.what.type(123, 'object', 'array');          // false
   *
   * @static
   * @memberof! is
   * @method is.what.type
   * @param {Any} obj
   * @param {...String} [comparison]
   * @return {String} A string describing `obj` if no comparison has been provided i.e. `array`, 'string' or `function`.
   * @return {Boolean} A boolean if the description of `obj` matches any of the provided comparison strings.
   */
  is.what.type = function(obj, comparison){
    var t,i,c,k,l,e;
    if ( obj && obj.isWhatType ) {
      t = obj.isWhatType();
    }
    else {
      if ( (t = typeof obj) !== 'undefined' ) {
        c = obj.constructor;
        k = is.what.types;
        l = k.length;
        for (i=0; i<l; i++) {
          if ( (e=k[i]) && e.cons ) {
            if (c === e.cons) {
              t = e.name; break;
            }
          }
          else if ( e && e.test ) {
            if ( e.test(obj,t,c) ) {
              t = e.name; break;
            }
          }
        }
      }
    }
    if ( comparison && comparison.substr ){
      if ( (l=arguments.length) > 2 ){
        for ( i=1; i<l; i++ ) {
          if ( t === arguments[i] ){
            return true;
          }
        }
        return false;
      }
      return type === t;
    }
    return t;
  };

  return is;

});
async('theory.has', function(){

  /**
   * Check stuff has particular attributes
   *
   * @namespace has
   */
  var has = {

    /**
     * Check that an object has at least one callable function contained within its own properties.
     *
     * @static
     * @method has.childFunctions
     * @param {Object} desc The object to be scanned for callable items.
     * @return {Boolean} True, if item has any `is.callable()` items of its content filtered by `hasOwnProperty()`
     * @return {String} almost never, except if you manually edit the content of this function.
     * @see is.what
     */
    childFunctions: function(desc){
      for ( var i in desc ) {
        if ( desc.hasOwnProperty(i) ) {
          if ( is.callable(desc[i]) ) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Check if an array or object has own contents.
     */
    hasItems: function(){
      return false; // @TODO:
    }

  };

  return has;

});
async('theory.to', function(){

  /**
   * A simple place to store code that casts or converts from one thing to another.
   *
   * @namespace to
   */
  var to = {

    /**
     * Cast "anything" to an array.
     *
     * Makes use of modern approaches where possible i.e. `Array.isArray` and `Array.from`.
     *
     * Falls back to `Array.prototype.slice.call`.
     *
     * @example
     * to.array();          // []
     * to.array(123);       // [123]
     * to.array([123]);     // [123]
     * to.array('123');     // ['1', '2', '3']
     * to.array(arguments); // [arguments[0], arguments[1], arguments[2]]
     *
     * @memberof! to
     * @method
     * @param {any} param - if param is already an array, it is just returned, anything else that can be converted is; anything else is just wrapped.
     * @return {array}
     */
    array: function(param){
      if ( param ) {
        /// check for array type first to short-circuit: modern first, then old-school
        if ( Array.isArray ) {
          if ( Array.isArray(param) ) {
            return param;
          }
        }
        else {
          if ( param.join ) {
            return param;
          }
        }
        /// as long as we have a length property, use casting: modern first, then old-school
        if ( param && typeof param.length != 'undefined' ) {
          if ( Array.from ) {
            return Array.from(param);
          }
          else {
            return Array.prototype.slice.call(param, 0);
          }
        }
      }
      /// otherwise, wrap the value as an array
      return arguments.length ? [param] : [];
    },

    /**
     * Convert "anything" to a function
     *
     * @example
     * to.function(function(){}); // function(){} <-- same ref
     * to.function(123);          // function(){ return param; } <-- param = 123
     *
     * @memberof! to
     * @method
     * @param {any} param - if param is already a function, it is just returned, anything else is wrapped as a function.
     * @return {function}
     */
    "function": function(param){
      if ( param && param.call && param.apply ) {
        return param;
      }
      else {
        return function(){ return param; };
      }
    }

  };

  return to;

});
/**
 * The trigger manager for polycade
 * @TODO: needs to be extended with runLater
 */
async('theory.run', ['theory.is'], function(is){

  /**
   * Tell other code to run at different other times
   */
  var run = {

    internal: {
      cancel: function(){
        delete this.cancel;
        clearTimeout(0 + this);
      }
    },

    later: function( method, delay, context, args ){
      if ( !is.number(delay) ) {
        args = context;
        context = delay;
        delay = 0;
      }
      var tid = new Number(setTimeout(function(){
        method.apply(context||this, args||[]);
      }, delay));
      tid.cancel = theory.bind(run.internal.cancel, tid);
      return tid;
    }

  };

  return run;

});
/**
 * The trigger manager for polycade
 */
async('theory.base', ['underscore'], function(_){

  var theory = async.ref('theory', {});

  /**
   * A base object handler in the theory-style
   *
   * @memberof! theory
   * @namespace
   */
  theory.base = {

    /**
     * Mix other objects into the first object, including the items that exist on theory.base
     *
     * @memberof! theory.base
     * @method
     * @param {object} destination
     * @param {object} mixin
     * @return {object} destination
     */
    mix: function(){
      // convert to array, and insert this base object as second
      var args = Array.prototype.slice.apply(arguments); args.splice(1, 0, this);
      var instance = _.extend.apply(_, args);
      instance.prepNS(); // make sure we are set up for namespaces
      return instance;
    },

    /**
     *
     */
    create: function(){
      var instance = Object.create(this);
      this.prep.apply(instance, arguments);
      return instance;
    },

    /**
     *
     */
    createNS: function(){
      var namespace = Object.create(this);
      this.prepNS.apply(namespace, arguments);
      return namespace;
    },

    /**
     *
     */
    prep: function(){
      return this;
    },

    /**
     * When creating under a new namespace, we only wish to reset certain things
     */
    prepNS: function(){
      this.is = {};
      this.shared = {
        namespaces: {}
      };
      return this;
    },

    /**
     * Pass in a string-based namespace, this will create or return a new
     * wrapping instance of polycade.events().
     */
    namespace: function(ns){
      return this.shared.namespaces[ns] || (this.shared.namespaces[ns] = this.createNS(ns));
    }

  };

  return theory.base;

});
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