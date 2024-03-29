async('theory.plugins.string', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  /**
   * More readable version that the usual `String.indexOf`.
   * @method
   */
  !String.prototype.contains &&
  (String.prototype.contains = function(v){
    return this.indexOf(v) != -1;
  });

  /**
   * Simple `.indexOf` implementation that takes into account possible escape characters.
   */
  !String.prototype.indexOfEscapable &&
  (String.prototype.indexOfEscapable = function(needle, offset, escape){
    var p = (offset||0)-1, k, e; !escape && (escape = '\\');
    while ( (k=p=this.indexOf(needle, p+1)) != -1 ) {
      e = 0; while ( this.charAt(--k) === escape ) {e++;}
      if ( !e || !(e&1) ) { break; }
    }
    return p;
  });

  /**
   * Simple check to match a particular char offset against an array of chars.
   */
  !String.prototype.charIs &&
  (String.prototype.charIs = function( string, offset, needles ){
    if ( offset < -1 ) {
      offset = string.length + offset;
    }
    return needles.indexOf( string.charAt(offset) ) != -1;
  });

  /**
   * JavaScript really should have this built-in by now!
   */
  !String.prototype.trim &&
  (String.prototype.trim = function( string ){
    return string.replace(/^\s+|\s+$/g, '');
  });

  /**
   * Theory's string system -- mainly used for parsing strings with
   * instruction sets i.e. parsers described by objects.
   *
   * @memberof! theory
   * @namespace
   */
  theory.plugins.string = theory.base.mix(theory.plugins.string, {

    theory: {
      prep: function(desc){
        desc.instructions.processGroup = desc.instructions.processGroup.bind(desc);
        desc.instructions.processItem = desc.instructions.processItem.bind(desc);
        return desc;
      }
    },

    /**
     * Used to store the instruction sets used by {@linkcode theory.string} and
     * {@linkcode theory.string.parse}.
     *
     * This object shouldn't be used directly, instead use the
     * {@linkcode theory.string.instructions} method.
     *
     * @member {object} instructions
     * @memberof! theory.string.shared
     */
    instructionSets: {},

    /**
     * A collection of properties and methods that are unique references
     * per each {@linkcode theory.string} instance.
     *
     * @memberof! theory.string
     * @namespace
     */
    i: {},

    /*
     *
     */
    prep: function(source, config){
      this.source = source;
      this.config = config || {};
      this.i = Object.create(this.i);
      return this;
    },

    /**
     * Parse a string based on a set of instructions.
     *
     * @memberof! theory.string
     * @method
     * @param {string} name - The lookup name used to find the instruction set.
     * @param {object} [instructions] - `name` will be ignored if an instruction set it passed as this parameter.
     * @return {object} the processed result, usually a structure of objects and arrays.
     */
    parse: function(name, instructions){
      if ( instructions || (instructions=this.instructionSets[name]) ) {
        return this.instructions.processGroup(
          instructions,
          'default',
          (this.tree={string: this.source.trim()})
        );
      }
      else {
        throw new Error('unknown instruction set ' + name);
      }
    },

    /**
     * Responsible for handling all of the instruction sets for {@linkcode theory.string t.string}
     *
     * New instruction sets can be added using {@linkcode theory.string.instructions.___callable t.string.instruction}
     *
     * @memberof! theory.string
     * @namespace
     */
    instructions: t.method({

      /**
       * Get a named instruction set, that has been previously defined.
       *
       * @memberof! theory.string.instructions
       * @method ___callable
       * @param {string} name - The lookup name used to find the instruction set.
       *
       *//**
       *
       * Set a named instruction set that can be used with {@linkcode theory.string.parse}
       *
       * @memberof! theory.string.instructions
       * @method ___callable
       * @param {string} name - The lookup name that the instructions will be stored under.
       * @param {string} instructions - The instructions object
       * @chainable
       */
      method: function(name, instructions){
        if ( arguments.length > 1 ) {
          this.instructionSets[name] = instructions;
          return this;
        }
        else {
          return this.instructionSets[name];
        }
      },
      
      attributes: {
        /**
         * The parser works by logically following an object list of instructions, which in turn
         * have sub instructions that can loop back to other instructions.
         *
         * @memberof! theory.string.instructions
         * @method
         * @param {object}        instructions - the overaching set of instructions
         * @param {string|object} name         - an string describing the current name of the instruction (or the actual instruction in object form)
         * @param {object}        snowball     - initially starts with the string to be passed
         *   defined as `{string:'...'}`, later is used to keep track of the parsing, and then is the
         *   object to be returned after processing is complete.
         */
        processGroup: function( instructions, name, snowball ){
          var a,i,l, mode = typeof name === 'string' ? instructions[name] : name;
          if ( mode ) {
            if ( mode.content ) {
              /// if there are already children at this level, we need to pass deeper.
              if ( snowball.children ) {
                for ( a=snowball.children, i=0, l=a.length; i<l; i++ ) {
                  this.processGroup( instructions, name, a[i] );
                }
              }
              else {
                for ( a=mode.content, i=0, l=a.length; i<l; i++ ) {
                  this.processItem( instructions, a[i], snowball );
                }
              }
            }
          }
          return snowball;
        },
        /**
         * Each instruction set is applied to a particular range of the string to be parsed.
         * This string range is tracked within the snowball object.
         *
         * An instruction set can contain one or more groups of sub-instructions.
         *
         * The default behaviour is to run all sub-instructions in sequence. However, if a
         * group of sub-instructions is set to short circuit, then any time a sub-instruction
         * finds a match, processing will cease for that group and instead start for the next
         * (if there is one).
         *
         * @memberof! theory.string.instructions
         * @method
         * @param {object} instructions   - the overarching object that contains all the instructions
         * @param {object} instruction    - an individual instruction, that has been drilled down to by
         * {@linkcode theory.string.instructions.processGroup processGroup}
         * @param {object} snowball       - see the description for {@linkcode theory.string.instructions.processGroup processGroup}
         * @param {object} [options]      - change the behaviour of this function
         * @param {object} [options.dividerOffset=0] - change where the divider will start from
         */
        processItem: function( instructions, instruction, snowball, options ){
          var c,a,n, l,i,e, aa,ii,ll, itm, div, book, wrap, range, ranges;
          !options && (options = { dividerOffset: 0 });
          if ( instruction.divide || instruction.ranges ) {
            /// if this set hasnt been compiled yet, do so now.
            if ( !instruction.compiled ) {
              instruction.compiled = {};
              /// if we have any ranges, compile them into a Matchbook
              if ( instruction.ranges ) {
                instruction.compiled.ranges = {
                  starts: t.matchbook.create(),
                  ends: t.matchbook.create()
                };
                /// step each sub instruction and build an array of the start and end symbols
                for ( a=instruction.ranges, i=0, l=a.length; i<l; i++ ) {
                  if ( (n=a[i]) && (itm=instructions[n]) ) {
                    /// ranges must have a start and end
                    itm.start && instruction.compiled.ranges.starts.add( itm.start, itm );
                    itm.end   && instruction.compiled.ranges.ends.add( itm.end, itm );
                  }
                }
                /// Compile our matchbooks, so they are ready to find particular symbols within a string.
                instruction.compiled.ranges.starts.compile();
                instruction.compiled.ranges.ends.compile();
              }
              /// if we have any divisions, compile them into a Matchbook
              if ( instruction.divide ) {
                instruction.compiled.dividers = [];
                /// if we have any divide directives, we need to create matchbooks for the divide symbols.
                for ( a=instruction.divide, i=0, l=a.length; i<l; i++ ) {
                  /// create a new book to house the dividers
                  book = t.matchbook.create();
                  /// if an array of dividers is presented, these should be given the same precedence.
                  if ( a[i].join ) {
                    for ( aa=a[i], ii=0, ll=aa.length; ii<ll; ii++ ) {
                      if ( (n = aa[ii]) && (itm = instructions[n]) ) {
                        itm.token && book.add( itm.token, itm );
                      }
                    }
                  }
                  /// otherwise create a book out of a single divider.
                  else {
                    if ( (n = a[i]) && (itm = instructions[n]) ) {
                      itm.token && book.add( itm.token, itm );
                    }
                  }
                  /// add this book to the list of dividers, in the order they are to be applied.
                  instruction.compiled.dividers.push( book.compile() );
                }
              }
            }
            /// set our starting division point to 0
            div = 0;
            ///
            wrap = null;
            ///
            ranges = [];
            ///
            if ( instruction.compiled ) {
              a = instruction.compiled.dividers || [];
              i = options.dividerOffset;
              l = a.length;
              /// quickly scan the entire string for any divisions, being wary of ranges, and initial divider offset.
              do {
              //for ( a=instruction.compiled.dividers, i=options.dividerOffset, l=a.length; !wrap && i<l; i++ ) {
                for ( aa=snowball.string, ii=0, ll=aa.length; ii<ll; ii++ ) {
                  /// if we find a divide.
                  if ( a[i] && !range && (c = a[i].compare(aa, ii)) ) {
                    itm = a[i].userdata(c);
                    /// @TODO: handle if itm.length > 1 -- meaning multiple dividers have been provided with a similar start
                    itm = itm[0];
                    !wrap && (wrap = {
                      type: itm.name,
                      children: [],
                      token: c,
                      dividers: a,
                      divider: i
                    });
                    wrap.children.push((wrap.lastChild = {
                      type: itm.makes,
                      string: aa.substring(div, ii)
                    }));
                    div = ii + c.length;
                    ii += c.length - 1;
                  }
                  /// if we are to expect any ranges in this parsing.     (hello(test)this) (hello"this is a test)")
                  else if ( instruction.compiled.ranges ) {
                    /// if we already have a range on-the-go, we are in range mode.
                    if ( range ) {
                      /// did we find a range end? that matches our current range.
                      if ( (c = instruction.compiled.ranges.ends.compare(aa, ii)) && this.ranges.hasEnd(range, c) ) {
                        /// collapse the range down to the one that matched -- out of possible endings
                        this.ranges.chooseEnd(range, c);
                        /// only bother with this if we are ending our target/base range.
                        if ( range.metrics ) {
                          range.metrics.innerEnd = ii;
                          range.metrics.outerEnd = ii + c.length;
                          range.outer = aa.substring(range.metrics.outerStart, range.metrics.outerEnd);
                          range.string = aa.substring(range.metrics.innerStart, range.metrics.innerEnd);
                        }
                        /// step back to the previous range
                        range = ranges.pop();
                        /// move on the char cursor
                        ii += c.length - 1;
                      }
                      /// did we find a range start?
                      else if ( (c = instruction.compiled.ranges.starts.compare(aa, ii)) ) {
                        itm = instruction.compiled.ranges.starts.userdata(c);
                        /// store the current range
                        ranges.push(range);
                        range = this.ranges.make(itm);
                        /// move on the char cursor
                        ii += c.length - 1;
                      }
                    }
                    /// if we have already recorded this range before, skip it out entirely.
                    else if ( snowball.ranges && snowball.ranges.lookup[ii] ) {
                      ii = snowball.ranges.lookup[ii].metrics.innerEnd;
                    }
                    /// we have detected the start of a range, we need to switch into range mode.
                    else if ( (c = instruction.compiled.ranges.starts.compare(aa, ii)) ) {
                      itm = instruction.compiled.ranges.starts.userdata(c);
                      !snowball.ranges && (snowball.ranges = {
                        lookup: {},
                        list: []
                      });
                      range = this.ranges.make(itm, {
                        outerStart: ii,
                        innerStart: ii + c.length
                      });
                      snowball.ranges.list.push(range);
                      snowball.ranges.lookup[ii] = range;
                      /// move on the char cursor
                      ii += c.length - 1;
                    }
                  }
                }
                i++;
              } while ( !wrap && i<l );
              /// if we have a wrap, then we have created divisions that need to be managed.
              if ( wrap && wrap.lastChild ) {
                wrap.children.push((wrap.lastChild = {
                  type: wrap.lastChild.type,
                  string: snowball.string.substring(div, snowball.string.length)
                }));
                /// walk up the list of dividers in precedence order, making sure to work on the individual divided strings.
                if ( wrap.divider + 1 < wrap.dividers.length ) {
                  for ( aa=wrap.children, ii=0, ll=aa.length; ii<ll; ii++ ) {
                    this.instructions.processItem( instructions, instruction, aa[ii], { dividerOffset: wrap.divider+1 } );
                  }
                }
                /// now parse for the next level as per the childs type.
                for ( aa=wrap.children, ii=0, ll=aa.length; ii<ll; ii++ ) {
                  if ( aa[ii].type.join ) {
                    aa[ii].type = aa[ii].type[ii];
                  }
                  this.instructions.processGroup( instructions, aa[ii].type, aa[ii] );
                }
                /// make sure the snowball can store children
                !snowball.children && (snowball.children = []);
                snowball.children.push(wrap);
                /// tidy up!
                delete wrap.divider;
                delete wrap.dividers;
                delete wrap.lastChild;
                wrap = null;
              }
              /// we will only get here when there are no more divisions, but there are ranges.
              else if ( snowball.ranges && snowball.ranges.list ) {
                /// only bother wrapping if there is more than one range, or the range doesn't encompass the whole segment.
                if ( snowball.ranges.list.length > 1 || (snowball.ranges.list.length === 1 && snowball.ranges.list[0].outer && snowball.ranges.list[0].outer.length < snowball.string.length) ) {
                  snowball.children = [(wrap = {
                    type: 'combination',
                    children: []
                  })];
                  div = 0;
                  /// push a null range to the end so we can support any remaining string
                  snowball.ranges.list.push(null);
                  /// step each range and thread it as children along with any interwoven strings.
                  for ( a=snowball.ranges.list, i=0, l=a.length; i<l; i++ ) {
                    /// if there was an interwoven string
                    if ( (itm = snowball.string.substring(div, a[i] ? a[i].metrics.outerStart : snowball.string.length)) ) {
                      wrap.children.push({
                        type: 'string',
                        string: itm
                      });
                    }
                    if ( a[i] ) {
                      /// add the range
                      wrap.children.push(a[i]);
                      this.instructions.processGroup( instructions, a[i].type, a[i] );
                      div = a[i].metrics.outerEnd;
                    }
                  }
                }
                /// the range exactly matches the length of the string/segment.
                else if ( (a = snowball.ranges.list[0]) ) {
                  snowball.children = [a];
                  this.instructions.processGroup( instructions, a.type, a );
                }
              }
              /// if we are here it means we didn't find a division or a range, if that happens
              /// some instruction sets will tell us what to make of these simple strings.
              /// generally if will mean treating them as a singular division.
              else if ( instruction.makes ) {
                this.instructions.processGroup( instructions, instruction.makes, snowball );
              }
              /// tidy up
              delete snowball.ranges;
            }
          }
          return snowball;
        }
      }
    }),

    /**
     * A collection of methods for dealing with {@linkcode theory.string} ranges.
     *
     * @memberof! theory.string
     * @namespace
     */
    ranges: {

      /**
       * Creates a range object from multiple tokens - this handles the situiaton
       * if ranges have similar starts, but (obviously) different ends. For example,
       * when scanning for ranges that can be either `[...]` and `[...]?`
       *
       * @memberof! theory.string.ranges
       * @method
       */
      make: function(itm, metrics){
        var range = {
          start: [],
          end: [],
          type: []
        };
        for ( var i=0; i<itm.length; i++ ) {
          range.start.push(itm[i].start);
          range.end.push(itm[i].end);
          range.type.push(itm[i].name);
        }
        if ( metrics ) {
          range.metrics = metrics;
        }
        return range;
      },

      /**
       * Test whether a specific range collection has met its end.
       *
       * @memberof! theory.string.ranges
       * @method
       */
      hasEnd: function(range, c){
        return range.end.indexOf(c) != -1;
      },

      /**
       * Returns which range has ended out of the possible choices
       * contained with the range object.
       *
       * @memberof! theory.string.ranges
       * @method
       */
      chooseEnd: function(range, c){
        var n = range.end.indexOf(c);
        range.start = range.start[n];
        range.type = range.type[n];
        range.end = range.end[n];
        return range;
      }

    }

  });

  /*
   * Use these instructions to parse Method keys for theory's overload ability
   */
  theory.plugins.string.instructions('t-key', {
    'default': {
      content: [
        { ranges: ['squareOptional', 'square'] }
      ]
    },
    'squareOptional': {
      name: 'squareOptional',
      start: "[",
      end: "]?",
      content: [
        { divide: ['commas'], makes: 'item' }
      ]
    },
    square: {
      name: 'square',
      start: "[",
      end: "]",
      content: [
        { divide: ['commas'], makes: 'item' }
      ]
    },
    commas: {
      name: 'commas',
      token: ',',
      makes: 'item'
    },
    item: {
      name: 'item',
      content: [
        { divide: ['ors', 'colon'] }
      ]
    },
    ors: {
      name: 'ors',
      token: '|',
      makes: 'item'
    },
    colon: {
      name: 'colon',
      token: ':',
      makes: ['item', 'name']
    }
  });

  /**
   * This is the basic instruction set for the Object Path Notation
   *
   * @member {object} instructions.opn
   * @memberof! theory.string.shared
   */
  theory.plugins.string.instructions('opn', {
    'default': {
      content: [
        { divide: ['segments'],
          makes: 'segment',
          ranges: ['squote', 'dquote', 'square', 'angle', 'bubble'] }
      ]
    },
    /// ranges
    bubble: {
      name: 'bubble',
      start: "(",
      end: ")",
      content: [
        { divide: ['spaces', 'segments'], /// @TODO: Require support for fallback one division i.e. no division
          makes: 'segment',
          ranges: ['squote', 'dquote', 'square', 'angle', 'bubble'] }
      ]
    },
    square: {
      name: 'square',
      start: "[",
      end: "]",
      content: [
        { divide: ['comparison'],
          makes: 'attribute',
          ranges: ['squote', 'dquote'] }
      ]
    },
    squote: {
      name: 'single-quote',
      start: "'",
      end: "'"
    },
    dquote: {
      name: 'double-quote',
      start: "\"",
      end: "\""
    },
    angle: {
      name: 'angle',
      start: "<",
      end: ">"
    },
    /// dividers
    ands: {
      name: 'ands',
      token: '&',
      makes: 'and'
    },
    ors: {
      name: 'ors',
      token: '|',
      makes: 'or'
    },
    spaces: {
      name: 'spaces',
      token: ' ',
      makes: 'spaced'
    },
    segments: {
      name: 'segments',
      token: '/',
      makes: 'segment'
    },
    comparison: {
      name: 'comparison',
      token: ['!=', '$=', '^=', '='],
      makes: ['attribute', 'value']
    },
    assignment: {
      name: 'assignment',
      token: [':='],
      makes: ['assignee', 'value']
    },
    commas: {
      name: 'commas',
      token: ',',
      makes: 'comma'
    },
    /// subitems
    spaced: {
      name: 'spaced'
    },
    segment: {
      name: 'segment',
      content: [
        { divide: ['ands', 'ors', 'commas', 'assignment', 'comparison'],
          ranges: ['squote', 'dquote', 'square', 'angle', 'bubble'] }
      ]
    },
    comma: {
      name: 'comma',
      content: [
        { divide: ['assignment', 'comparison'],
          ranges: ['squote', 'dquote', 'square', 'angle', 'bubble'] }
      ]
    },
    assignee: {
      name: 'assignee',
      content: [
        { divide: ['commas'],
          ranges: ['squote', 'dquote'] }
      ]
    },
    attribute: {
      name: 'attribute',
      content: [
        { divide: ['commas'],
          ranges: ['squote', 'dquote'] }
      ]
    },
    value: {
      name: 'value',
      content: [
        { divide: ['commas'],
          ranges: ['squote', 'dquote'] }
      ]
    }
  });

  /*
   * @TODO: t.opn needs to be worked out correctly in the constructor format
   */
  t.opn = function(opn){
    var s = t.string(opn).parse('opn');
    s.segments = function(){
      var i = 0, segs = this.children[0].children;
      return {
        next: function(){
          return segs[i++];
        }
      };
    };
    return s;
  };

  t.opn.wrap = function(opn){
    return {
      string: function(){
        return opn.string;
      },
      strings: function(){
        var ret = [];
        for ( var i=0, a=opn, l=a.length; i<l; i++ ) {
          ret.push(a[i].string);
        }
        return ret;
      }
    };
  };
  
  t.string = function(source, config){
    return this.plugins.string.create(source, config);
  }

  return theory.plugins.string;

});