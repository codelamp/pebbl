/**
 * This bit of code is the reason polycade exists
 *
 * I like the way phaser works, but I really wish that arcade mode
 * had the ability to hit test against non-square entities. You may
 * say that, hey P2 supports polygons... and I would say, yes... well
 * done! It does. But for any of those out there that have tried to
 * get a stable game running using aproximated physics; and I mean stable
 * in terms of an irregular platformer -- not some angry bird, moon buggy, 
 * asteroid clone -- you'll know it's rather tricky... added to the fact
 * that whilst using a physics engine like Box2D a lot of physical
 * collisions become easier, but everything else just gets harder in 
 * terms of control. Basically you tend to end up with a main character
 * that jiggles around more randomly than a hadron collider.
 *
 * Ninja physics seemed originally the way to go, but that seems to have
 * dropped out of standard support. So, instead, I decided to augment
 * phaser arcade with just enough polygon support for my needs. And my
 * needs are circular platforms that sprites can sit on without sliding off.
 *
 * Ah. unfortunately have discovered that arcade physics polygon.contains
 * function only works for convex polygons. Doh!.
 *
 * Try doing that with Box2D/P2 ;)
 */
0 && (polycade.polybody = {
  
  create: function( options ){
    return this.prep.apply(Object.create(this), arguments);
  },
  
  prep: function( options ){
    if ( options.source ) {
      this.options = options;
      this.owner = this.options.owner;
      this.game = this.owner.game;
      this.points = this.game.cache.getJSON( this.options.source );
      //this.polygon = new Phaser.Polygon( this.points );
      this.flats = this.flattenPoints(this.points);
    }
    if ( options.debug ) {
      this.point = this.game.add.graphics(0, 0);
      this.point.beginFill(0xFFFF00, 1);
      this.point.drawEllipse(-2,-2,4,4);
      this.point.endFill();
      this.visual = this.game.add.graphics(0, 0);
      this.visual.clear().beginFill(0x447727, 1);
      for ( var p, i=0, l=this.points.length; (i<l) && (p=this.points[i]); i++ ) {
        i ? this.visual.lineTo(p.x, p.y) : this.visual.moveTo(p.x, p.y);
      }
      this.visual.endFill();
      this.owner.addChild( this.visual );
      this.owner.addChild( this.point );
    }
    return this;
  },
  
  flattenPoints: function( points ){
    var flats = [];
    for ( var i=0, l=points.length; i<l; i++ ) {
      flats.push(points[i].x);
      flats.push(points[i].y);
    }
    return flats;
  },
  
  collide: function( sprite ){
    var self = this;
    this.game.physics.arcade.collide(sprite, this.owner,
      function(){},
      function(a, b){
        var x = a.x - b.left,
            y = a.y - b.top;
            //f = PolyK.Raycast(self.flats, x, y, 0, 1);
        self.point.x = x;
        self.point.y = y;
        
        return self.hitTest(self.flats, x, y);
        
        //if ( f && f.dist < 4 ) {
        //  a.body.velocity.y = -a.body.deltaY();
          //a.body.newVelocity.y = 0;
          //a.body.drag.y = 1;
          //a.body.acceleration.y = 0;
          return true;
          //}
        //console.log(x, y, f && f.edge);
        
        return false;
        
        //console.log(f && f.dist);
        return true;
        //console.log(f);
        
        //self.point.x = x;
        //self.point.y = y;
        //console.log(x, y);
        //return PolyK.ContainsPoint(self.flats, x, y);
        //return self.polygon.contains(x, y);
        
        //var dy = a.bottom - b.top;
        //console.log(b.key);
        return true;
      }
    );
  },
  
  translate: function(){
    return this;
  }
  
});