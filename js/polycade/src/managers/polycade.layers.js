/**
 * Make sure the base polycade exists
 */
var polycade = polycade || {};
    polycade.managers = polycade.managers || {};

async('polycade.layers', ['jq', 'theory', 'Phaser'], function($, theory, Phaser){

  /**
   * The event manager for polycade
   */
  polycade.managers.layers = (function(mixin){

    var local = theory.base.mix(mixin || {}, {
      
      name: 'polycade.layers',

      prep: function( options ){
        return this;
      },

      /**
       * Create a new layer
       */
      createLayer: function(){
        return $('<div />');
      },

      /**
       * Take a list of layer elements, or selectors, and
       * convert them down to jQuery objects.
       */
      resolveLayers: function( layers ){
        var ret = {};
        if ( layers ) {
          for ( var i in layers ) {
            ret[i] = $(layers[i]);
          }
        }
        return ret;
      }

    });

    return local;

  })(polycade.managers.layers || {});

  return polycade.managers.layers;

});