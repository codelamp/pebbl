async.registry('polycade', {
  src: {
    // vendor
    'jq':                          { file: 'node_modules/jqlite/jqlite.js',             resolve: function(){ return jqlite; } },
    'underscore':                  { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                      { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                       { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'verge':                       { file: 'vendor/verge/verge.min.js',                 resolve: function(){ return verge; } },
    'defiant':                     { file: 'node_modules/defiant/dist/defiant.min.js',  resolve: function(){ return Defiant; } },
    'q':                           { resolve: function(){ return async.promiser; } },
    // polycade managers
    'polycade.events':             { file: 'src/managers/polycade.events.js', asynced: true },
    'polycade.screens':            { file: 'src/managers/polycade.screens.js', asynced: true },
    'polycade.assets':             { file: 'src/managers/polycade.assets.js', asynced: true },
    // polycade core
    'polycade.base':               { file: 'src/polycade.base.js',   asynced: true },
    'polycade.game':               { file: 'src/polycade.game.js',   asynced: true },
    'polycade.entities.base':      { file: 'src/polycade.entities.base.js', asynced: true },
    'polycade.entities.shadow':    { file: 'src/polycade.entities.shadow.js', asynced: true },
    'polycade.entities.adornment': { file: 'src/polycade.entities.adornment.js', asynced: true },
    'polycade.controllers.user':   { file: 'src/polycade.controllers.user.js', asynced: true },
    'polycade.imagination.body':   { file: 'src/polycade.imagination.body.js', asynced: true }
  },
  build: {
    // vendor
    'jq':                          { file: 'node_modules/jqlite/jqlite.min.js',         resolve: function(){ return jqlite; } },
    'underscore':                  { file: 'node_modules/underscore/underscore-min.js', resolve: function(){ return _; } },
    'Phaser':                      { file: 'node_modules/phaser/build/phaser.min.js',   resolve: function(){ return Phaser; } },
    'PolyK':                       { file: 'vendor/polyk/polyk.js',                     resolve: function(){ return PolyK; } },
    'verge':                       { file: 'vendor/verge/verge.min.js',                 resolve: function(){ return verge; } },
    'defiant':                     { file: 'node_modules/defiant/dist/defiant.min.js',  resolve: function(){ return Defiant; } },
    'q':                           { resolve: function(){ return async.promiser; } },
    // polycade managers
    'polycade.events':             { asynced: true },
    'polycade.screens':            { asynced: true },
    'polycade.assets':             { asynced: true },
    // polycade core
    'polycade.base':               { asynced: true },
    'polycade.game':               { asynced: true },
    'polycade.entities.base':      { asynced: true },
    'polycade.entities.shadow':    { asynced: true },
    'polycade.entities.adornment': { asynced: true },
    'polycade.controllers.user':   { asynced: true },
    'polycade.imagination.body':   { asynced: true }
  }
});

async('polycade', ['jq', 'theory', 'underscore'], ['polycade.base', 'polycade.game'], function($, t, _){

  var polycade = async.ref('polycade', {});

  /**
   * Set-up the polycade object, but also allow early mixins
   */
  polycade = polycade.base.mix(polycade, {


  });

  return polycade;

});