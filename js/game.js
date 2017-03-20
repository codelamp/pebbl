var game;

/**
 * Pebbl has been revamped! v0.3
 *
 * This is just a demo screen of Pebbl to test the game engine (powered by Phaser & Pixi js)
 * This demo supports the following:
 *
 *  1. Polygon bodies:     Phaser Acade Physics with Polygon hitTest and Raycasting (thanks to PolyK)
 *  2. Shadow Casting:     Any sprite can cast a "pebbl" style shadow onto a polygon surface.
 *  3. Responsive screen:  In theory this demo could work on tablets and mobiles.
 *  4. Speach Bubbles:     Thanks to Qtip.
 *
 *  Currently in the works:
 *
 *  1. Touch control
 *  2. Loading scenes
 *  3. Saving game state
 */

(function(){

  async('game', ['polycade'], function(polycade, pG){

    game = {
      init: function(){
        var g = polycade.game.create({
          initialScreen: 'testbed',
          container: 'body'
        });
        g.events.on('test', function(){
          console.log(12312321);
        });
        g.events.trigger('test');
      }
    };

    return game;

  });

})();