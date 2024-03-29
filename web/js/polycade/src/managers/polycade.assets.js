/**
 * The event/trigger manager for polycade
 */
async('polycade.assets', ['underscore', 'theory', 'Phaser', 'q'], function(_, theory, Phaser, q){

  var polycade = async.ref('polycade', {});
      polycade.managers = polycade.managers || {};

  /**
   * The asset manager for polycade
   */
  polycade.managers.assets = theory.base.mix(polycade.managers.assets || {}, {

    /**
     *
     */
    load: function(path){

      return Q.defer().promise;

    }

  });

  return polycade.managers.assets;

});