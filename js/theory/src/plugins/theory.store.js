/**
 * This plugin will be powered by both pouchDB and Backbone.
 */
async('theory.plugins.store', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  /**
   * The event manager for polycade
   */
  theory.plugins.store = (function(mixin){

    var local = theory.base.mix(mixin || {}, {

    });

    return local;

  })(theory.plugins.store || {});

});