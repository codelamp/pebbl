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