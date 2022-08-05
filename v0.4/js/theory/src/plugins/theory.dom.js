async('theory.plugins.dom', ['theory'], function(theory){

  var t = theory; theory.plugins = theory.plugins || {};

  /**
   * Theory's early dom handling -- it is used by Theory before 
   * {@linkcode theory.navigate t.navigate} has been loaded.
   *
   * It only supports rudimentary dom handling, which is mostly all that is 
   * required for the majority of script-prep.
   *
   * 1. Create basic elements
   * 2. Select elements using basic selectors
   *
   * @memberof! theory
   * @namespace theory.dom
   * @see theory.navigate
   * @todo the create elements part needs to be ported from kipple
   */
  theory.plugins.dom = t.dom || t.creator.callable({
  
    i: null,
  
    prep: function(){
      this.i = {};
      this.i.items = [];
    },
  
   /**
    * Find elements using simplistic selectors, and does not require 
    * `document.querySelectorAll` to exist -- but it will use it if it does.
    *
    * Instead it uses a mixture of `getElementsByTagName`, 
    * `getElementsByClassName` and `childNode` navigation.
    *
    * This code is designed to be lightweight, and will **ONLY** support 
    * the most common/basic selectors. These include:
    *
    * 1. tag selectors
    * 2. classname selectors
    * 3. attribute selectors
    *
    * Before you ask why? This code is only used to help Theory boot -- 
    * it is not really designed to be used externally.
    *
    * ##### How it works
    *
    * This code relies on the user correctly breaking the selector up into 
    * its "particles" and "bits". E.g.
    *
    *     t.dom.find('body',['div','.classname'],['span',['@attribute','~=','123']]);
    *
    *     /// jQuery('body div.classname span[attribute~=123]');
    *
    * This saves quite a bit of processing and in library file size, but 
    * obviously at the cost of readability, user's code size and user error.
    *
    * Hence the reason this code is really only for Theory to use until 
    * something else better has loaded.
    *
    * - **particle** -- essentially an array of bits that require to be grouped, i.e. `['@attr', '=', '123']`
    * - **bit** -- a piece of a selector that can't be broken down any further, i.e. `'@attr'`, `'='`, or `'123'`
    *
    * The reason for the code only supporting the above three types of selector, 
    * is because I have only defined `bit` handlers for those three types. 
    * There is nothing to stop external code extending this with your own bit 
    * handlers, if you so wish.
    *
    * ##### Relationships / Combinators
    *
    * The only supported relationship selectors are  "descendant" (`body span`)
    * and "child" (`body > span`).
    *
    * More complex relationships like that of the adjacent sibling (`+`) and 
    * general sibling (`~`) combinators are not supported.
    *
    * ##### Why not use an existing CSS selector engine?
    *
    * The simplest answer to this is that I wanted this library to be self-sufficient
    * but didn't want to embed another 10k+ just to handle all selector edge-cases.
    * Especially when I tend to only use the most basic selectors from a code perspective.
    *
    * I am currently planning to add code to allow this dom handling to hand off to 
    * either jQuery or sizzle, if they are loaded.
    *
    * ##### Why not use `document.querySelectorAll`?
    *
    * Purely from a browser support perspective. True, nearly everything supports 
    *`querySelectorAll` quite well these days. But to have a core part of your 
    * library caught out even before it has fully booted because of a simple 
    * missing function isn't a very good place to be in.
    *
    * ##### Extensible
    *
    * As with nearly everything in Theory, you can extend the basic dom handling. This
    * can be achieved by adding to or changing handlers in the {@linkcode theory.dom.bits}
    * array.
    *
    * The `handler` function in each handler object should return a callback to test each 
    * element, and to specify whether the handler is to be run as a "find" operation (default)
    * or as a "filter".
    *
    * @example
    * // equivalent of `body .classname [title]`
    * // which would match: <body><span class="classname"><i title /></span></body>
    *
    * t.dom.findSimple('body', '.classname', '@title');
    *
    * @example
    * // equivalent of `body.classname [title]`
    * // which would match: <body class="classname"><span><i title /></span></body>
    *
    * t.dom.findSimple(['body', '.classname'], '@title');
    *
    * @example
    * // equivalent of `body.classname[title]`
    * // which would match: <body class="classname" title></body>
    *
    * t.dom.findSimple(['body', '.classname', '@title']);
    *
    * @example
    * // equivalent of `body.classname[title=example]`
    * t.dom.findSimple(['body', '.classname', ['@title', '=', 'example']]);
    *
    * @example
    * // equivalent of `body .classname[title=example]`
    * t.dom.findSimple('body', ['.classname', ['@title', '=', 'example']]);
    *
    * @example
    * // equivalent of `body > .classname[title=example]`
    * t.dom.findSimple('body', '>', ['.classname', ['@title', '=', 'example']]);
    *
    * @todo implement support for #ids
    *
    * @memberof! theory.dom
    * @method
    * @param {element} [context] Define the base element that this function will work from
    * @param {...(string|array)} [arguments] Define the particles and bits that make up your selector
    */
    findSimple: function(){
      if ( document.querySelectorAll ) {
        this.i.items = to.array(document.querySelectorAll(this.implodeQuery(arguments)));
      }
      else {
        this.i.items = this.explodedQuery(arguments);
      }
      return this;
    },
  
    /**
     * Take the simple query and work it back into an actual selector, so that it can be passed to `document.querySelectorAll`.
     *
     * @memberof! theory.dom
     * @method
     * @param {array} args Array of bits and particles to be built back into a selector string.
     */
    implodeQuery: function(args){
      for ( var query = '', i=0, a=args, l=a.length, item; i<l, item=a[i]; i++ ) {
        if ( item.join ) {
          if ( item[0].charAt(0) === '@' ) {
            item[0] = item[0].substring(1, item[0].length);
            switch ( item.length ) {
              case 1: item = '[' + item[0] + ']'; break;
              case 3: item = '[' + item[0] + item[1] + '"' + item[2] + '"]'; break;
              default: throw new Error('unable to understand implosion of attribute.'); break;
            }
          }
          else {
            item = item.join('');
          }
        }
        query += ' ' + item;
      }
      return query;
    },
  
    /**
     * explodedQuery allows for a more backward compatible way of describing
     * css selectors -- where the browser may not support querySelector. And
     * where Theory may not have string theory loaded. Its primary use is
     * to aid Theory code before everything is fully loaded and functional.
     *
     * @memberof! theory.dom
     * @method
     * @private
     */
    explodedQuery: function(args, context){
      /// support for passing the context as the first item in the args array
      if ( is.element(args[0]) ) { context = (args=to.array(args)).shift(); }
      /// support for passing no context at all
      if ( !context ) { context = document.documentElement; }
      context = this.explodedQueryParticle(args, context, {
        combinator: ' '
      });
      return context;
    },
  
    /**
     * Deal with the array parts i.e. "Particles" of a dom selector
     * each particle can be divided into smaller string "Bits"
     * each particle should represent an entire level in a dom selector
     * i.e. ['body', '.class-name'] or ['span', ':first-child'] or
     * ['@attribute', '=', 'something']
     *
     * @memberof! theory.dom
     * @method
     * @private
     */
    explodedQueryParticle: function(item, context, options, particle){
      if ( particle ) {
        particle.content = item;
        particle.level++;
      }
      for ( var i=0, a=item, l=a.length, bit, rest; i<l, bit=a[i]; i++ ) {
        if ( is.array(bit) ) {
          context = this.explodedQueryParticle(bit, context, options, particle || { level: 0 });
        }
        else if ( is.string(bit) ) {
          /// record where we are inside this particle
          if ( particle ) {
            particle.i = i;
          }
          /// combinators can only be changed outside of a particle
          else if ( bit === '>' ){
            if ( options.combinator === '>' ) {
              throw new Error('unexpected child combinator: ' + item.join(' '));
            }
            options.combinator = '>';
            continue;
          }
          else if ( bit === '+' || bit === '~' ) {
            throw new Error(bit + ' combinator not supported by t.dom at early load.');
          }
          context = this.explodedQueryParticleBit(bit, context, options, particle);
          /// revert the combinator
          if ( options.combinator !== ' ' ) {
            options.combinator = ' ';
          }
          /// move our cursor along if we used up more bits than just one.
          if ( particle && particle.i !== i ) {
            i = particle.i;
          }
        }
        /// if we have lost our way, escape.
        if ( !context ) break;
      }
      return context;
    },
  
    /**
     * Deal with string parts i.e. "Bits" of a dom selector
     * these can't be divided any further, they represent items
     * like 'body' or '=' or ':first-child' or '>'
     *
     * @memberof! theory.dom
     * @method
     * @private
     */
    explodedQueryParticleBit: function(bit, context, options, particle){
      for ( var result, i=0, a=this.bits, l=a.length, test; i<l, test=a[i]; i++ ) {
        if ( test.pattern === true || test.pattern.test(bit) ) {
          result = test.handler.apply(this, arguments);
          if ( result ) {
            break;
          }
        }
      }
      if ( result.callback ) {
        if ( result.filter ) {
          context = this.filterElementsBy(context, result.callback);
        }
        else if ( options.combinator === '>' ) {
          context = this.filterElementsBy(context, result.callback, true);
        }
        else {
          context = this.findElementsBy(context, result.callback);
        }
      }
      return context;
    },
  
    /**
     * You can extend the "bit" support by adding a handler to this array. Bits represent individual strings that make up a simplistic selector.
     *
     * The `handler` function in each handler object should return a callback to test each 
     * element, and to specify whether the handler is to be run as a "find" operation (default)
     * or as a "filter".
     *
     * An example handler, that checks an element against a classname.
     *
     *     {
     *       pattern: /^\./,
     *       handler: function(bit, context, options, particle){
     *         return {
     *           callback: this.getElementHasClassNameCheck(bit.substring(1, bit.length)),
     *           filter: !!particle
     *         };
     *       }
     *     },
     *
     * @memberof! theory.dom
     * @property {Array} bits array of objects, each object in the form:
     * 
     *     { pattern: /regexp/,
     *       handler: function(bit, context, options, particle){
     *         return {
     *           callback: function(element){ return true||false },
     *           filter: true||false
     *         }
     *     } }
     */
    bits: [
      /// handle classnames
      {
        pattern: /^\./,
        handler: function(bit, context, options, particle){
          return {
            callback: this.getElementHasClassNameCheck(bit.substring(1, bit.length)),
            filter: !!particle
          };
        }
      },
      /// handle attributes
      { 
        pattern: /^@/,
        handler: function(bit, context, options, particle){
          var result = {};
          bit = bit.substring(1, bit.length);
          /// @attribute should only appear at the start of a particle
          /// or, if it appears elsewhere, it can only be @attribute-name
          /// i.e. there can be no comparison symbol or value.
          if ( particle && particle.i === 0 ) {
            /// particle level of 1 means search, > 1 means filter.
            result.filter = particle.level > 1;
            switch ( particle.content.length ) {
              case 1: result.callback = this.getElementHasAttributeCheck(bit); break;
              case 3:
                result.callback = this.getElementHasAttributeCheck(bit, {
                  comparison: particle.content[1],
                  value: particle.content[2]
                });
                particle.i += 2;
              break;
              case 4:
                result.callback = this.getElementHasAttributeCheck(bit, {
                  comparison: particle.content[1],
                  value: particle.content[2],
                  caseInsensitive: particle.content[3] === 'i'
                });
                particle.i += 3;
              break;
              default: throw new Error('unexpected format of attribute selector'); break;
            }
          }
          /// no particle, this can only be an @attribute-name search
          else {
            result.callback = this.getElementHasAttributeCheck(bit);
            result.filter = particle.i > 0;
          }
          return result;
        }
      },
      /// handle tag names
      {
        pattern: true,
        handler: function(bit, context, options, particle){
          return {
            callback: this.getElementHasTagNameCheck(bit),
            filter: false
          };
        }
      }
    ],
  
    /**
     * Scan through a list of elements, and their descendants.
     * Returns a list of those elements that caused the callback
     * to return true.
     *
     * @memberof! theory.dom
     * @method
     * @param {element|element[]} context A list of elements, or an singular element; used as the base context for the find operation.
     * @param {function} callback
     * @param {element} callback.(n) The callback expects its first argument to be an element
     * @param {boolean} callback.():returns The callback is expected to return a boolean.
     * @return {element[]} an array list of found elements.
     */
    findElementsBy: function(context, callback, result, depth){
      !result && (result = []);
      !depth && (depth = 0);
      if ( is.arraylike(context) ) {
        for ( var i=0, a=context, l=a.length, kid, res; i<l, kid=a[i]; i++ ) {
          if ( kid && (kid.nodeType === 1) ) {
            (depth > 0) && callback.call(this, kid) && result.push(kid);
            if ( kid.childNodes ) {
              this.findElementsBy(kid.childNodes, callback, result, depth + 1);
            }
          }
        }
      }
      else if ( is.element(context) ) {
        this.findElementsBy(context.childNodes, callback, result, depth);
      }
      if ( depth === 0 ) {
        return result;
      }
      else {
        return null;
      }
    },
  
    /**
     * Filter a list of elements using a callback.
     *
     * @memberof! theory.dom
     * @method
     * @param {element[]} list The list of elements to filter
     * @param {function} callback The callback will be used to test whether the current element should be filtered in (true) or out (false)
     * @param {element} callback.(n) The callback expects its first argument to be an element
     * @param {boolean} callback.():returns The callback is expected to return a boolean.
     * @return {element[]} an array list of filtered in elements.
     */
    filterElementsBy: function(list, callback, applyToChildren){
      for ( var result=[], i=0, a=list, l=a.length, res, kid; i<l, kid=a[i]; i++ ) {
        if ( kid && (kid.nodeType === 1) ) {
          if ( applyToChildren && kid.childNodes ) {
            (res = this.filterElementsBy(kid.childNodes, callback)) && (result = result.concat(res));
          }
          else {
            callback.call(this, kid) && result.push(kid);
          }
        }
      }
      return result;
    },
  
    /**
     * Return a closure that when called will tell if an element matches 
     * the particular classname.
     *
     * @memberof! theory.dom
     * @method
     * @private
     * @todo non-classList implementation required.
     */
    getElementHasClassNameCheck: function(classname){
      return function(elm){
        if ( elm && elm.classList ) {
          return elm.classList.contains(classname);
        }
        else {
          /// @TODO: non-classList implementation required.
        }
      }
    },
  
    /**
     * Return a closure that when called will tell if an element matches 
     * the particular attribute specification.
     *
     * @memberof! theory.dom
     * @method
     * @private
     */
    getElementHasAttributeCheck: function(attribute, opts){
      if ( opts && opts.comparison ) {
        //var qa = new RegExp('(^| )' + t.ExpReg.quote(attribute) + '( |$)');
        return function(elm){
          var v, m = false;
          if ( (v=elm.getAttribute(attribute)) ) {
            switch ( opts.comparison ) {
              case '=':  m = (v == opts.value); break;
              case '~=': m = (' '+v+' ').indexOf(opts.value) !== -1; break; /// @TODO:
              case '*=': m = v.indexOf(opts.value) !== -1; break;
              case '$=': m = v.lastIndexOf(opts.value) == v.length - opts.value.length; break;
              case '^=': m = v.indexOf(opts.value) === 0; break;
              case '|=': m = false; break; /// @TODO:
            }
          }
          return m;
        }
      }
      else {
        return function(elm){
          return elm.hasAttribute(attribute);
        }
      }
    },
  
    /**
     * Return a closure that when called will tell if an element has 
     * a particular tagname.
     *
     * @memberof! theory.dom
     * @method
     * @private
     */
    getElementHasTagNameCheck: function(tagname){
      tagname = tagname.toUpperCase();
      return function(elm){
        return elm && (elm.nodeName === tagname);
      };
    },
  
    /**
     * @memberof! theory.dom
     */
    source: function(){
      return this.i.items;
    },
  
    /**
     * @memberof! theory.dom
     */
    each: function(callback, context){
      var target = this.source();
      !context && (context=this);
      if ( !is.callable(callback) ) {
        return t.error(new Error('t.array().each callback must be is.callable().'));
      }
      for ( var i=0, a=target, l=a.length; i<l; i++ ) {
        callback.call(context, a[i], i);
      }
    },
  
    /**
     * Return the internal list of contextual items.
     *
     * @memberof! theory.dom
     * @method
     */
    getItems: function(){
      return this.i.items;
    },
  
    /**
     * Return the HTML of the current context, or the passed in parameter.
     *
     * @memberof! theory.dom
     * @method
     * @todo requires completion
     */
    html: function(param){
      if ( arguments.length ) {
        if ( is.element(param) ) {
          return param.nodeValue;
        }
        else {
          // @TODO:
        }
      }
      else {
        // @TODO:
      }
    }
  
  });
  
  return theory.plugins.dom;

});