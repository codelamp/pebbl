async('theory.plugins.velocityRange', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  theory.plugins.velocityRange = (function(mixin){

    var local = theory.base.mix(mixin || {}, {

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

    });

  })(theory.plugins.velocityRange)

})