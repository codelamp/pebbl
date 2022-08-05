const treeConfigs = {
  tree1: {
    scale: 0.4,
    polygon: [
      [42.000,243.000],[17.000,195.999],[0.000,141.999],[6.000,90.000],[26.000,60.000],
      [56.000,37.999],[100.000,17.999],[146.999,6.000],[199.999,0.000],[249.000,4.000],
      [288.999,24.000],[321.000,55.000],[339.999,95.000],[342.000,149.000],[330.999,200.000],
      [312.000,249.000],[319.999,258.000],[339.999,250.999],[363.000,255.999],[380.999,271.999],
      [391.999,310.999],[378.000,342.000],[347.000,368.000],[318.999,372.000],[291.000,403.999],
      [262.999,442.000],[250.999,473.000],[246.999,531.000],[245.000,577.999],[255.999,607.000],
      [283.999,628.999],[272.999,638.999],[162.000,637.000],[152.000,627.999],[183.999,607.999],
      [189.999,577.999],[183.999,532.000],[160.000,497.000],[126.999,508.999],[89.000,503.999],
      [54.999,474.999],[23.999,435.999],[7.999,393.999],[23.999,365.999],[63.000,347.000],
      [108.000,339.999],[163.999,350.999],[189.999,363.000],[174.999,334.999],[122.999,315.999],
      [84.999,286.999],[42.000,243.000]
    ],
    sprite: {
      texture: './assets/tree-1.png',
      xOffset: 0.1,
      yOffset: 0.18,
    }
  },
  tree2: {
    scale: 0.4,
    polygon: [
      [14.000,228.000],[40.000,237.999],[15.000,120.999],[19.000,70.999],[27.000,59.999],
      [0.000,33.999],[33.000,40.999],[41.000,22.000],[51.000,34.999],[50.000,47.000],
      [176.999,0.000],[199.000,1.000],[271.000,29.000],[277.000,15.000],[291.999,3.999],
      [281.000,33.999],[291.999,29.999],[291.999,40.000],[340.999,73.999],[345.999,95.999],
      [345.999,129.000],[363.999,118.000],[356.999,147.999],[371.999,147.999],[344.999,166.999],
      [343.999,198.999],[346.999,233.000],[335.999,255.999],[305.999,281.000],[271.000,300.000],
      [249.000,329.000],[225.000,345.000],[180.999,361.000],[164.000,370.000],[156.999,386.999],
      [162.000,403.000],[193.999,409.000],[207.999,416.000],[201.999,428.000],[191.999,443.000],
      [217.000,450.999],[237.999,460.000],[162.999,466.000],[98.000,453.000],[132.000,448.000],
      [152.999,441.000],[156.000,432.000],[132.999,418.000],[126.000,407.000],[132.000,392.000],
      [146.000,378.000],[154.000,364.000],[154.999,345.000],[128.000,311.999],[50.000,279.999],
      [37.000,267.000],[9.000,254.999],[29.000,249.000],[14.000,228.000]
    ],
    sprite: {
      texture: './assets/tree-2.png',
      xOffset: -0.02,
      yOffset: 0.08,
    }
  }
};

class StaticTree {
  
  constructor({ type = 'tree1', x, y } = {}) {
    const treeConfig = treeConfigs[type];
    const vxs = treeConfig.polygon.map(([x, y]) => ({ x, y }));

    this.collisionEntity = Matter.Bodies.fromVertices(x, y, vxs, {
      restitution: 0,
      friction: 1,
      isStatic: true,
      render: {
        fillStyle: 'rgba(0,0,0,0)'
      }
    });

    Body.scale(this.collisionEntity, treeConfig.scale, treeConfig.scale);

    this.entity = Bodies.rectangle(x, y, 1, 1, {
      restitution: 0,
      friction: 1,
      isStatic: true,
      render: {
        sprite: {
          ...treeConfig.sprite,
          xScale: treeConfig.scale,
          yScale: treeConfig.scale
        }
      }
    });

    this.entity.isPreventedFromRotating = true;
    this.shadowEntity = this._createShadowEntity({ x, y });
  }
  
  _createShadowEntity() {
    const shadowEntity = Bodies.circle(this.entity.position.x, this.entity.position.y + 84, 5, {
      isStatic: true,
      render: {
        strokeStyle: '#ffffff',
        opacity: 0.15,
        sprite: {
          texture: './assets/round-shadow.png',
          xOffset: 0.05,
          xScale: 1,
          yScale: 1
        }
      }
    });

    shadowEntity.collisionFilter = {
      group: -1,
      category: 2,
      mask: 0
    };
    shadowEntity.isPreventedFromRotating = true;
    shadowEntity.localGravity = { x: 0, y: 0, scale: 0 };
    Body.setInertia(shadowEntity, Infinity);
    
    return shadowEntity;
  }
  
  update() {
    
  }
  
  getEntities() {
    return [this.shadowEntity, this.entity, this.collisionEntity];
  }
}