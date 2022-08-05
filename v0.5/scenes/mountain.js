class MountainScene extends BaseScene {
  
  constructor() {
    super();
    this.entity = Bodies.rectangle(this.width/2, 300, this.width, this.height, {
      isStatic: true,
      render: {
        sprite: {
          texture: './assets/background.png',
          xScale: 0.5,
          yScale: 0.5
        }
      }
    });
    this.entity.collisionFilter = {
      group: -1,
      category: 2,
      mask: 0
    };
  }
  
  getEntities() {
    return [this.entity];
  }
  
}