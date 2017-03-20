/**
 * The polycade game handler
 */
async.tmp.includes = ['underscore', 'jq', 'theory', 'Phaser'];
async.tmp.managers = ['polycade.events', 'polycade.layers', 'polycade.assets'];
async('polycade.game', async.tmp.includes, async.tmp.managers, function(_, $, theory, Phaser){

  var polycade = async.ref('polycade', {}), local = polycade.game || {};

  /**
   * The game handler for polycade
   */
  polycade.game = theory.base.mix(local, {

    name: 'polycade.game',

    prep: function(){
      this.events = polycade.manager('events').namespace('polycade').create();
      this.layers = polycade.manager('layers').namespace('polycade').create();
      this.assets = polycade.manager('assets').namespace('polycade').create();
      return this;
    }

    /*
    prep: function(){

      var game = this;

      this.layers = polycade.manager('layers').namespace(this.ns).create();
      this.events = polycade.manager('events').namespace(this.ns).create(this.handlers.events);
      //this.triggers = polycade.manager('triggers').namespace(this.ns).create(this.handlers.triggers);
      this.assets = polycade.manager('assets').namespace(polycade.ns).create();

      this.options = options;
      this.assets.load('assets/screens/testbed.json').then(function(data){


        ///////////////////////

        // once we've loaded the screen information, create Phaser
        game.phaser = new Phaser.Game('100', '100', Phaser.AUTO, jQuery(this.options.container)[0], {
          preload: this.triggers.preloads,
          create: this.triggers.builds,
          update: this.triggers.updates,
          render: this.triggers.renders
        }, true);
      });

    },

    preload: function(){
      this.phaser.load.json('pebble-a', pebbl.assets['entities.pebble-a'].ibody);
    }
    */

  });

  return polycade.game;

});