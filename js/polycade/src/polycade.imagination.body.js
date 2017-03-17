/**
 * Make sure the base polycade exists
 */
var polycade = polycade || {};
    polycade.imagination = polycade.imagination || {};

/**
 * The code that powers the ibody handling, an extension body
 * which allows for polycode collision testing.
 */
async('polycade.imagination.body', ['jq', 'Phaser', 'PolyK'], function($, Phaser){

  /**
   * adornment entity
   */
  polycade.imagination.body = (function(mixin){

    var local = theory.base.mix(mixin, {

      prep: function( options ){

        /// http://phaser.io/docs/2.6.2/Phaser.Physics.Arcade.html#collide
        /// game.physics.collide(balls, balls, ballHitBallHandler, ballHitBallProcess, this);
      
      },
      
      collide: function(){
        
      }

    });

    return local;

  })(polycade.imagination.body||{});
  
});