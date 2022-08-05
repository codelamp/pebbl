function easeOutBounce(x) {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
      return n1 * x * x;
  } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

function easeInOutBounce(x) {
  return x < 0.5
    ? (1 - easeOutBounce(1 - 2 * x)) / 2
    : (1 + easeOutBounce(2 * x - 1)) / 2;
}

function easeInBounce(x) {
  return 1 - easeOutBounce(1 - x);
}

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function triggerEvent(...params) {
  this.forEach((fn) => {
    fn(...params);
  });
}

function ValueProcessor(obj) {
  if (obj.value == undefined) throw new Error('value is required');
  if (obj.easeFn == undefined) throw new Error('easeFn is required');
    
  this.valueLast = null;
  this.value = obj.value;
  this.valueStart = obj.value;
  this.tickLast = 0;
  this.tickStep = obj.tickStep || 0.01;
  this.easeFn = obj.easeFn;
  this.meta = { ...obj.meta };
  
  this.onchange = new Set();
  this.onchange.trigger = triggerEvent;

  this.onstart = new Set();
  this.onstart.trigger = triggerEvent;
  
  this.onend = new Set();
  this.onend.trigger = triggerEvent;
  
  this.ontargetset = new Set();
  this.ontargetset.trigger = triggerEvent;
  
  if (obj.target != undefined) {
    this.setTarget(obj.target);
  }
}

ValueProcessor.prototype.hasMoreTicks = function() {
  return this.value !== this.target;
};

ValueProcessor.prototype.setTarget = function(target) {
  this.tickLast = 0;
  this.targetIndex = 0;
  this.targetCount = 1;
  this.target = target;
  this.ontargetset.trigger(this);
  
  this.valueStart = this.value;
  this.diff = this.target - this.value;
  this.onstart.trigger(this);
};

ValueProcessor.prototype.setNextTarget = function() {
  this.tickLast = 0;
  this.target = this.targets[this.targetIndex];
  this.ontargetset.trigger(this);
  
  this.valueStart = this.value;
  this.diff = this.target - this.value;
};

ValueProcessor.prototype.setTargets = function(...targets) {
  this.targets = targets;
  this.targetIndex = 0;
  this.targetCount = this.targets.length;
  this.tickLast = 0;
  this.target = this.targets[this.targetIndex];
  this.ontargetset.trigger(this);
  
  this.valueStart = this.value;
  this.diff = this.target - this.value;
  this.onstart.trigger(this);
};

ValueProcessor.prototype.getTarget = function() {
  return this.target;
};

ValueProcessor.prototype.isSettled = function() {
  return this.target === this.value;
}

ValueProcessor.prototype.isSettledAt = function(value) {
  return this.target === value && this.value === value;
}

ValueProcessor.prototype.calculateValueAtInterval = function(i) {
  if (i > 1) i = 1;
  if (i < 0) i = 0;

  return this.valueStart + this.diff * this.easeFn(i);
};

ValueProcessor.prototype.tick = function() {
  var i = this.tickLast;
  this.tickLast += this.tickStep;

  if (this.tickLast > 1) this.tickLast = 1;
  if (this.tickLast < 0) this.tickLast = 0;

  this.valueLast = this.value;
  this.value = this.calculateValueAtInterval(i);

  this.onchange.trigger(this);
  
  if (i >= 1 || this.value === this.target) {
    this.targetIndex++;
    if (this.targetIndex < this.targetCount) {
      this.value = this.target;
      this.setNextTarget();
    } else {
      this.targetIndex = 0;
      this.value = this.target;
      this.onend.trigger(this);
    }
  }

  return this;
};