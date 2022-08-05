class BaseScene {
  
  constructor() {
    this.width = 1450;
    this.height = 750;
    this.container = document.createElement('div');
    
    document.body.appendChild(this.container);
  }
  
}