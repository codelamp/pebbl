/**
 * Make sure the base polycade exists
 */
async('polycade.events', ['jq', 'theory', 'Phaser', 'underscore'], function($, theory, Phaser, _){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};
  var local;

  /**
   * The event manager for polycade
   */
  polycade.managers.events = theory.base.mix(polycade.managers.events || {}, local = {
    
    /**
     * Enhance an existing phaser events object
     */
    createFrom: function(obj){
      return _.extend(obj, local);
    },
    
    prep: function(options){
      options = options || {};
      return this;
    },
    
    splitNames: function(names){
      return names.split(' '); // @TODO: improve
    },
    
    on: function(name, callback, context, priority, args){
      _.each(this.splitNames(name), this.onEach, { events: this, handler: [callback, context, priority, args] });
      return this;
    },
    
    off: function(name, callback, context){
      _.each(this.splitNames(name), this.offEach, { events: this, handler: [callback, context] });
      return this;
    },
    
    onEach: function(name){
      !this.events[name] && (this.events[name] = new Phaser.Signal());
      this.events[name].add.apply(this.events[name], this.handler);
      return this;
    },
    
    offEach: function(){
      this.events[name] && this.events[name].remove.apply(this.events[name], this.handler);
      return this;
    },
    
    trigger: function(name, params){
      this[name] && this[name].dispatch(params);
      return this;
    },
    
    extend: function(options){
      for ( var key in options ) {
        options[key] && options[key].call && this.on(key, options[key], this);
      }
    }
    
  });

  return polycade.managers.events;

});