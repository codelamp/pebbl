class ViewportHandler {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.entity = Bodies.rectangle(this.width/2, this.height/2, this.width, this.height, {
      isStatic: true,
      label: 'viewport',
      render: {
        fillStyle: 'rgba(0,0,0,0)'
      }
    });
    this.entity.collisionFilter = {
      group: -1,
      category: 2,
      mask: 0
    };
    this.lookAtDebounced = debounce(() => Render.lookAt(render, this.entity), 5);
    this.horizontalPanProcessor = new ValueProcessor({
      value: this.entity.position.x,
      target: this.entity.position.x,
      easeFn: easeOutQuad,
      tickStep: 0.025
    });
    this.horizontalPanProcessor.ontargetset.add((vp) => {
      vp.value = this.entity.position.x;
    });
    this.horizontalPanProcessor.onchange.add((vp) => {
      Body.setPosition(this.entity, { x: vp.value, y: this.entity.position.y });
      this.lookAtDebounced();
    });
    this.verticalPanProcessor = new ValueProcessor({
      value: this.entity.position.y,
      target: this.entity.position.y,
      easeFn: easeOutQuad,
      tickStep: 0.025
    });
    this.verticalPanProcessor.ontargetset.add((vp) => {
      vp.value = this.entity.position.y;
    });
    this.verticalPanProcessor.onchange.add((vp) => {
      Body.setPosition(this.entity, { x: this.entity.position.x, y: vp.value });
      this.lookAtDebounced();
    });
    this.verticalShakeProcessor = new ValueProcessor({
      value: this.entity.position.y,
      target: this.entity.position.y,
      easeFn: easeOutBounce,
      tickStep: 0.05
    });
    this.verticalShakeProcessor.ontargetset.add((vp) => {
      vp.value = this.entity.position.y;
    });
    this.verticalShakeProcessor.onchange.add((vp) => {
      Body.setPosition(this.entity, { x: this.entity.position.x, y: vp.value });
      this.lookAtDebounced();
    });
  }
  
  get width() {
    return window.innerWidth;
  }

  get height() {
    return window.innerHeight;
  }
  
  getEntities() {
    return [this.entity];
  }
}