/**
 *
 */
imagination = {
  global: this
};

imagination.container = {
  
  create: function( options ){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  prep: function( options ){
    var self = this, showDebug = String(window.location).indexOf('debug=1') != -1;
    this.options = options;
    this.buffers = {
      elements: []
    };
    this.iframe = {};
    this.iframe.id = new Date().getTime();
    this.iframe.element = jQuery('<iframe />')
      .css({
        'border': '1px solid red',
        'position': 'absolute',
        'right': showDebug ? 0 : '100%',
        'top': 0,
        'width': this.options.width + 'px',
        'height': this.options.height + 'px',
        'z-index': 2,
        'pointer-events': 'none',
        'visibility': showDebug ? 'visible' : 'hidden'
      })
      .appendTo('body')
      .attr({'src': 'imagine.html?id=' + this.iframe.id})
    ;
    imagination.global['frameLoaded' + this.iframe.id] = go.bind(this.frameReady, this);
    return this;
  },
  
  frameReady: function(body, win, doc, d3){
    this.d3 = d3;
    this.iframe.body = body;
    this.iframe.window = win;
    this.iframe.document = doc;
    this.svg = d3.select(body).append('svg')
      .attr({
        'width': this.options.width,
        'height': this.options.height
      })
      .style({
        'position': 'absolute',
        'left': 0,
        'top': 0,
        'width': this.options.width + 'px',
        'height': this.options.height + 'px'
      })
    ;
    this.createElements();
  },
  
  setSize: function(w, h){
    this.iframe
      .css({
        'width': w + 'px',
        'height': h + 'px'
      })
    ;
  },
  
  addPathElement: function( path, callback ){
    var wrapper, element;
    if ( this.svg ) {
      if ( is.array(path) ) {
        path = path.join('');
      }
      wrapper = this.svg.append('g');
      element = wrapper.append( 'path' )
        .attr({
          'fill': 'rgba(255,0,0,0.3)',
          'd': path
        })
      ;
      callback && callback.call(this, wrapper, element);
    }
    else {
      this.buffers.elements.push({
        method: 'addPathElement',
        args: arguments
      });
    }
    return this;
  },
  
  createElements: function(){
    for ( var b, i=0, l=this.buffers.elements.length; (i<l) && (b=this.buffers.elements[i]); i++ ) {
      this[b.method].apply(this, b.args);
    }
  }
  
};

var ColorList = function(){
  this.items = arguments;
  this.index = 0;
  this.next = function(){
    var i = this.index;
    if ( i < this.items.length ) {
      this.index++;
      return this.items[i];
    }
    else {
      this.index = 0;
      return this.items[0];
    }
  };
};

var color1 = new ColorList(0xFF0000, 0xFFFF00);
var color2 = new ColorList(0xFF0000, 0x0000FF);
var color3 = new ColorList(0xFFAA00, 0x00AAFF);

imagination.body = {
  
  create: function( options ){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  prep: function( options ){
    this.options = options;
    this.container = this.options.container;
    this.owner = this.options.owner;
    this.sprite = this.owner.sprite;
    this.offset = {x:0,y:0};
    this.game = this.sprite.game;
    this.data = this.game.cache.getJSON( this.options.source );
    this.shape = this.data.shapes[0];
    this.polygon = new Phaser.Polygon( this.shape.points );
    this.polyflat = this.flattenPoints( this.shape.points );
    if ( this.shape && this.shape.path ) {
      this.container.addPathElement( this.shape.path, go.bind(function( wrapper, element ){
        this.wrapper = wrapper;
        this.element = element;
        this.update();
      }, this));
    }
    if ( this.options.offset ) {
      this.options.offset.x && (this.offset.x = this.options.offset.x);
      this.options.offset.y && (this.offset.y = this.options.offset.y);
    }
    this.debug = this.game.add.graphics(0, 0);
    this.debug.beginFill(color1.next(), 1);
    this.debug.drawEllipse(-2,-2,4,4);
    this.debug.endFill();
    this.debug1 = this.game.add.graphics(0, 0);
    this.debug1.beginFill(color2.next(), 1);
    this.debug1.drawEllipse(-1,-1,2,2);
    this.debug1.endFill();
    this.debug2 = this.game.add.graphics(0, 0);
    this.debug2.beginFill(color3.next(), 1);
    this.debug2.drawEllipse(-1,-1,2,2);
    this.debug2.endFill();
    var self = this;
    jQuery(window).on('click', function(e){
      log(self.polygonHitTest(e.pageX, e.pageY));
    });
    
    return this;
  },
  
  update: function(){
    if ( this.element ) {
      this.element.attr('transform', 'translate(' + (this.sprite.left + this.offset.x) + ' ' + (this.sprite.top + this.offset.y) + ')');
    }
  },
  
  flattenPoints: function( points ){
    var flats = [];
    for ( var i=0, l=points.length; i<l; i++ ) {
      flats.push(points[i].x);
      flats.push(points[i].y);
    }
    return flats;
  },
  
  pathHitTest: function(x, y){
    if ( this.container.iframe.document ) {
      var elm = this.container.iframe.document.elementFromPoint(x, y);
      var r = !!(elm && this.element && elm === this.element[0][0]);
      return r;
    }
    else {
      return null;
    }
  },
  
  polygonHitTest: function(x, y){
    return this.polygon.contains(x, y);
  },
  
  polygonRaycastP2P: function(x1, y1, x2, y2){
    var dx = x2 - x1,
        dy = y2 - y1
    ;
    if ( Math.abs(dx) > Math.abs(dy) ) {
      dy = dy ? dx / dy : 0;
      dx = 1;
    }
    else {
      dx = dx ? dy / dx : 0;
      dy = 1;
    }
    var r = PolyK.Raycast(this.polyflat, x1, y1, dx, dy);
    if ( r ) {
      r.p1 = {
        x: x1,
        y: y1
      };
      r.p2 = {
        x: x2,
        y: y2
      };
      r.point = {
        x: dx * r.dist,
        y: dy * r.dist
      };
    }
    return r;
  },
  
  polygonRaycast: function(x, y, dx, dy){
    return PolyK.Raycast(this.polyflat, x, y, dx, dy);
  },
  
  polygonEdgefind: function(x, y){
    return PolyK.ClosestEdge(this.polyflat, x, y);
  },
  
  polygonEdgefindGlobal: function(x, y){
    var ox = this.sprite.left + this.offset.x,
        oy = this.sprite.top + this.offset.y,
        p = PolyK.ClosestEdge(this.polyflat, x - ox, y - oy)
    ;
    if ( p ) {
      p.point.x += ox;
      p.point.y += oy;
    }
    return p;
  },
  
  collide: function( sprite ){
    var x = sprite.position.x,
        y = sprite.position.y,
        px = sprite.previousPosition.x,
        py = sprite.previousPosition.y,
        ox = this.sprite.left + this.offset.x,
        oy = this.sprite.top + this.offset.y,
        lx = x - ox,
        ly = y - oy,
        dx = sprite.body.deltaX(),
        dy = sprite.body.deltaY(),
        qx = -dx / Math.abs(dx),
        qy = -dy / Math.abs(dy),
        hw = sprite.body.halfWidth,
        hh = sprite.body.halfHeight,
        cx = lx,
        cy = ly,
        ax = cx - hw,
        ay = cy - hh,
        bx = cx + hw,
        by = cy + hh,
        xo = 0,
        yo = 0
    ;
    
    if ( dy > 0 ) {
      if ( this.polygonHitTest(cx, by) ) {
        for ( yo=0; (yo<30) && (this.polygonHitTest(cx, by - yo)); yo += 1 ) {}
        cy -= yo;
        ay -= yo;
        by -= yo;
        sprite.body.velocity.y = 0;
        sprite.body.newVelocity.y = 0;
        sprite.body.position.y = oy + cy - hh + 2;
        sprite.body.touching.down = true;
        sprite.owner.is.on = this.owner;
      }
    }
    else if ( dy < 0 ) {
      if ( this.polygonHitTest(cx, ay + dy) ) {
        for ( yo=0; (yo<30) && (this.polygonHitTest(cx, ay + yo)); yo += 1 ) {}
        cy += yo;
        ay += yo;
        by += yo;
        sprite.body.velocity.y = 0;
        sprite.body.newVelocity.y = 0;
        sprite.body.position.y = oy + cy;
        sprite.body.touching.up = true;
      }
    }
    
    if ( dx > 0 ) {
      if ( this.polygonHitTest(bx, cy) ) {
        for ( xo=0; (xo<30) && (this.polygonHitTest(bx - xo, cy)); xo += 2 ) {}
        cx -= xo;
        ax -= xo;
        bx -= xo;
        sprite.body.velocity.x = 0;
        sprite.body.position.x = ox + cx;
        sprite.body.touching.right = true;
      }
    }
    else if ( dx < 0 ) {
      if ( this.polygonHitTest(ax, cy) ) {
        for ( xo=0; (xo<30) && (this.polygonHitTest(ax + xo, cy)); xo += 2 ) {}
        cx += xo -hw;
        ax += xo -hw;
        bx += xo -hw;
        sprite.body.velocity.x = 0;
        sprite.body.position.x = ox + cx;
        sprite.body.touching.left = true;
      }
    }
    
    return false;
    
  },
  
  _collide: function( sprite ){
    //this.game.time.desiredFps = 5;
    var x = sprite.x,
        y = sprite.y,
        ox = this.sprite.left,
        oy = this.sprite.top,
        lx = x - ox,
        ly = y - oy,
        dx = sprite.body.deltaX(),
        dy = sprite.body.deltaY(),
        hy = dy && this.polygonHitTest(lx, ly + dy),
        hx = dx && this.polygonHitTest(lx + dx, ly),
        tx = -dx/Math.abs(dx),
        ty = -dy/Math.abs(dy),
        ce,
        r
    ;
    
    if ( hy || hx ) {
      ce = this.polygonEdgefind( lx, ly );
      this.debug.position.x = ox + ce.point.x;
      this.debug.position.y = oy + ce.point.y;
    }
    
    if ( hy ) {
      r = this.polygonRaycast( lx, ly + dy, 0, ty );
      sprite.body.velocity.y = 0;
      //sprite.body.position.y = oy + ce.point.y;
      sprite.body.position.y -= (r ? r.dist : 0);
      sprite.body.touching[dy > 0 ? 'down' : 'up'] = true;
    }
    
    else if ( hx ) {
      r = this.polygonRaycast( lx + dx, ly, tx, 0 );
      sprite.body.velocity.x = 0;
      //sprite.body.position.x = ox + ce.point.x;
      sprite.body.position.x -= (r ? r.dist : 0);
      sprite.body.touching[dx > 0 ? 'right' : 'left'] = true;
    }
    
    /*
    if ( !sprite.body.touching.down && !sprite.body.wasTouching.down && this.polygonHitTest(lx, ly) ) {
      sprite.body.touching.down = true;
      sprite.body.velocity.y = 0; //-sprite.body.gravity.y;
      sprite.body.position.y -= sprite.body.deltaY() * 2;
    }
    */
    
    
    
    /*
    this.game.physics.arcade.collide(sprite, this.owner,
      function(){},
      function(a, b){
        var x = a.x - b.left,
            y = a.y - b.top;
            log(y);
        return y > -3;
        //    log(y > 0);
        //return !!(y > 0); //self.hitTest(a.x, a.y);
      }
    );
    */
  }
  
};