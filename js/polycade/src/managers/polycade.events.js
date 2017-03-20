/**
 * Make sure the base polycade exists
 */
async('polycade.events', ['jq', 'theory', 'Phaser', 'theory.plugins.events'], function($, theory, Phaser){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};

  /**
   * The event manager for polycade
   */
  polycade.managers.events = (function(mixin){

    var local = theory.base.mix(theory.plugins.events.create(), mixin || {}, {

    });

    return local;

  })(polycade.managers.events);

  return polycade.managers.events;

});