/**
 * Make sure the base polycade exists
 */
var polycade = polycade || {};
    polycade.managers = polycade.managers || {};

/**
 * The trigger manager for polycade
 */
async('polycade.assets', ['underscore', 'theory', 'Phaser', 'Q'], function(_, theory, Phaser, Q){

  /**
   * The event manager for polycade
   */
  polycade.managers.assets = (function(mixin){

    var local = theory.base.mix(mixin || {}, {

      /**
       *
       */
      load: function(path){

        return Q.defer().promise;

      }

    });

    // create the initial namespace
    //local.prepNS();

    return local;

  })(polycade.managers.assets || {});

});