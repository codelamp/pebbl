rm -rf web
mkdir web
find . -type d -depth -print | cpio -pd web

cp -r assets ./web/
cp -r styles ./web/
cp -r hullToPoly ./web
cp -r rasp ./web
cp *.html ./web/
cp js/game.js                                             ./web/js/game.js
cp js/async/src/vendor/q-lite.min.js                      ./web/js/async/src/vendor/q-lite.min.js
cp js/async/build/async-min.js                            ./web/js/async/build/async-min.js
cp js/polycade/src/polycade._.js                          ./web/js/polycade/src/polycade._.js
cp js/polycade/node_modules/jqlite/jqlite.js              ./web/js/polycade/node_modules/jqlite/jqlite.js
cp js/theory/src/theory._.js                              ./web/js/theory/src/theory._.js
cp js/polycade/node_modules/underscore/underscore-min.js  ./web/js/polycade/node_modules/underscore/underscore-min.js
cp js/polycade/src/polycade.base.js                       ./web/js/polycade/src/polycade.base.js
cp js/polycade/src/polycade.game.js                       ./web/js/polycade/src/polycade.game.js
cp js/theory/src/theory.is.js                             ./web/js/theory/src/theory.is.js
cp js/theory/src/theory.has.js                            ./web/js/theory/src/theory.has.js
cp js/theory/src/theory.to.js                             ./web/js/theory/src/theory.to.js
cp js/theory/src/theory.base.js                           ./web/js/theory/src/theory.base.js
cp js/theory/src/theory.run.js                            ./web/js/theory/src/theory.run.js
cp js/polycade/node_modules/phaser/build/phaser.min.js    ./web/js/polycade/node_modules/phaser/build/phaser.min.js
cp js/polycade/vendor/verge/verge.min.js                  ./web/js/polycade/vendor/verge/verge.min.js
cp js/polycade/src/managers/polycade.events.js            ./web/js/polycade/src/managers/polycade.events.js
cp js/polycade/src/managers/polycade.screens.js           ./web/js/polycade/src/managers/polycade.screens.js
cp js/polycade/src/managers/polycade.assets.js            ./web/js/polycade/src/managers/polycade.assets.js
cp js/polycade/src/polycade.entities.base.js              ./web/js/polycade/src/polycade.entities.base.js
cp js/polycade/src/polycade.entities.shadow.js            ./web/js/polycade/src/polycade.entities.shadow.js
cp js/polycade/src/polycade.controllers.user.js           ./web/js/polycade/src/polycade.controllers.user.js
cp js/polycade/node_modules/defiant/dist/defiant.min.js   ./web/js/polycade/node_modules/defiant/dist/defiant.min.js
cp js/polycade/src/polycade.imagination.body.js           ./web/js/polycade/src/polycade.imagination.body.js
cp js/polycade/vendor/polyk/polyk.js                      ./web/js/polycade/vendor/polyk/polyk.js

find web -name "node_modules" -exec rm -rf '{}' +

rm -rf web/web