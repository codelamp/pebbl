/*
 * A Matchbook is given a range of tokens, and from this it creates an internal 
 * lookup library. It is then responsible for reporting any of the tokens that 
 * match a given string at a particular offset. It was developed to help the
 * string parsing part of theory.js
 *
 *  E.g.
 *  var a = t.matchbook.create().add('will this match?', { mydata: 123 }).compile();
 *  a.compare('So I ask will this match?', 8); /// will this match?
 *
 * If `.compare()` is passed true as the third parameter then it will return the 
 * userdata associated with that token, rather that then token itself.
 *
 *  E.g.
 *  a.compare('So I ask Will this match?', 8, true); /// { mydata: 123 }
 *
 * ## Why Matchbook?
 *
 * A problem I always get stuck on is what is the fastest way to find a number of
 * symbols within a string, where each symbol represents the start and end of a 
 * range. The symbols can be any length, and they are likley to reoccur a number 
 * of times in different orders, the offset in the string is required. Here is 
 * the kicker though, I wish to ignore symbols that define sub-ranges within other
 * ranges i.e. "(a bracketed range (that has a sub range within) that we ignore)."
 * Out of the above example when searching for ( and ) the first bracket and the 
 * last bracket in the string should be found and their positions returned, 
 * everything else should be ignored.
 *
 * Obvioulsy the only way to do this is with some sort of stack or flag, tracking 
 * at what "depth" within a range a particular symbol is. That part isn't the problem, 
 * it's deciding which is best out of the following:
 *
 * 1. Use multiple indexOfs to find all occurances and put them in index order, 
 *      removing symbols that appear within ranges. This obviously wastes time
 *      if there are lots of subranges that will eventually be ignored.
 *
 * 2. Use a compiled regexp, built from the symbols to search for, find all, they 
 *      should already be in index order, removing symbols that appear within ranges.
 *      Again, similar to the indexOf problem, lots of sub ranges that would take
 *      effort to detect and remove.
 *
 * 3. Scan along the string using a for loop, matching against a precompiled 
 *      hash of character constructs. When finding a range start, indexOf until we 
 *      find the range end. A 'for' may be slower than an 'indexOf' or 'RegExp' but 
 *      this method skips out any removal of subranges.
 * 
 * This time around I think I'm going to go for option 3, but that could just be
 * down to the colour of the wind.
 *
 * @namespace
 */
