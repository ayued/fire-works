let fireworks = [];
let gravity;
let explosionGravity;

function setup() {
  let viewport = document.querySelector('meta[name=viewport]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');

  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  gravity = createVector(0, 0.17);  // 花火の高さ
  explosionGravity = createVector(0, 0.08); // 爆発後の落下速度
  stroke(255);
  strokeWeight(4);
  background(0);
}

function draw() {
  colorMode(RGB);
  background(0, 0, 0, 25);
  
  if (random(1) < 0.03) {
    fireworks.push(new Firework());
  }
  
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function getFireworkSize() {  // SPの場合
  return min(windowWidth, windowHeight) / 5;
}

class Firework {
  constructor() {
    this.hue = random(360);
    this.saturation = random(50, 100);
    this.brightness = random(70, 100);
    this.firework = new Particle(random(width), height, this.hue, 20, 60, true);  // 花火が上がる時
    this.exploded = false;
    this.particles = [];
  }
  
  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(explosionGravity); // 爆発後の重力を使用
      this.particles[i].update();
      
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    this.explosionSize = map(this.firework.pos.y, height, 0, 40, 240); // 高い花火ほど大きくなるように
    for (let i = 0; i < 100; i++) {
      const hueVariation = random(-30, 30);
      const saturationVariation = random(-20, 20);
      const brightnessVariation = random(-20, 20);
      const p = new Particle(
        this.firework.pos.x,
        this.firework.pos.y,
        this.hue + hueVariation,
        constrain(this.saturation + saturationVariation, 0, 100),
        constrain(this.brightness + brightnessVariation, 0, 100),
        false
      );
      p.vel.mult(this.explosionSize / 100);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }
    
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}

class Particle {
  constructor(x, y, hue, saturation, brightness, firework) {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.hue = hue;
    this.saturation = saturation;
    this.brightness = brightness;
    
    if (this.firework) {
      this.vel = createVector(0, random(-14, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }
    
    this.acc = createVector(0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB, 360, 100, 100, 255);
    
    if (!this.firework) {
      strokeWeight(2);
      stroke(this.hue, this.saturation, this.brightness, this.lifespan);
    } else {
      strokeWeight(2);
      stroke(this.hue, this.saturation, this.brightness);
    }
    
    point(this.pos.x, this.pos.y);
  }
}
