async('theory.plugins.events', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  /**
   * The event manager for polycade
   */
  theory.plugins.events = (function(mixin){

    var local = theory.base.mix(mixin || {}, {

      /**
       *
       */
      prep: function(){
        this.i = {};
        this.i.listeners = {};
        this.i.context = this;
        return this;
      },

      /**
       *
       */
      context: function(context){
        this.i.context = context;
      },

      /**
       *
       */
      triggerEach: function(name){
        if ( this.i.listeners[name] ) {
          for ( var i=0, a=this.i.listeners[name], l=a.length; i<l; i++ ) {
            a[i].apply(this.i.context);
          }
        }
        return this;
      },

      /**
       *
       */
      trigger: function(names){
        names = this.splitNames(names);
        for ( var i=0; i<names.length; i++ ) {
          this.triggerEach(names[i]);
        }
        return this;
      },

      /**
       *
       */
      onEach: function(name, callback){
        if ( !this.i.listeners[name] ) {
          this.i.listeners[name] = [];
        }
        this.i.listeners[name].push(callback);
        return this;
      },

      /**
       *
       */
      on: function(names, callback){
        names = this.splitNames(names);
        for ( var i=0; i<names.length; i++ ) {
          this.onEach(names[i], callback);
        }
        return this;
      },

      /**
       *
       */
      offEach: function(){
        if ( this.i.listeners[name] ) {
          var i = this.i.listeners[name].indexOf(callback);
          if ( i !== -1 ) {
            this.i.listeners[name].splice(i, 1);
          }
        }
        return this;
      },

      /**
       *
       */
      off: function(){
        names = this.splitNames(names);
        for ( var i=0; i<names.length; i++ ) {
          this.offEach(names[i], callback);
        }
        return this;
      },

      /**
       *
       */
      splitNames: function(names){
        return names.split(' '); // @TODO: improve
      },

      /**
       * Cross browser custom event trigger function
       */
      triggerEvent: function( element, data, bubbles, cancelable ){
        var i, event;
        event = document.createEvent
          ? document.createEvent('HTMLEvents')
          : document.createEventObject()
        ;
        event.initEvent
          ? event.initEvent(data.type, bubbles, cancelable)
          : (event.eventType = data.type)
        ;
        for ( i in data ) {
          if ( i == 'type' ) continue;
          event[i] = data[i];
        }
        element.dispatchEvent
          ? element.dispatchEvent(event)
          : element.fireEvent('on' + event.eventType, event)
        ;
      }

    });

    // create the initial namespace
    //local.prepNS();

    return local;

  })(theory.plugins.events || {});
  
  return theory.plugins.events;
  
});