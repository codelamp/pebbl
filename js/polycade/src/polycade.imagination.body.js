/**
 * The code that powers the ibody handling, an extension body
 * which allows for polycode collision testing.
 */
async('polycade.imagination.body', ['jq', 'Phaser', 'theory', 'PolyK'], function($, Phaser, theory, PolyK){

  var polycade = async.ref('polycade', {});
      polycade.imagination = polycade.imagination || {};

  /**
   * imagination body
   */
  polycade.imagination.body = theory.base.mix(polycade.imagination.body || {}, {

    prep: function( options ){

      /// http://phaser.io/docs/2.6.2/Phaser.Physics.Arcade.html#collide
      /// game.physics.collide(balls, balls, ballHitBallHandler, ballHitBallProcess, this);

    },

    collide: function(){

    }

  });

  return polycade.imagination.body;

});