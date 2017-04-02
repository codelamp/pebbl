/**
 * ExpReg 0.1
 *
 *  ExpReg is just a simple RegExp wrapper that has some useful functions
 *  for dealing with Regular Expressions.
 *
 * @author  ~ Phil Glanville, 2009
 */
async('theory.plugins.expreg', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  theory.plugins.expreg = (function(mixin){

    /*
     * The outer wrapping constructor that will be exposed as ExpReg
     */
    var ExpReg = function(re, haystack){
      var t, exp;
      if ( this instanceof ExpReg ) {
        this.exp = ExpReg.expression(re);
        if ( this.exp ) {
          this.source = haystack ? haystack : '';
          this.matches = [];
          this.matched = false;
          this.finished = false;
          this.reversed = false;
        }
        else {
          throw new Error('unable to parse ExpReg expression.');
        }
      }
      else {
        if ( typeof this == 'string' ) {
          return new ExpReg(re, String(this));
        }
        else {
          return new ExpReg(re, haystack);
        }
      }
      return this;
    };

    // provide some addition functions
    theory.extend(ExpReg, mixin);

    /*
     * Needed to reverse engineer a RegExp into constituent parts
     */
    ExpReg.unwrapPattern = new RegExp('^([^a-z0-9\s])(.+?)\\1([gimy]{0,4})$','i');
    /*
     * Take a string representation or an actual RegExp object and rebuild
     * it as two expressions. One with the global flag (.multiple), and one without (.single).
     * This is to work around the behavioural differences in RegExp functionality
     * when dealing with either a global or non-global expression.
     */
    ExpReg.expression = function(exp){
      var bits, obj = {};
      if ( (bits=ExpReg.unwrapPattern.exec(String(exp))) ) {
        obj.string = bits[2];
        obj.flags = bits[3];
        obj.flagsNoGlobal = obj.flags.replace('g', '');
        obj.flagsGlobal = obj.flags.replace('g', '') + 'g';
        obj.single = new RegExp(obj.string, obj.flagsNoGlobal);
        obj.multiple = new RegExp(obj.string, obj.flagsGlobal);
        return obj;
      }
      else {
        return null;
      }
    };
    /**
     * Quick quote function, borrowed from regexp-quote.js
     */
    ExpReg.quote = function(str){
      return str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    /*
     * Simple jQuery like attr function
     * DEPRECATED: This can no longer work as we have two expressions
     * one global, one not.
     */
    /*
    ExpReg.prototype.attr = function( name, value ){
      if ( arguments.length == 2 ) {
        this.exp[name] = value;
      }
      else {
        return this.exp[name];
      }
    };
    */
    /*
     * Define the haystack that the RegExp will search
     */
    ExpReg.prototype.haystack = function(string){
      if ( arguments.length && (typeof string == 'string') ) {
        this.source = string;
        this.matched = false;
        return this;
      }
      else {
        return this.source;
      }
    };
    /*
     * Return a particular matched item. A matched item will
     * be an object that contains a zero-indexed array of .groups
     * and an .offset property that gives the start of where the
     * match was found.
     */
    ExpReg.prototype.item = function(n){
      if ( arguments.length == 0 || n === undefined || n === null ) {
        return this.matches;
      }
      else if ( n < 0 ) {
        return this.matches[this.matches.length+n];
      }
      else if ( n < this.matches.length ) {
        return this.matches[n];
      }
      else {
        return null;
      }
    };
    /*
     * Reset the internal .lastIndexes
     */
    ExpReg.prototype.reset = function(){
      /// reset and scan
      this.exp.single.lastIndex = 0;
      this.exp.multiple.lastIndex = 0;
    };
    /*
     * Find the next item as per the internal .lastIndex pointer
     */
    ExpReg.prototype.find = function(){
      /// remove previously found items
      /// but don't reset the internal pointer
      this.matches.length = 0;
      this.matched = false;
      if ( this.finished ) { return this; }
      //this.lastIndex = this.exp.multiple.lastIndex;
      /// whilst not global, match the first and stop
      var groups = this.exp.multiple.exec(this.source);
      if ( groups ) {
        this.matched = true;
        this.matches[this.matches.length] = {
          value: groups[0],
          groups: groups,
          offset: this.exp.multiple.lastIndex - groups[0].length,
          end: this.exp.multiple.lastIndex
        };
      }
      else {
        this.finished = true;;
      }
      return this;
    };

    ExpReg.prototype.finding = function(){
      this.find();
      return this.matched;
    };
    
    /*
     * Shortcut function -- which is actually the same length
     * as typing .find().replace()
     */
    ExpReg.prototype.findAndReplace = function(param, options){
      var result = this.find().replace(param, options);
      if ( this.finished && options.emptyFinish ) {
        return false;
      }
      else {
        return result;
      }
    };
    
    /*
     * Find all items in one fell swoop
     */
    ExpReg.prototype.findAll = function(){
      /// remove previously found items
      this.matches.length = 0;
      this.matched = false;
      /// reset and scan
      this.reset();
      var groups;
      /// if we are global we can findAll
      while( (groups=this.exp.multiple.exec(this.source)) ) {
        this.matches[this.matches.length] = {
          value: groups[0],
          groups: groups,
          offset: this.exp.multiple.lastIndex - groups[0].length,
          end: this.exp.multiple.lastIndex
        };
      }
      ///
      this.matched = true;
      return this;
    };
    /*
     *
     */
    ExpReg.prototype.replace = function(param, options){
      var result, self = this, current, lastIndex, dif = 0;
      if ( this.finished ) { return this; }
      if ( !this.matched ) { this.find(); }
      if ( this.matched ) {
        match = this.matches[0];
        lastIndex = this.exp.multiple.lastIndex;
        result = this.source.replace(this.exp.multiple, function(m){
          var i = arguments[match.groups.length], r = undefined;
          if ( i === match.offset ) {
            if ( is.string(param) ) {
              r = param;
            }
            /// NOTE: this code will execute even if the array is empty
            /// it will just have no effect.
            else if ( is.array(param) ) {
              r = param.shift();
            }
            else if ( is.callable(param) ) {
              r = param.call(self, arguments, self);
            }
          }
          if ( r !== undefined ) {
            dif = r.length - m.length;
            return r;
          }
          else {
            return m;
          }
        });
        this.exp.multiple.lastIndex = lastIndex + dif;
      }
      if ( options && options.returnResult ) {
        return result;
      }
      else {
        this.source = result;
      }
      return this;
    };
    /*
     * Replace all matches with param: Which can be a string, array of strings, array
     * of functions, or just a function.
     */
    ExpReg.prototype.replaceAll = function(param, options){
      var result, self = this, index = 0;
      if ( !this.matched ) { this.findAll(); }
      if ( this.matches.length ) {
        /// here we handle simple strings
        if ( is.string(param) ) {
          result = this.source.replace(this.exp.multiple, param);
        }
        /// here we handls arrays
        else if ( is.array(param) ) {
          param = param.slice(); /// clone the array
          result = this.source.replace(this.exp.multiple, function(m){
            index = index % param.length;
            var v = param[index++];
            /// if the array item is callable, do so
            if ( is.callable(v) ) {
              return v.call(self, arguments, self);
            }
            /// otherwise cast to string
            else {
              return v;
            }
          });
        }
        /// here we handle callable items
        else if ( is.callable(param) ) {
          result = this.source.replace(this.exp.multiple, function(){return param.call(self, arguments, self);});
        }
      }
      if ( options && options.returnResult ) {
        return result;
      }
      else {
        this.source = result;
      }
      return this;
    };
    /*
     * Replace one match each time the returned replacement iterable is called.
     * With each call the replacement iterable will return the current state of
     * the string.
     *
     * Works in a similar way to calling .replace(), but has the added benefit
     * of wrapping that call with fixed arguments -- which can be bundled up
     * and sent to other code.
     *
     * You can supply a callback/value at the time the iterable is created, or
     * you can pass a callback/value each time the iterable is called.
     *
     * You can only specify options when the iterable is created.
     *
     * To avoid the use of the iterable causing circular loops, the option
     * emptyFinish is always on.
     *
     * @TODO: tie this into the actual ES spec for iterables.
     */
    ExpReg.prototype.replaceIter = function(param, options){
      var self = this, iter;
      if ( !options ) { options = {}; }
      options.emptyFinish = true;
      iter = function(param2){
        if ( self.findAndReplace.apply(self, [arguments.length ? param2 : param, options]) ) {
          return self.source;
        }
        else {
          return false;
        }
      };
      iter.reset = function(){self.reset();};
      return iter;
    };
    /*
     * There is no nice UI way to replace a specific nth match with RegExp.
     * ExpReg makes it neater and clearer.
     */
    ExpReg.prototype.replaceNth = function(nth, param, options){
      var self = this, match, dif = 0;
      if ( nth < this.matches.length ) {
        match = this.matches[nth];
        result = this.source.replace(this.exp.multiple, function(m){
          /// @TODO: see if there is a better way of getting the i
          /// offset when there are multiple capture groups
          var i = arguments[match.groups.length], r = undefined;
          if ( i === match.offset ) {
            if ( is.string(param) !== false ) {
              r = param;
            }
            /// NOTE: this code will execute even if the array is empty
            /// it will just have no effect.
            else if ( is.array(param) ) {
              r = param.shift();
            }
            else if ( is.callable(param) ) {
              r = param.apply(self, arguments);
            }
          }
          if ( r !== undefined ) {
            dif = r.length - m.length;
            match.value = r;
            match.end = match.offset + match.value.length;
            return r;
          }
          else {
            return m;
          }
        });
        if ( this.reversed ) {
          this.shiftMatches(0, nth, dif);
        }
        else {
          this.shiftMatches(nth, this.matches.length, dif);
        }
        this.source = result;
      }
    };
    ExpReg.prototype.shiftMatches = function(from, till, dif){
      /// update all matches that come after the one we've altered
      for ( var i=from; i<till; i++ ) {
        if ( this.matches[i] ) {
          this.matches[i].offset += dif;
          this.matches[i].end += dif;
        }
        /// @TODO: we need to update the group offsets too
      }
    };
    /*
     * Call a callback for each match found
     */
    ExpReg.prototype.each = function(callback){
      if ( !this.matched ) { this.findAll(); }
      if ( this.matches.length ) {
        var i, l = this.matches.length;
        for( i=0; i<l; i++ ) {
          callback.call(this, this.matches[i], i, this);
        }
      }
      return this;
    };
    /*
     * Map the matches to an array
     */
    ExpReg.prototype.map = function(callback){
      var a = [];
      if ( !this.matched ) { this.findAll(); }
      if ( this.matches.length ) {
        var i, l = this.matches.length;
        if( typeof callback == 'undefined' ) { callback = 1; }
        if ( callback.call ) {
          for( i=0; i<l; i++ ) {
            a[i] = callback.call(this, this.matches[i], i, this);
          }
        }
        else {
          for( i=0; i<l; i++ ) {
            if ( this.matches[i] && typeof this.matches[i].groups[callback] != 'undefined' ){
              a[i] = this.matches[i].groups[callback];
            }
          }
        }
      }
      return a;
    };
    /*
     * wrap the matches with strings
     */
    ExpReg.prototype.wrap = function(pre, post){
      this.replace(function(matches){
        return pre+matches[0]+post;
      });
      return this;
    };
    ExpReg.prototype.reverse = function(){
      if ( !this.matched ) { this.findAll(); }
      this.matches.reverse();
      this.reversed = !this.reversed;
      return this;
    };
    /*
     * debug log
     */
    ExpReg.prototype.log = function(pre, post){
      this.each(function(match, i){
        console.log(i, match);
      });
      return this;
    };
    /*
     * Experimental feature, to allow for quick "matched" tests
     */
    ExpReg.prototype.valueOf = function(){
      return this.matched ? 1 : 0;
    };
    /*
     * Expose ExpReg as part of the string prototype.
     */
    String.prototype.ExpReg = ExpReg;

    return ExpReg;

  })(theory.plugins.expreg);

  //
  t.ExpReg = theory.plugins.expreg;

  return theory.plugins.expreg;

});