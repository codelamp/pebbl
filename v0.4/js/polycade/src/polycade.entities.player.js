/**
 * The userController
 */
async('polycade.controllers.userController', ['Phaser', 'theory', 'underscore'], function(Phaser, t, _){

  var polycade = async.ref('polycade', {});
      polycade.controllers = polycade.controllers || {};
  var u = undefined;

  /**
   *
   */
  polycade.controllers.userController = t.base.mix(polycade.controllers.userController || {}, {

    /**
     *
     */
    prep: function(entity, options){
      this.options = options;
    },

    /**
     *
     */
    enableFor: function(game){
      var code, key;
      for ( key in this.options.keys ) {
        code = this.options.keys[key];
        if ( Phaser.KeyCode[code] ) {
          game.input.keyboard.addKey(Phaser.KeyCode[code]);
        }
      }
    },

    /**
     *
     */
    disableFor: function(game){
      var code, key;
      for ( key in this.options.keys ) {
        code = this.options.keys[key];
        if ( Phaser.KeyCode[code] ) {
          game.input.keyboard.removeKey(Phaser.KeyCode[code]);
        }
      }
    }

  });
  
});