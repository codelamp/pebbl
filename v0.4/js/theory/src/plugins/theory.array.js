async('theory.array', ['theory', 'theory.is', 'theory.to'], function(theory, is, to){

  /**
   * A collection of performable actions
   */
  theory.plugins.array = (function(mixin){

    var local = {

      /**
       *
       */
      dupe: function( item ){
        return item ? to.array(item, 0) : [];
      },

      /**
       *
       */
      unshift: function( array ){
        if ( !is.array(array) ) { array = to.array(array); }
        Array.prototype.unshift.apply(array, to.array(arguments, 1) );
        return array;
      },

      /**
       *
       */
      push: function( array ){
        if ( !is.array(array) ) { array = to.array(array); }
        Array.prototype.push.apply(array, to.array(arguments, 1) );
        return array;
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
        items = is.array(items) || to.array(items);
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

    return local;

  })(theory.plugins.array);

  return theory.plugins.array;

});