async('theory.plugins.overload', ['theory', 'theory.is'], function(theory, is){

  //
  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  /**
   * Simplistic, and pretty fast, but most of all readable function "overloading".
   *
   * @memberof! theory
   * @namespace
   */
  theory.plugins.overload = t.method({
    /**
     *
     * ##### Inner workings
     *
     * The resulting method returned uses a lookup object to match calling
     * arguments to a destination function. So the main overhead with
     * this approach is the type checking on each argument.
     *
     * The type checking is performed by {@linkcode is.what.type}
     *
     * ##### Named parameters
     *
     * When introducing named parameters there is an extra overhead, whereby
     * the arguments array is translated to an object with named keys. But
     * whilst this is extra processing, it can make your resulting function
     * much nicer to work with.
     *
     * @todo optimisations could be implemented in terms of argument counts.
     *
     * @example
     * method = t.overload({
     *   '[array]': function(list){
     *     // simple overload based on types
     *   },
     *   '[array, object]': function(list, options){
     *     // each denoted function will only be called if types match
     *   }
     * });
     *
     * @example
     * method = t.overload({
     *   '[array] [object]?': function(list, options){
     *     // overload with optional arguments
     *   },
     *   '[object] [number]?': function(list, delay){
     *     // this creates lookups for [array], [array, object], [object] and [object, number]
     *   }
     * });
     *
     * @example
     * method = t.overload({
     *   '[array:list]': function(args){
     *     // simple named overloads
     *   },
     *   '[array:list, object:options]': function(args){
     *     // arguments are translated to an object with named keys
     *     // i.e. args.list, args.options
     *   }
     * });
     *
     * @memberof! theory.overload
     * @method ___callable
     * @param {object} desc - The overload description object
     */
    method: function(desc, argsHandler){
      var self = this.overload, func = self.fallback;
      if ( is.array(desc) ) {
        func = self.usingList.apply(self, arguments);
      }
      else if ( desc && desc.method ) {
        func = self.usingObject.apply(self, arguments);
      }
      else {
        func = self.usingKeys.apply(self, arguments);
      }
      return func;
    },

    attributes: {
      usingObject: function(desc, argsHandler){
        console.log(123, desc); /// <---------------
      },
      /*
       * This version of t.overload expects each version of the method as
       * an element of an array.
       *
       *  E.g. [
       *    {
       *      arguments: '[array, number]',
       *      method: function(args){
       *        console.log(args);
       *      }
       *    },
       *    {
       *      defaults: [0, []],
       *      arguments: '[number, array]',
       *      method: function(args){
       *        console.log(args);
       *      }
       *    }
       *  ]
       */
      usingList: function(desc, argsHandler){
        console.log(desc);
      },

      /*
       * This version of t.overload expects each version of the method as
       * keys within an object.
       *
       *  E.g. {
       *    "[object, string]" : function(){},
       *    "[number, array]" : function(){},
       *  }
       */
      usingKeys: function(desc, argsHandler){
        var key, a, i, l, func, internal = {};
        /// apply desc processors
        for ( a=t.overload.descProcessors, i=0, l=a.length; i<l; i++ ) {
          a[i].call(this, desc, internal);
        }
        internal = {};
        /// apply the item processors in order
        for ( key in desc ) {
          if ( desc.hasOwnProperty(key) ) {
            for ( a=t.overload.itemProcessors, i=0, l=a.length; i<l; i++ ) {
              a[i].call(this, key, desc, internal);
            }
          }
        }
        /// return the actual function that will handle the overloading
        func = function(){
          var args = argsHandler ? argsHandler(arguments) : arguments,
              key = is.what(args, 1),
              item = desc[key]
          ;
          //console.log(desc);
          if ( item ) {
            return t.overload.callItem(desc, item, this, args);
          }
          throw new Error('Overload failed for ' + key);
        };
        func.overloader = desc;
        return func;
      },

      fallback: function(){
        throw new Error('overload failed to form correctly.');
      }
    }

  });

  /**
   * From an array of arrays of strings, combine to form
   * all possible concatinated string outcomes.
   *
   *     ['a', ['b', 'c', 'd'], ['e', 'f']]
   *
   *  would produce:
   *
   *     abe, abf, ace, acf, ade, adf
   *
   * WHY?? You may well ask, and if you did ask it well then...
   * This handles creating the alternative combinations
   * for keys in t.overload().
   *
   * @memberof! theory.overload
   * @method
   */
  theory.overload.allCombinations = function(bits, options){
    if ( !options ) { options = {}; }
    if ( !options.sep ) { options.sep = ''; }
    var newfixes, prefixes = [''];
    for ( var a=bits, i=0, l=a.length, item; i<l, item=bits[i]; i++ ) {
      newfixes = [];
      if ( !item.join ) { item = [item]; }
      for ( var ii=0, ll=item.length, bit; ii<ll, bit=item[ii]; ii++ ) {
        if ( bit.join ) continue; /// sub-sub arrays mean nothing!
        for ( var iii=0, lll=prefixes.length; iii<lll; iii++ ) {
          newfixes.push(prefixes[iii] ? prefixes[iii] + options.sep + bit : bit);
        }
      }
      prefixes = newfixes;
    }
    return newfixes || [];
  };
 
  /**
   * Split an overload key into its constituent parts
   *
   *  e.g. `'[string, object]'`           becomes `['string', 'object']`
   *
   *  e.g. `'[string, object] [object]?'` becomes `['string', 'object', 'object']`
   *
   * @memberof! theory.overload
   * @method
   */
  theory.overload.parseKey = t.method({
    attributes: {
      keyPattern: /\[([^\]]+)\]/ig,
      itmPattern: /, */ig
    },
    method: function(key){
      var items = [], self = this.parseKey;
      key.replace(self.keyPattern, function(outer, inner){
        var bits = inner.split(self.itmPattern);
        for ( var i=0, l=bits.length; i<l; i++ ) {
          items.push(bits[i]);
        }
      });
      return items;
    }
  });
 
  /**
   * Combine any keys passed in, together.
   *
   *     extendKey('[array:list, callable:callback]', '[string:test]')
   *     // '[array:list, callable:callback, string:test]'
   *
   * @todo This code doesn't currently handle the keys being wrapped with []. it should.
   *
   * @memberof! theory.overload
   * @method
   */
  theory.overload.extendKey = function(){
    return '[' + Array.prototype.slice.call(arguments, 0).join(', ') + ']';
  };
 
  /**
   * Used to call a described overload method, supports string references.
   *
   * @memberof! theory.overload
   * @method
   */
  theory.overload.callItem = function(desc, item, context, args, hops){
    if ( !hops || !is.number(hops) || hops<1 ) { hops = 4; }
    if ( is.string(item) ) {
      /// loop the infinite reference of strings (limited to hops)
      do { item = desc[item]; } while ( item && is.string(item) && hops-- );
    }
    if ( item && is.callable(item) ) {
      return item.apply(context||this, args||[]);
    }
    throw new Error('Overload failed to call ' + item);
  };
 
  /**
   * Overload description processors allow the overload behaviour to 
   * be extended.
   * 
   * These should make changes to the description object before being 
   * handed to the item processors.
   *
   * You can add your own processor by .push()-ing a method to this
   * array. The method should have the following signature:
   *
   *     function(desc, internal) {}
   *
   *  - `desc` is the entire description object
   *  - `internal` is a provided storage object, per description but separate from description
   * 
   * > It should be noted that the order of processors can change expected outcomes. Shift the orders only if you know what you are doing.
   *
   * @memberof! theory.overload
   * @namespace
   */
  theory.overload.descProcessors = new Array();
 
  /**
   * Inline names allows for a more succint way of naming params.
   *
   * So rather than:
   *
   *     [array, callable, number] > [list, callback, delay]
   *
   * You can use:
   *
   *     [array:list, callable:callback, number:delay]
   *
   * It is personal preference which is prefered for readability.
   * However, inline names are less prone to typing mistakes.
   * Especially if you start using optional parameters, for
   * example:
   *
   *     [array][callable, number]? > [list][callback, delay]?
   *
   * Would be:
   *
   *      [array:list][callable:callback, number:delay]?
   *
   * @memberof! theory.overload.descProcessors
   * @method
   */
  theory.overload.descProcessors.inlineNames = t.wrapper(function(wrapper){
    wrapper.translatePattern = t.ExpReg(/([^\[\]\:\|\s,]+)\:([^\[\]\:\|\s,]+)/);
    return function(desc){
      var key, bits, bit, i, l, opts = {returnResult: true}, a, b;
      for ( key in desc ) {
        if ( desc.hasOwnProperty(key) ) {
          if ( key.indexOf(':') != -1 ) {
            bits = wrapper.translatePattern.haystack(key).findAll();
            a = bits.replaceAll(function(matches){return matches[1];}, opts);
            b = bits.replaceAll(function(matches){return matches[2];}, opts);
            if ( a && b ) {
              desc[a+' > '+b] = desc[key];
              delete desc[key];
            }
          }
        }
      }
    };
  });
 
  /**
   * translateToArgsObject allows methods defined to receive
   * an args object with named attributes, instead of a list 
   * of params.
   *
   * For example:
   * 
   *     var test = t.overload({
   *       '[array, callable] > [list, callback]': function(args){
   *         console.log(args)
   *       };
   *     });
   *
   *     test([123], function(){});
   *
   * Would produce the following in the console:
   *
   *     { list: [123], callback: function(){} }
   *
   * I personally prefer the readability of the above to
   * that of the colon syntax with Inline Names. However, it
   * can get a bit verbose.
   *
   * @memberof! theory.overload.descProcessors
   * @method
   */
  theory.overload.descProcessors.translateToArgsObject = t.wrapper(function(wrapper){
    wrapper.sepPattern = / *> */,
    wrapper.createReplacement = function(desc, names, original){
      return function(){
        for ( var args={}, a=arguments, i=0, l=a.length; i<l; i++ ) { args[names[i]] = a[i]; }
        return t.overload.callItem(desc, original, this, [args]);
      }
    };
    return function(desc){
      var key, bits;
      for ( key in desc ) {
        if ( desc.hasOwnProperty(key) ) {
          /// if we have a secondary part to the item key, use it as param naming
          bits = key.split(wrapper.sepPattern, 2);
          if ( bits[0] && bits[1] ) {
            /// create the new replacement
            desc[bits[0]] = wrapper.createReplacement(desc, t.overload.parseKey(bits[1]), desc[key]);
            /// remove the existing
            delete desc[key];
          }
        }
      }
    };
  })
 
  /**
   * Alternative Keys gives support for the following key notation:
   *
   *     [array, object|string]
   *
   * @memberof! theory.overload.descProcessors
   * @method
   */
  theory.overload.descProcessors.alternativeKeys = function(desc){
    var key, bits, bit, i, l;
    for ( key in desc ) {
      if ( desc.hasOwnProperty(key) ) {
        /// if there are choice parameters, create a look up for every combination
        if ( key.indexOf('|') != -1 ) {
          /// step the overload key with choice combinations, convert to array of arrays
          bits = key.substring(1, key.length - 1).split(', ');
          for ( i=0, l=bits.length; i<l, bit=bits[i]; i++ ) {
            if ( bit && bit.indexOf('|') != -1 ) {
              bits[i] = bit.split('|');
            }
          }
          /// create references on the descriptor, for each alternative combination key
          bits = t.overload.allCombinations(bits, {sep: ', '});
          for ( i=0, l=bits.length; i<l, bit=bits[i]; i++ ) {
            if ( bit ) {
              desc['[' + bit + ']'] = key;
            }
          }
        }
      }
    }
  };
 
  /**
   * Optional Arguments gives support for the following key notation:
   *
   *     [array, object] [string]?
   *
   * @memberof! theory.overload.descProcessors
   * @method
   */
  theory.overload.descProcessors.optionalArguments = t.wrapper(function(wrapper){
    wrapper.translatePattern = t.ExpReg(/\s*\[([^\]]+)\]\s*\??\s*/);
    return function(desc){
      var key, basekey;
      for ( key in desc ) {
        if ( desc.hasOwnProperty(key) ) {
          if ( key.indexOf(']?') != -1 ) {
            basekey = '';
            wrapper.translatePattern
              .haystack(key)
              .findAll()
              .each(function(match, i, exr){
                var newkey = t.overload.extendKey.apply(t.overload, this.map(1));
                if ( !basekey ) {
                  basekey = newkey;
                  desc[newkey] = desc[key];
                  delete desc[key];
                }
                else {
                  desc[newkey] = basekey;
                }
                exr.matches.length--;
              })
            ;
          }
        }
      }
    };
  });
 
  /// add these to the processor list
  (function(list, processors){
    list.push(processors.inlineNames);
    list.push(processors.translateToArgsObject);
    list.push(processors.optionalArguments);
    list.push(processors.alternativeKeys); /// <-- this needs to occur last as it doesn't play well before others.
  })(t.overload.descProcessors, t.overload.descProcessors);
 
  /*
   * Overload item processors allow the overload behaviour to be extended.
   * Item processors are applied after description processors, and should
   * concern themselves with modifying the item in question. Any modifications
   * to the description object itself i.e. adding more items, may cause 
   * unexpected side-effects.
   *
   * You can add your own processor by .push()-ing a method to this
   * array. The method should have the following signature:
   *
   *  function(key, desc, internal)
   *
   *  - `key` is the description item's key
   *  - `desc` is the entire description object
   *  - `internal` is a provided storage object, per description item
   */
  theory.overload.itemProcessors = [];

  return theory;

});