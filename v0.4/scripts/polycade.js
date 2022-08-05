var polycade = (function(){
  
  var polycade = {
    
    is: null,
    
    create: function(){
      return this.prep.apply(Object.create(this), arguments);
    },
    
    prep: function( options ){
      this.options = options;
      this.layers = this.resolveLayers( this.options.layers );
      !this.layers.speech && (this.layers.speech=this.createLayer());
      this.is = {
        preloading: true,
        preloaded: false
      };
      /// mix in event handling
      mix.eventHandling.apply(this);
      /// make sure our events can be attributed to us
      this.events = go.bindCollection(this.events, this);
      this.triggers = go.bindCollection(this.triggers, this);
      /// start the building process
      this.on('make', this.events.make);
      this.on('build', this.events.build);
      this.options.make && this.on('make', this.options.make);
      this.options.build && this.on('build', this.options.build);
      this.options.update && this.on('update', this.options.update);
      this.options.preload && this.on('preload', this.options.preload);
      this.options.automake && this.trigger('make');
      this.options.resize && this.on('resize', this.options.resize);
      return this;
    },
    
    createLayer: function(){
      return jQuery('<div />');
    },
    
    resolveLayers: function( layers ){
      var ret = {};
      if ( layers ) {
        for ( var i in layers ) {
          ret[i] = jQuery(layers[i]);
        }
      }
      return ret;
    },
    
    /**
     *
     */
    speak: function( entity, msg, lifespan, delay ){
      var bubble;
      if ( delay ) {
        return run.later(this.speak, delay, this, [entity, msg, lifespan]);
      }
      if ( !entity ) {
        console.warn('speak called without entity.');
        return null;
      }
      if ( entity.hasSpeech() ) {
        entity.bubbles.pop().qtip('hide').remove();
      }
      if ( msg ) {
        bubble = jQuery('<span />').appendTo(this.layers.speech);
        entity.bubbles.unshift(bubble);
        bubble.qtip({
          overwrite: true,
          position: {
            container: this.layers.speech,
            viewport: jQuery('body'),
            target: [
              entity.sprite.left * this.game.scale.scaleFactorInversed.x,
              entity.sprite.top * this.game.scale.scaleFactorInversed.y
            ],
            at: 'top left',
            my: 'bottom right',
            adjust: {
              method: 'flip',
              x: 0,
              y: -10
            }
          },
          hide: {
            delay: 1000,
            event: false,
            fixed: true,
            leave: false,
            effect: function(){
              /// it seems qtip will destroy itself before our css
              /// animation if there isn't a jQuery animation running.
              jQuery(this).animate({'z-index': 1}, 1000);
              /// now trigger our far more optimal CSS animtion instead
              run.later(
                function(){this.addClass('pop-out');},
                1,
                jQuery(this)
                  .removeClass('bounce-in-ready bounce-in')
                  .addClass('pop-out-ready')
              );
            }
          },
          show: {
            solo: false,
            ready: true,
            effect: function( offset ){
              run.later(
                function(){this.addClass('bounce-in');},
                1,
                jQuery(this)
                  .addClass('bounce-in-ready')
              );
            }
          },
          content: { text: msg },
          style: {
              tip: {
                  corner: true
              }
          },
          events: {
            hidden: function(event, api) {
              api.destroy(true);
            }
          }
        });
        if ( lifespan ) {
          run.later(this.speak, lifespan, this, [entity, null]);
        }
        return bubble;
      }
      return null;
    },
    
    /**
     *
     */
    castShadow: function(fromEntity, dx, dy, against){
      var p = fromEntity.position, ra, nd, ag, i, l = against.length, lp = {x:0, y:0}, a, r, ibody;
      for ( i=0; i<l; i++ ) {
        if ( (ag = against[i]) && ag.sprite && (ibody=ag.sprite.ibody) ) {
          if ( p.y > ag.sprite.y ){ continue; }
          lp.x = p.x - ag.sprite.left - ibody.offset.x;
          lp.y = p.y - ag.sprite.top - ibody.offset.y;
          ra = ag.sprite.ibody.polygonRaycast( lp.x, lp.y, dx, dy );
          if ( ra && (!nd || ra.dist < nd.dist) ) {
            nd = ra;
            nd.point = {
              x: p.x + nd.dist * dx,
              y: p.y + nd.dist * dy + 2
            };
            if ( nd.dist < 5 ) {
              break;
            }
          }
        }
      }
      if ( nd && nd.point ) {
        a = (1 - (1/200 * Math.min(nd.dist, 200)));
        r = Math.atan2(-nd.norm.x, nd.norm.y);
        if ( fromEntity.shadow.position.x != nd.point.x ) {
          fromEntity.shadow.position.x = nd.point.x;
        }
        if ( fromEntity.shadow.position.y != nd.point.y ) {
          fromEntity.shadow.position.y = nd.point.y;
        }
        fromEntity.shadow.alpha = a * fromEntity.shadow.baseAlpha;
        if ( fromEntity.shadow.width != (fromEntity.sprite.width * 1.2 * a) ) {
          fromEntity.shadow.width = (fromEntity.sprite.width * 1.2 * a);
          fromEntity.shadow.height = fromEntity.sprite.width * 0.3 * a;
        }
        if ( r != fromEntity.shadow.rotation ) {
          fromEntity.shadow.rotation = r;
        }
      }
    },
    
    events: {
      
      make: function(){
        this.viewport = { element: jQuery(window) };
        this.viewport.width = this.viewport.element.width();
        this.viewport.height = this.viewport.element.height();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.dims = {
          width: 1280,
          height: 720
        };
        /// set-up the game object
        this.game = new Phaser.Game('100', '100', Phaser.AUTO, jQuery(this.options.container)[0], {
          preload: this.triggers.preloads,
          create: this.triggers.builds,
          update: this.triggers.updates,
          render: this.triggers.renders
        }, true);
      },
      
      build: function(){
        this.canvas = jQuery(this.game.canvas);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.scale.minWidth = 0;
        this.game.scale.minHeight = 0;
        this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE; //USER_SCALE; //USER_SCALE; //.EXACT_FIT;
        this.game.camera.deadzone = null;
        this.viewport.element.resize(this.events.resize);
        run.later(this.events.resize, 50);
      },
      
      resize: function(){
        this.viewport.width = this.viewport.element.width();
        this.viewport.height = this.viewport.element.height();
        this.viewport.ratio = this.viewport.width / this.viewport.height;
        this.game.scale.setGameSize(this.viewport.width, this.viewport.height);
        this.game.world.setBounds(
          0,0,
          Math.max(this.viewport.width, this.dims.width),
          Math.min(this.viewport.height, this.dims.height)
        );
        this.options.cameraTarget && this.game.camera.follow( this.options.cameraTarget.sprite, Phaser.Camera.FOLLOW_PLATFORMER );
        this.trigger('resize');
      }
      
    },
    
    triggers: {
      
      preloads: function(){
        this.is.preloading = true;
        return this.trigger('preload');
      },
    
      builds: function(){
        this.is.preloading = false;
        this.is.preloaded = true;
        return this.trigger('build');
      },
    
      updates: function(){
        return this.trigger('update');
      },
    
      renders: function(){
        this.trigger('render:before');
        this.trigger('render');
        this.trigger('render:after');
      }
      
    },
    
    preload: function( callback ){
      return this.on('preload', callback);
    },
    
    make: function(){
      this.trigger('make');
    }
    
  };
  
  return polycade;
  
})();