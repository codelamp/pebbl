/**
 * The polycade game handler
 */
async.tmp.includes = ['underscore', 'jq', 'theory', 'Phaser', 'verge'];
async.tmp.managers = ['polycade.events', 'polycade.layers', 'polycade.assets', 'polycade.entities.base'];
async('polycade.game', async.tmp.includes, async.tmp.managers, function(_, $, t, Phaser, v){

  var polycade = async.ref('polycade', {}), local = polycade.game || {};

  /**
   * The game handler for polycade
   */
  polycade.game = t.base.mix(local, {

    name: 'polycade.game',

    /**
     * Set up the polycade game object
     */
    prep: function(options){
      this.options = options;

      this.prepManagers();
      this.prepViewport();

      this.entities = {};
      this.entities.base = polycade.entities.base.namespace('polycade.game');

      this.dims = {
        width: 1280,
        height: 720
      };

      this.i = {};
      this.i.container = $(this.options.container);

      // shared object
      this.phaser = new Phaser.Game(100, 100, Phaser.AUTO, this.i.container[0], this.phaserHandlers, true);

      return this;
    },

    /**
     * Integrate with the viewport
     */
    prepManagers: function(){
      this.events = polycade.manager('events').namespace('polycade').create();
      this.layers = polycade.manager('layers').namespace('polycade').create();
      this.assets = polycade.manager('assets').namespace('polycade').create();
      // handlers
      this.handlers = t.bindCollection(this.handlers, this);
      this.phaserHandlers = t.bindCollection(this.phaserHandlers, this);
    },

    /**
     * Integrate with the viewport
     */
    prepViewport: function(){
      if ( !this.viewport ) {
        this.viewport = { element: window };
        this.viewport.width = v.viewportW();
        this.viewport.height = v.viewportH();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.viewport.element.addEventListener('resize', this.handlers.resize);
      }
    },

    handlers: {

      resize: function(){
        this.viewport.width = v.viewportW();
        this.viewport.height = v.viewportH();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.phaser.scale.setGameSize(this.viewport.width, this.viewport.height);
        this.phaser.world.setBounds(
          0, 0,
          Math.max(this.viewport.width, this.dims.width),
          Math.min(this.viewport.height, this.dims.height)
        );
        //this.options.cameraTarget && this.game.camera.follow( this.options.cameraTarget.sprite, Phaser.Camera.FOLLOW_PLATFORMER );

        this.bg.y = this.phaser.world.bounds.height - 450;
        this.bg.x = this.phaser.world.bounds.width / 2;
        this.bgMountain.y = this.phaser.world.bounds.height - 240;

        this.globe.sprite.events.resize.dispatch();
        this.plant.sprite.events.resize.dispatch();

      }

    },

    phaserHandlers: {

      preload: function(){
        this.phaser.load.image('globe', 'assets/entities/globe-a.png');
        this.phaser.load.image('mountain', 'assets/backgrounds/world-a/mountain-a.png');
        this.phaser.load.image('plant', 'assets/entities/plant-a.png');
        this.phaser.load.image('sky', 'assets/backgrounds/world-a/sky.jpg');
        this.phaser.load.image('shadow', 'assets/effects/round-shadow.png');
        //this.phaser.load.json('pebble-a', pebbl.assets['entities.pebble-a'].ibody);
      },

      create: function(){

        this.entities.base.game = this;
        this.entities.base.phaser = this.phaser;

        /// start the simple physics ball rolling
        this.phaser.physics.startSystem(Phaser.Physics.ARCADE);
        /// create the background sky
        this.bg = this.phaser.add.sprite(0,0, 'sky');
        this.bg.anchor = {x:0.5, y:0};
        this.bg.fixedToCamera = false;


        /// the globe is the main platform
        this.globe = this.entities.base.create({
          sprite: {
            source: 'globe',
            position: {x:0, y:0},
            anchor: {x:0, y:1}
          },
          body: {
            collideWorldBounds: false,
            immovable: true,
            allowGravity: false
          },
          _ibody: {
            container: this.imagination,
            source: 'globe',
            offset: {
              y: 30,
              x: 0
            }
          },
          events: {
            resize: function(){
              this.position.x = this.phaser.world.bounds.width / 2 - 2384/2;
              this.position.y = this.phaser.world.bounds.height - 30;
              this.update();
            }
          }
        });

        this.bgMountain = this.phaser.add.sprite(0,0, 'mountain');
        this.bgMountain.x = 400;
        this.bgMountain.y = 490;
        this.bgMountain.fixedToCamera = false;

        this.plant = this.entities.base.create({
          sprite: {
            source: 'plant',
            position: { x:300, y:300 },
            anchor: { x:0.5, y:1 }
          },
          body: {
            collideWorldBounds: false,
            immovable: true,
            allowGravity: false
          },
          _ibody: {
            container: this.imagination,
            source: 'plant',
            debug: true
          },
          events: {
            added: function(){
              this.shadow = this.phaser.add.sprite(0,0, 'shadow');
              this.shadow.anchor = { x:0.4, y:0.5 };
              this.shadow.alpha = 0.2;
              this.shadow.scale.x = 0.3;
              this.shadow.scale.y = 0.2;
              this.shadow.baseAlpha = 0.3;
              this.sprite.bringToTop();
            },
            resize: function(){
              this.position.x = this.phaser.world.bounds.width * 0.85;
              this.position.y = this.phaser.world.bounds.height - 80; //world.globe.nearestPoint(this.position.x, 0).y + 4;
              this.shadow.position.x = this.position.x;
              this.shadow.position.y = this.position.y;
              //this.update();
            }
          }
        });

        /*
        //  Create a BitmapData
        var bmd = this.phaser.make.bitmapData(320, 256);

        //  Draw an image to it
        bmd.copy('pic');

        //  Draw a few random shapes to it
        bmd.circle(100, 100, 32, 'rgba(255,0,0,0.8)');
        //bmd.rect(110, 40, 64, 120, 'rgba(255,0,255,0.8)');

        //  Here the sprite uses the BitmapData as a texture
        this.sprite = this.phaser.add.sprite(300, 300, bmd);

        this.sprite.anchor.set(0.5);
        */
        this.handlers.resize();
      },

      update: function(){
        //this.sprite.rotation += 0.01;
      },

      render: function(){

      }

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