t.matchbook = {
  
  escape: '\\',
  
  /*
   * Create a new Matchbook.
   */
  create: function( symbols ){
    return Object.create(this).prep(symbols);
  },
  
  /*
   * Clone this matchbook instance
   */
  clone: function(){
    var copy = t.matchbook.create();
        copy.symbols  = this.cloneItem(this.symbols);
        copy.data     = this.cloneItem(this.data);
        copy.compiled = this.compiled;
        copy.compiled && (copy.compile());
    return copy;
  },
  
  /*
   * Simple type cloning to allow this code to be stand-alone-complex
   *
   * @TODO: Only supports arrays and simple objects (i.e. not deep).
   */
  cloneItem: function( target ){
    if ( target && target.join ) {
      return target.slice(0);
    }
    else if ( target ) {
      var copy = {};
      for ( var i in target ) {
        copy[i] = target[i];
      }
      return copy;
    }
  },
  
  /*
   * Standard prep function to handle instance uniques.
   */
  prep: function(symbols){
    if ( symbols ) {
      this.compiled = false;
      this.symbols = symbols;
      this.library = this._createCharacterLibrary( this.symbols );
      this.data = {};
      this.length = this.symbols.length;
    }
    else {
      this.compiled = false;
      this.symbols = [];
      this.library = null;
      this.data = {};
      this.length = this.symbols.length;
    }
    return this;
  },
  
  /*
   * Take the list of symbols and construct a library that stores
   * each symbol as a chain of characters in a parent -> child
   * heirachy i.e. symbols of [cat, can, code] would become an object
   * like:
   *
   *     {c:{a:{t:'cat',n:'can'}},o:{d:{e:'code'}}}
   *
   * @NOTE: One special case is when a partial start of a full symbol
   * is used as a symbol in itself. i.e. 'apple' and 'app' -- in this
   * case this code will produce:
   * 
   *     {a:{p:{p:{'':'app',l:{e:'apple'}}}}}
   *
   * Where the empty key tells the rest of matchbook that a symbol
   * ends at this point within the object structure.
   */
  _createCharacterLibrary: function( symbols ){
    var a,i,l, lib = {}, pnt, c;
    for ( a=symbols, i=0, l=a.length; (pnt = lib) && i<l; i++ ) {
      this._addSymbolToLibrary( symbols[i], lib );
    }
    return lib;
  },
  
  /*
   * Handles adding an individual symbol to the library
   */
  _addSymbolToLibrary: function( symbol, library ){
    var a,i,l, lib = library || this.library, pnt = lib, c;
    for ( a=symbol, i=0, l=a.length; i<l; i++ ) {
      if ( (c = a[i]) ) { /// get the next char
        if ( i === l-1 ) { /// if we are the last char index
          if ( pnt[c] ) { /// if the char index already exists
            if ( typeof pnt[c] != 'string' ) { /// if the item found at char index is an object
              pnt[c][''] = a; /// set empty key to flag that a shorter symbol has reached the end
            }
          }
          else {
            pnt[c] = a;
          }
        }
        else if ( !pnt[c] ) {
          pnt[c] = {};
        }
      }
      pnt = pnt[c];
    }
  },
  
  /*
   * Compare this matchbook against the passed in string, at a particular offset.
   */
  compare: function( string, offset, getUserdata ){
    var c,a,s,p,i,l, match, ret, lib = this.library;
    /// escape support
    if ( this.escape ) {
      a = 0; i = offset||0;
      while ( string.charAt(--i) === this.escape ) { a++; };
      if ( a&1 ) {
        return false;
      }
    }
    p = false;
    for ( s=string, i=offset||0, l=s.length; (c=s.charAt(i)) && i<l; i++ ) {
      if ( lib[c] ) {
        lib = lib[c];
        if ( typeof lib === 'string' ) {
          return lib;
        }
        else if ( lib[''] ) {
          p = lib[''];
        }
      }
      else if ( p ) {
        break;
      }
      else {
        break;
      }
    }
    if ( p && getUserdata ) {
      p = this.userdata(p);
    }
    return p;
  },
  
  /*
   * Compile the symbols in to a fast searching object library.
   */
  compile: function(){
    this.library = this._createCharacterLibrary( this.symbols );
    this.compiled = true;
    return this;
  },
  
  /*
   * Add a new symbol, along with optinal userdata.
   */
  add: function( symbol, userdata ){
    if ( typeof symbol === 'string' ) {
      this.symbols.push( symbol );
      this.userdata( symbol, userdata );
      this.compiled && this._addSymbolToLibrary( symbol );
    }
    else if ( symbol && symbol.join ) {
      for ( var i=0, l=symbol.length; i<l; i++ ) {
        this.add( symbol[i], userdata );
      }
    }
    this.length = this.symbols.length;
    return this;
  },
  
  /*
   * Store or retrieve user data based on a symbol.
   */
  userdata: function( name, data, remove ){
    if ( arguments.length > 1 ) {
      if ( !this.data[name] ) {
        this.data[name] = [];
      }
      if ( remove ) {
        for ( var i=0, a=this.data[name]; i<a.length; i++ ) {
          if ( a[i] === data ) {
            a.splice(i, 1);
            break;
          }
        }
      }
      else {
        this.data[name].push(data);
      }
      return this;
    }
    else if ( arguments.length === 1 ) {
      return this.data[name];
    }
  }
  
};