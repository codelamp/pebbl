theory = {};

/**
 *
 */
theory.base = {
  
  create: function(){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  createNS: function(ns){
    return this.prepNS.apply(Object.create(this));
  },
  
  prep: function(){
    var args = Array.prototype.slice.apply(arguments);
    args.unshift(this);
    return _.extend.apply(_, args);
  },
  
  /**
   * When creating under a new namespace, we only wish to reset certain things
   */
  prepNS: function(){
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

theory.mixins = {};

/**
 * class base handler
 */
theory.mixins.base = {
  
  create: function(){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  createNS: function(ns){
    return this.prepNS.apply(Object.create(this));
  }
  
};

theory.plugins = {};

/**
 * With thanks to: http://jsfiddle.net/DRf9P/
 * Simon Sarris, www.simonsarris.com, sarris@acm.org
 */
var transform = theory.transform = {

  create: function(){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  prep: function(){
    this.reset();
    return this;
  },

  reset: function() {
    this.m = [1,0,0,1,0,0];
    return this;
  },

  multiply: function(matrix) {
    var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
    var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
    var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
    var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
    var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
    var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    this.m[4] = dx;
    this.m[5] = dy;
    return this;
  },

  invert: function() {
    var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
    var m0 = this.m[3] * d;
    var m1 = -this.m[1] * d;
    var m2 = -this.m[2] * d;
    var m3 = this.m[0] * d;
    var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
    var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
    this.m[0] = m0;
    this.m[1] = m1;
    this.m[2] = m2;
    this.m[3] = m3;
    this.m[4] = m4;
    this.m[5] = m5;
    return this;
  },
  
  rotate: function(deg){
    return this.rotateRad(Math.PI/180 * deg);
  },
  
  rotateRad: function(rad) {
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    var m11 = this.m[0] * c + this.m[2] * s;
    var m12 = this.m[1] * c + this.m[3] * s;
    var m21 = this.m[0] * -s + this.m[2] * c;
    var m22 = this.m[1] * -s + this.m[3] * c;
    this.m[0] = m11;
    this.m[1] = m12;
    this.m[2] = m21;
    this.m[3] = m22;
    return this;
  },

  translate: function(x, y) {
    this.m[4] += this.m[0] * x + this.m[2] * y;
    this.m[5] += this.m[1] * x + this.m[3] * y;
    return this;
  },

  scale: function(sx, sy) {
    sy = sy || sx;
    this.m[0] *= sx;
    this.m[1] *= sx;
    this.m[2] *= sy;
    this.m[3] *= sy;
    return this;
  },

  transformPoint: function(px, py, as) {
    var x = px;
    var y = py;
    px = x * this.m[0] + y * this.m[2] + this.m[4];
    py = x * this.m[1] + y * this.m[3] + this.m[5];
    return as === 'array' ? [px, py] : {x: px, y: py};
  }
  
};

/**
 *
 */
var VelocityRange = theory.plugins.velocityRange = {
  
  max: 0,
  zero: 0,
  min: 0,
  step: 0,
  internal: null,
  
  create: function( min, zero, max, step ){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  prep: function( min, zero, max, step ){
    this.current = {
      min: min,
      zero: zero,
      max: max,
      step: step
    };
    this.internal = {
      min: min,
      zero: zero,
      max: max,
      step: step,
      value: 0,
      stretch: 1
    };
    return this;
  },
  
  /**
   *
   */
  stretch: function( multiplier ){
    this.internal.stretch = multiplier;
    this.current.min = this.internal.min * multiplier;
    this.current.max = this.internal.max * multiplier;
  },
  
  /**
   *
   */
  value: function( v ){
    if ( arguments.length ) {
      (v > this.current.max) && (v = this.current.max);
      (v < this.current.min) && (v = this.current.min);
      this.internal.value = v;
      return this;
    }
    else {
      return this.internal.value;
    }
  },
  
  /**
   *
   */
  stepUp: function( step ){
    var v = this.internal.value + (step || this.current.step);
    (v > this.current.max) && (v = this.current.max);
    this.internal.value = v;
    return this;
  },
  
  /**
   *
   */
  stepDown: function( step ){
    var v = this.internal.value - (step || this.current.step);
    (v < this.current.min) && (v = this.current.min);
    this.internal.value = v;
    return this;
  },
  
  /**
   *
   */
  stepZero: function( step ){
    var v = this.internal.value;
    if ( v > this.current.zero ) {
      v -= (step || this.current.step); (v < this.current.zero) && (v = this.current.zero);
    }
    else if ( v < this.current.zero ) {
      v += (step || this.current.step); (v > this.current.zero) && (v = this.current.zero);
    }
    this.internal.value = v;
    return this;
  },
  
  /**
   *
   */
  isZero: function( margin ){
    var v = this.internal.value;
    if ( margin ) {
      return (v > (this.current.zero - margin)) && (v < (this.current.zero + margin));
    }
    else {
      return v === this.current.zero;
    }
  },
  
  /**
   *
   */
  zero: function(){
    this.internal.value = this.current.zero;
  }
  
};

/**
 * Tests for things
 */
var is = theory.is = {
  /**
   *
   */
  array: function( item ){
    return (item && item.join) ? item : false;
  },
  /**
   *
   */
  string: function( item ){
    return (item && item.split) ? item : false;
  },
  /**
   *
   */
  number: function( item ){
    return typeof item == 'number';
  },
  /**
   *
   */
  literalObject: function( item ){
    return (typeof item === 'object') && (item.constructor === Object) ? item : false;
  },
  /**
   *
   */
  callable: function(item){
    return (item && item.call && item.apply) ? item : false;
  }
};

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
    tid.cancel = go.bind(run.internal.cancel, tid);
    return tid;
  }
  
};

var mix = {
  
  eventHandling: {
    
    /**
     *
     */
    apply: function( target ){
      target.listeners = jQuery({});
      target.trigger = this.trigger;
      target.on = this.on;
      target.off = this.off;
      return target;
    },
    
    /**
     * 
     */
    trigger: function(){
      this.listeners.triggerHandler.apply(this.listeners, arguments);
      return this;
    },
  
    /**
     * 
     */
    on: function(){
      /// scan the arguments for the callback -- we don't 100% know which argument.
      for ( var o, i=0, a=arguments, l=a.length; i<l; i++ ) {
        if ( a[i] && a[i].apply && a[i].call && !a[i].bound ) {
          o = a[i];
          a[i] = go.bind(a[i], this);
          a[i].bound = o;
        }
      }
      this.listeners.on.apply(this.listeners, arguments);
      return this;
    },
  
    /**
     * 
     */
    off: function(){
      this.listeners.off.apply(this.listeners, arguments);
      return this;
    }
    
  }
  
};

/**
 * A collection of performable actions
 */
var go = theory.go = {
  /**
   *
   */
  bind: function( method, context ){
    var f = function(){
      return method.apply(context||this, arguments);
    };
    f.bound = method;
    return f;
  },
  /**
   *
   */
  bindCollection: function( collection, context, collect ){
    var i, bound = collect || {};
    for ( i in collection ) {
      if ( collection.hasOwnProperty ) {
        if ( collection.hasOwnProperty(i) && is.callable(collection[i]) ) {
          bound[i] = go.bind(collection[i], context);
        }
      }
      else if ( is.callable(collection[i]) ) {
        bound[i] = go.bind(collection[i], context);
      }
    }
    return bound;
  },
  /**
   *
   */
  unbind: function( method ){
    if ( method.bound ) {
      return method.bound;
    }
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
   *
   */
  dupe: function( item ){
    return item ? Array.prototype.slice.call(item, 0) : [];
  },
  /**
   *
   */
  unshift: function( array ){
    Array.prototype.unshift.apply(array, go.array(arguments, 1) );
    return array;
  },
  /**
   *
   */
  push: function( array ){
    Array.prototype.push.apply(array, go.array(arguments, 1) );
    return array;
  },
  /**
   * Cast passed in value to an array
   * @TODO: improvements, currently only support converting array-like items
   */
  array: function( item, startFrom ){
    return item ? Array.prototype.slice.call(item, startFrom || 0): [];
  },
  /**
   * A version of forEach that always expects a context (as it
   * pretty much always makes sense to specifically define context)
   * it also supports passing arguments.
   *
   * Argument order is specfically designed to layout with the
   * callback as the final argument.
   * 
   * usage:
   *
   *   go.forEach(this, ['hello world'], console.log);
   *
   * @author PG March 2015
   */
  forEach: function( items, context, args, method ){
    if ( arguments.length < 3 ) {
      throw new Error('forEach expects 4 args: items, context, args and callback.');
    }
    var argsCallable = is.callable(args),
        contextCallable = is.callable(context)
    ;
    method = is.callable(method) || function(){};
    items = is.array(items) || go.array(items);
    context = context || this;
    args = is.array(args) || argsCallable 
        ? (argsCallable ? args : go.dupe(args)) 
        : go.array(args)
    ;
    if ( argsCallable && contextCallable ) {
      items.forEach(function(v, i, a){
        var ctx = context.call(a, v, i , a, method);
        var arg = args.call(ctx, v, i, a, method);
        method.apply(ctx, go.unshift(arg, v, i, a));
      });
    }
    else if ( argsCallable ) {
      items.forEach(function(v, i, a){
        var arg = args.call(context, v, i, a, method);
        method.apply(context, go.unshift(arg, v, i, a));
      });
    }
    else if ( contextCallable ) {
      args.unshift(0, 0, items);
      items.forEach(function(v, i, a){
        args[0] = v;
        args[1] = i;
        var ctx = context.call(a, v, i, a, method);
        method.apply(ctx, args);
      });
    }
    else {
      args.unshift(0, 0, items);
      items.forEach(function(v, i){
        args[0] = v;
        args[1] = i;
        method.apply(context, args);
      });
    }
  }
};