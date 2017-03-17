async('theory.plugins.creator', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  /**
   * Allows for the creation of an object "constructor".
   *
   * Theory doesn't use conventional constructors (i.e. a function with a prototype)
   * instead, it makes use of the `Object.create` methodology.
   *
   * You provide an object that is used as the base prototype, all instances are
   * derived from this object, along with some specific "Theory<sup>&trade;</sup>" enhancements.
   *
   * Theory also doesn't implement any class-like inheritance, perfering to opt for
   * the mixin / borrow approach. This comes from the perspective that the real creative power
   * behind JavaScript is to share objects and methods. To be flexible, sketchable and extensible
   * as much as possible. Whilst this may fly in the face of specific runtime optimisations --
   * those that can be gained through using prototyped constructors and hidden classes -- I have
   * yet to come across a situation where I have needed that kind of speed.
   *
   * Put simply, if you are a developer who needs those kinds of crucial optimisations, building
   * massively complex and intensive systems, you are unlikely to be using Theory.
   *
   * ###### Creator rules
   *
   * Beyond passing in an object with whatever methods attached of your choosing,
   * `t.creator` listens out for some specific keys that either it expects to have,
   * or that modify its behaviour. These are:
   *
   * - **prep** -- if no method supplied, a default is added.
   * - **create** -- if no method supplied, a default is added.
   * - **theory** -- if this subobject exists, traverse and apply what it describes to the constructor.
   *
   * ###### Create method
   *
   * In most cases you won't need to specify your own create method, but you can do so
   * if you like. The basis of such a method is as follows:
   *
   *     create: function(){
   *       return this.prep.apply(Object.create(this), arguments);
   *     }
   *
   * The default create method that is supplied for all creators however, looks like this:
   *
   *     create: function(){
   *       var creator = this;
   *       var o = creator.prep.apply(Object.create(creator), arguments);
   *           o.constructor = creator;
   *           o.mixTo = t.creator.mixToInstance;
   *           o.mixOwnTo = t.creator.mixOwnToInstance;
   *           o.creator = function(){ return creator; };
   *           o.isNamespacedOf = null;
   *           o.getNamespacedSource = null;
   *       return o;
   *     }
   *
   * > NOTE: Theory.js already polyfills `Object.create`, so you do not need to worry
   *   if the browser supports it or not.
   *
   * ###### Prep method
   *
   * Each creator requires a method that is executed whenever a new instance is
   * created, this is named `prep` and is called directly after `create` is called.
   *
   * Whereas `create` is nearly always the same for every creator, `prep` only needs
   * to follow one rule. It must return `this`. Other than that, it can be defined
   * as you like.
   *
   * > NOTE: In most of the Theory code prep is used to set-up the internal object
   *   a.k.a. `i`. This is so that each instance has its own unique reference that
   *   it can store "private" data within.
   *
   * for example:
   *
   *     t.creator({
   *       i: null,
   *       prep: function(){
   *         this.i = {}; // <-- set up a new object with each instance.
   *       },
   *       sharedMethod: function(){
   *         // Whilst we are creating a new `this.i` each istance, this method will be shared.
   *       }
   *     });
   *
   * ###### Theory subobject
   *
   * You can define a subobject within your creator's description under the key of
   * `theory` which will add more abilities to your creator. Expected keys are currently:
   *
   * - **prep** -- This method will be executed just after the creator has been
   *   created. It is passed the creator's description (after any automatic
   *   additions) and is responsible for returning it (or a replacement). This
   *   method can be used to apply changes to the description that rely on
   *   referencing the description itself.
   *
   * - **mix** -- This array is used to list the items that should be mixed in to
   *   the creator .
   *
   * for example:
   *
   *     t.creator({
   *       theory: {
   *         /// implement a simplistic version of `theory.creator.callable`
   *         prep: function(desc){
   *           var callable = function(){ return desc.create.apply(desc, arguments); };
   *           t.extend(callable, desc);
   *           return callable;
   *         },
   *         /// mixin all usable methods from t.events (not fully functional yet,
   *         /// I am currently working out exactly how this should behave with
   *         /// regard to the difference between static and instance methods.)
   *         mix: [ t.events ]
   *       }
   *     });
   *
   * > NOTE: Future versions of Theory may rename the `prep` here to something else,
   *   to avoid confusion with the decription prep method.
   *
   * ###### Static quirk
   *
   * One oddity with the way Theory creators are constructed is that every property and
   * method will exist for each instance of a creator (as expected), but they will also
   * exist statically on the creator object itself.
   *
   *     var a = t.creator({
   *       myVeryEasyMethod: function(){
   *         return 'justSetUpNinePlanets';
   *       }
   *     });
   *
   *     var b = a.create();
   *
   *     console.log( a.myVeryEasyMethod() ); // justSetUpNinePlanets
   *     console.log( b.myVeryEasyMethod() ); // justSetUpNinePlanets
   *
   * The Theory codebase takes advantage of this quirk in many places, and has specifically
   * coded methods to handle each way the method might be called. But it should be noted
   * this is not typically the case (or expected) for many frameworks or languages. Especially
   * to those coming from a strict class-based environment.
   *
   * Whilst many may not like this approach, it ties in well with Theory's open and
   * shared ethos, allowing access to methods where you might expect them -- rather
   * than having to shift down the prototype chain.
   *
   * The main thing to take away from this quirk?
   *
   * > You should always know where your `this` is...
   *
   * But then again, you're a JavaScript developer, so that should be second nature. ;)
   *
   * @memberof! theory
   * @namespace
   *
   * @todo automatically mixing in object with `mix:` is not yet defined.
   */
  theory.plugins.creator = t.method({

    /**
     * Whilst `theory.creator` is a namespace -- to house all things "creator" --
     * it is also a function in itself. It should be called directly to create
     * new creators.
     *
     * @memberof! theory.creator
     * @method ___callable
     * @param {object} desc The description object that describes the creator.
     *
     * @example
     *
     * var a = t.creator({
     *
     *   // It is recommended that creators have their own internal object.
     *   // This is because every instance of a creator chains back to
     *   // the description object via its prototype chain. This means that
     *   // the new instance will be sharing every referencable property
     *   // and method with all the other instances. Whilst you could
     *   // define "internal" properties directly on your instance, it
     *   // is a far better coding style to use objects as namespaces.
     *   // Mainly because it becomes much easier to manage grouped properties.
     *   // You may opt to use something other than `i`, but that is a standard
     *   // within the theory codebase itself.
     *   i: null,
     *
     *   // just the same as .i, it can be useful to have a namespaced .shared
     *   // object. Used for containing properties that are shared between
     *   // instances. Again this is personal preference, but the Theory
     *   // codebase tends to keep the base object of a creator containing
     *   // just shared methods, and a subobject called "shared", containing
     *   // shared properties.
     *   shared: {},
     *
     *   // .create is automatically added, so you don't need this.
     *   // create: function(){...}
     *
     *   // Every creator should have a `prep` method, one will be automatically
     *   // added if not provided. This function is responsible for setting up
     *   // new instances.
     *   prep: function(param){
     *     this.i = {};
     *     this.i.param = param;
     *     return this;
     *   },
     *
     *   // As with every method and referencable property, this method will exist
     *   // statically on the creator and on every created instance using `.create()`
     *   aSimpleMethod: function(){},
     *
     *   // Create a t.overload method that handles both object and string arguments
     *   anOverloadedMethod: {
     *     overloads: {
     *       '[object]': function(obj){ return 'you object!'; },
     *       '[string]': function(str){ return 'you string!'; }
     *     }
     *   },
     *
     *   // Create a t.method with additional attributes
     *   aTheoryMethod: {
     *     attributes: {
     *       exposedOnMethod: function(){ return 'hello'; }
     *     }
     *     method: function(){ return 'world'; }
     *   },
     *
     *   // An alternative overload syntax
     *   aDifferentWayToOverload: {
     *     method: {
     *      defaults: [[], 0],
     *      arguments: '[array, number]',
     *      method: function(args){}
     *     }
     *   }
     *
     * });
     *
     * var b = a.create(123);                        // <-- creates a new instance of a.
     *
     * console.log(b.i.param);                       // 123
     * console.log(b.aTheoryMethod.exposedMethod()); // hello
     * console.log(b.aTheoryMethod());               // world
     * console.log(b.anOverloadedMethod({}));        // you object!
     * console.log(b.anOverloadedMethod(''));        // you string!
     */

    attributes: {
      /**
       * Create a creator that can be called as a function rather than
       * having to use `.create()`.
       *
       * Unfortunately, avoiding experimental JS advances means that
       * the best way to achieve a callable object, is to mix the
       * object properties across to that of a function. This means
       * you don't retain the original object reference, and have
       * to modify the behaviour of `isPrototypeOf` -- but it is better
       * than nothing.
       *
       * The implementation may be rather simplistic, but it does
       * avoid depending on the likes of `__proto__` . New facilities
       * that can't be relied upon 100%.
       *
       * @example
       * var a = t.creator.callable({
       *
       *   // it is recommended that creators have their own internal object (see above)
       *   i: {},
       *
       *   // every creator should have a `prep` method (see above)
       *   prep: function(param){
       *     this.i = {};
       *     this.i.param = param;
       *     return this;
       *   },
       *
       *   aRandomMethod: function(){
       *     // this method will exist both statically
       *     // and on every created instance using `.create()`
       *   }
       *
       * });
       *
       * var b = a(123);         // <-- calls .create() in the background
       *     b = a.create(123);  // <-- creates a new instance of a.
       *
       * console.log(a.i.param); // undefined
       * console.log(b.i.param); // 123
       *
       * @memberof! theory.creator
       * @method
       * @param {object} desc The description object that describes the creator.
       */
      callable: function(desc){
        desc = this(desc);
        var
          obj = t.extend(t.creator.i.createCallable(), desc, {overwrite:!0});
          //obj.getCallable = function(){return desc;};
          obj.getDescription = t.creator.i.getDescription.bind(obj);
          /*
          obj.isPrototypeOf = function(test){
            return test && test.isNamespacedOf
              ? test.isNamespacedOf(obj)
              : desc.isPrototypeOf(test)
            ;
          };
          */
        ;
        return obj;
      },

      /**
       * A wrapper of internal functions used by {@linkcode theory.creator}
       *  -- they should not be called statically -- unless you know what you
       * are doing, of course.
       *
       * @memberof! theory.creator
       * @namespace
       */
      i: {
        /**
         * Creators can call a number of other Theory functionalities into play
         * just by defining subobject in particular ways. This function is what
         * reacts to those subobjects. Currently supported are:
         *
         * - **wrappers** -- See {@linkcode theory.wrapper}
         * - **methods** -- See {@linkcode theory.method}
         * - **overloads** -- See {@linkcode theory.overload}
         *
         * @memberof! theory.creator.i
         * @method
         * @param {object} obj
         * @see theory.object#each
         */
        processItems: function(obj){
          t.object(obj).each.keyValue(function(key, item){
            if ( !item || is.callable(item) ) return;
            if ( item.wrapper ) {
              obj[key] = t.wrapper(item.method, item.wrapper, obj);
            }
            else if ( item.overloads ) {
              obj[key] = t.overload(item.overloads);
            }
            else if ( item.method ) {
              if ( is.callable(item.method) ) {
                obj[key] = t.method(item);
              }
              else {
                obj[key] = t.overload(item);
              }
            }
          });
        },
        /**
         * Each creator has the ability to mix its content into another
         * object. By default the context is preserved to be that of
         * the object being borrowed from -- however this can be changed by
         * passing:
         *
         *     .mixTo(..., {preserveContext: false});
         *
         * By default this will mix every method, unless filterd out, or the
         * current context provides a `getMixToList()` method that returns
         * an array of keys to mix.
         *
         * @memberof! theory.creator
         * @instance
         * @param {*} dest
         * @param {object} [options]
         * @param {object} [options.preserveContext = true]
         */
        mixTo: function(dest, options){
          var b;
          if ( !options ) { options = {}; }
          if ( options.preserveContext === t.undefined ) { options.preserveContext = true; }
          if ( this.getMixToList ) { options.filter = this.getMixToList(); }
          if ( options.filter ) { b = t.borrow(options.filter); }
          else if ( options.ownProperties ) { b = t.borrow().allOwn(); }
          else { b = t.borrow().all(); }
          if ( options.preserveContext ) { b = b.preserveContext(); }
          b.from(this).giveTo(dest);
          return this;
        },
        /**
         * The same as {@linkcode theory.creator#mixTo t.creator().mixTo()} save for being filtered by `hasOwnProperties`.
         *
         * @example
         *
         * var a = t.creator({
         *   methodToMix: function(){
         *     return this;
         *   }
         * });
         *
         * var b = {};
         *
         * a.mixTo(b);
         *
         * console.log( b.methodToMix() === a ); // true
         *
         * @memberof! theory.creator
         * @instance
         * @param {*} dest
         * @param {object} [options]
         * @param {object} [options.preserveContext = true]
         */
        mixOwnTo: function(dest, options){
          if ( !options ) { options = {}; }
          if ( !options.ownProperties ) { options.ownProperties = true }
          return this.mixTo(dest, options);
        },
        /*
         * .mixToInstance() is used when calling .mixTo() on an instance, rather than a creator.
         *
         * @memberof! theory.creator
         * @instance
         */
        mixToInstance: function(dest){
          return t.creator.i.mixTo.call(this, dest, { preserveContext: true });
        },
        /*
         * .mixOwnToInstance() is used when calling .mixOwnTo() on an instance, rather than a creator.
         *
         * @memberof! theory.creator
         * @instance
         */
        mixOwnToInstance: function(dest){
          return t.creator.i.mixOwnTo.call(this, dest, { preserveContext: true });
        },
        /*
         * The default .getMixToList()
         *
         * @memberof! theory.creator
         * @instance
         */
        getMixToList: function(){
          return Object.keys(this);
        },
        /*
         * General create function that is added to all creators.
         *
         * @memberof! theory.creator
         * @instance
         */
        create: function(){
          var creator = this;
          var o = creator.prep.apply(Object.create(creator), arguments);
              o.constructor = creator;
              o.mixTo = t.creator.i.mixToInstance;
              o.mixOwnTo = t.creator.i.mixOwnToInstance;
              o.creator = t.callableReference(creator);
              o.isNamespacedOf = null;
              o.getNamespacedSource = null;
          return o;
        },
        /*
         * General prep function that is added to all creators.
         *
         * @memberof! theory.creator
         * @instance
         */
        prep: function(){
          this.i && (this.i = t.dereference(this.i));
          return this;
        },
        /*
         * In order for the callable creators to behave as expected, we should
         * replace the isPrototypeOf method; so that the tests makes sense.
         *
         * @memberof! theory.creator
         * @instance
         */
        isPrototypeOfOverride: function(test){
          var head = this, isProto = Object.prototype.isPrototypeOf;
          do {
            if ( isProto.call(head, test) ) {
              return true;
            }
          } while ( head.getNamespacedSource && (head = head.getNamespacedSource()) );
          return false;
          //return this.getDescription().isPrototypeOf(test);
        },
        /*
         * Returns the item that namespace() was called on.
         *
         * > This can be a source for memory leaks, on older interpreters,
         * if you do not tidy up after yourself.
         *
         * @example
         * var apple = t.creator({});
         * var pinkLady = apple.namespace();
         *
         * pinklady.getNamespacedSource(); // === apple
         *
         * @memberof! theory.creator
         * @instance
         */
        getNamespacedSource: function(){
          return this;
        },
        /**
         * Get the original description that was used when t.creator was first called.
         * Any namespacing levels are ignored. This is the object that should be used
         * to test against for namespacing origin.
         *
         * There is one exception. When calling on a {@linkcode theory.creator.callable}
         * the original description object is not returned. Instead the first function
         * that is created by `.callable()` and then extended by the description object
         * is returned instead. They should be pretty much comparible, save for the fact
         * that one is function rather than being an object.
         *
         * > This does mean that if you rely on making changes to description objects
         * after they have been used to make creators, you may get caught out with
         * unexpected behaviour
         *
         * @example
         * var pen = t.creator({ originalDescription: 123 });
         * var biro = pen.namespace();
         * var lostBiro = biro.namespace();
         *
         * lostBiro.getDescription(); // { originalDescription: 123 }
         *
         * @memberof! theory.creator
         * @instance
         */
        getDescription: function(){
          return this;
        },
        /*
         *
         */
        createCallable: function(method){
          var func; return (func = function(){
            return func.create.apply(func, arguments);
          });
        },
        /*
         *
         *
         * @memberof! theory.creator
         * @instance
         */
        isNamespacedOf: function(test){
          var head = this, next;
          while ( head.getNamespacedSource ) {
            next = head.getNamespacedSource();
            if ( test === next ) {
              return true;
            }
            if ( next === head ) {
              break;
            }
            head = next;
          }
          return false;
        },
        /**
         * namespace allows a new version of the creator to exist (that inherits
         * from the original) but allows configurational changes to be made under
         * a particular named-space.
         *
         * ###### Why namespace a creator?
         *
         * Theory's ethos is that any piece of code should be able to take another
         * piece of code and configure it to run within its own parameters, even
         * if another piece of code is doing exactly the same thing elsewhere in
         * the same environment.
         *
         * Namespacing allows you to do this.
         *
         * @memberof! theory.creator
         * @instance
         * @param {string} [name] If a name is specified the namespace is cached
         *        and the same namespace will be returned each time that name is used.
         * @todo as we are using .namespaces as a lookup - we need to check against
         * the Object.prototype items (and introduce hasOwnProperty checks).
         */
        namespace: function(name, config){
          var desc, nso;
          if ( arguments.length === 1 && is.not.string(name) ) {
            config = name;
            name = null;
          }
          /// the description is the base description object that was first
          /// given to t.creator (or at least it should be).
          desc = this.getDescription();
          /// make sure there is an internal object
          if ( !desc.i ) { desc.i = {}; }
          /// use the base reference to check and see if this is a namespace lookup
          if ( desc.i.namespaces && desc.i.namespaces[name] ) {
            return desc.i.namespaces[name];
          }
          /// Are we dealing with a standard creator object, or a callable version?
          if ( is.callable(this) ) {
            /// create the namespaced object, by extending a new function (nsoFunc)
            /// with the current this object
            nso = t.extend(t.creator.i.createCallable(), this, {overwrite:!0});
            //nso.getCallable = t.callableReference(nso);

            /// here we have to override the the .isPrototypeOf() method because
            /// when namespacing a callable, we can't keep the object reference
            /// for the prototype the same (or chained). It has to change, because
            /// there is no similar facility of Object.create for functions.
            /// So once namespaced, the prototype of will be different to any
            /// previous levels of namespace. We fix that below:
            nso.isPrototypeOf = t.creator.i.isPrototypeOfOverride;
          }
          else {
            nso = Object.create(this);
          }
          /// new namespaces have theor own base internal object.
          nso.i && (nso.i = t.dereference(nso.i));
          /// new namespaces have their own shared object.
          nso.shared && (nso.shared = t.dereference(nso.shared));
          /// identify objects that have been namespaced
          nso.getNamespacedSource = t.creator.i.getNamespacedSource.bind(this);
          nso.isNamespacedOf = t.creator.i.isNamespacedOf.bind(nso);
          /// if a name has been specified we record the namespaced obj
          if ( name ) {
            !desc.i.namespaces && (desc.i.namespaces = {});
            desc.i.namespaces[name] = nso;
          }
          if ( config ) {
            nso.configuration && nso.configuration(config);
          }
          return nso;
        }
      }
    },
    /*
     * The core .constructor() method. This underpins a lot of code
     * in the theory library.
     */
    method: function(obj){
      var res;
      /// used to store static attributes that are shared between instances
      !obj.shared       && (obj.shared = {});
      /// used to store internal information on a per instance basis
      !obj.i            && (obj.i = {});
      /// no one should really need to create their own create method
      !obj.create       && (obj.create = t.creator.i.create);
      /// prep on the other hand should be overridden.
      !obj.prep         && (obj.prep = t.creator.i.prep);
      /// allow namespacing
      !obj.namespace    && (obj.namespace = t.creator.i.namespace);
      /// All constructors can be mixed to another object
      !obj.mixTo        && (obj.mixTo = t.creator.i.mixTo);
      !obj.mixOwnTo     && (obj.mixOwnTo = t.creator.i.mixOwnTo);
      !obj.getMixToList && (obj.getMixToList = t.creator.i.getMixToList);
      //function(v){ if ( v ) { obj = v; } else { return obj; } };
      obj.__isPrototypeOf = function(test){
        if ( test && test.isNamespacedOf ) {
          return test.isNamespacedOf(obj);
        }
        else {
          return Object.prototype.isPrototypeOf.call(this, test);
        }
      };
      /// process each keyed item
      t.creator.i.processItems(obj);
      /// All obj.theory methods will receive the constructor definition as 'this'.
      if ( obj.theory ) {
        /// prep is triggered once, after the constructor definition is whole.
        /// use this to manage method contexts and other global changes that
        /// will be required for every instance; but after the constructor has
        /// been processed by theory.constructor.
        if ( is.callable(obj.theory.prep) ) {
          res = obj.theory.prep.call(obj, obj);
          if ( res ) {
            obj = res;
          }
        }
      }
      obj.toString = function(){
        return '[Object t.creator]';
      };
      /// expose or set the description object
      obj.getDescription = t.creator.i.getDescription.bind(obj);
      return obj;
    }
  });
  
  return theory.plugins.creator;

});