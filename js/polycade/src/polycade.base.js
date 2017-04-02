async('polycade.base', ['theory'], function(t){

  var polycade = async.ref('polycade', {});

  return (polycade.base = t.mergeAndClone(t.base, {

    /**
     * prepare the options object
     */
    prepOptions: function(options){
      return this.options = t.mergeAndClone(this.defaultOptions || {}, options);
    }

  }));

});