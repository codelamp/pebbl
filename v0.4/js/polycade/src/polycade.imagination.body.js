/**
 * The code that powers the ibody handling, an extension body
 * which allows for polycode collision testing.
 */
async('polycade.imagination.body', ['underscore', 'Phaser', 'theory', 'PolyK'], function(_, Phaser, t, PolyK){

  var polycade = async.ref('polycade', {});
      polycade.imagination = polycade.imagination || {};

  /**
   * imagination body
   */
  polycade.imagination.body = polycade.base.mix(polycade.imagination.body, {

    prep: function( options ){
      this.options = options;
      /// http://phaser.io/docs/2.6.2/Phaser.Physics.Arcade.html#collide
      /// game.physics.collide(balls, balls, ballHitBallHandler, ballHitBallProcess, this);

    },

    debugDraw: function(phaser, sprite){
      if ( this.options.source ) {
        _.each(this.options.source.shapes, function(shape, i){
          var gfx, poly = new Phaser.Polygon(shape.points);
          gfx = phaser.add.graphics(sprite.position.x, sprite.position.y);
          gfx.scale = sprite.scale;
          gfx.alpha = 0.3;
          gfx.beginFill(0xFF33ff);
          gfx.drawPolygon(poly.points);
          gfx.endFill();
        });
      }
      /*
      _.each(function(shape, i){
        var gfx, poly = new Phaser.Polygon(shape.points);
        gfx = phaser.add.graphics(0, 0);
        gfx.beginFill(0xFF33ff);
        gfx.drawPolygon(poly.points);
        gfx.endFill();
        
        //this.sprite = new polycade.phaser.sprite(
        //  this, -999, -999, options.source.cacheName ? options.source.cacheName : options.source
        //);
        //container
      });
      */
    },

    collide: function(){

    }

  });

  return polycade.imagination.body;

});