/**
 * The trigger manager for polycade
 */
async('polycade.entities.adornment', ['jq', 'Phaser', 'theory'], function($, Phaser, theory){

  var polycade = async.ref('polycade', {});
      polycade.entities = polycade.entites || {};
  var adornment = polycade.entities.adornment || {};

  /**
   * adornment entity
   */
  polycade.entities.adornment = theory.base.mix(adornment, {

    prep: function( options ){

    },

    update: function(){

    },

    /**
     * Check collision, handling with either default Phaser or an ibody
     */
    collide: function( sprite ){

    }

  });

  return adornment;
  
});