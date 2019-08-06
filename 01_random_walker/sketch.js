// There is an Owl looking for food in the dark.
// Lukily for the Owl there is a mouse around.
// Whenever the mounse button is pressed the mouse starts moving and making noise
// The Owl can hear it and will change it's direction to grab the mouse.
// If it manages to eat the mouse it will increment in size.

// create the owl variable in global scope so we can reference it betwen setup() and draw()
let owl;
let nigth;

function setup() {
  // set the angle mode to radians for use with Vector.heading() later
  angleMode(RADIANS);
  // create the canvas and set it to fill the browser window
  const cnv = createCanvas(windowWidth, windowHeight);
  // instatiate the night controller
  night = new Night();
  // instatiate the owl
  owl = new Owl();
  cnv.mousePressed(owl.handleMousePressed.bind(owl));
  cnv.mouseReleased(owl.handleMouseReleased.bind(owl));
}

function draw() {
  night.display();
  // get the owl object to run it's internal logic
  owl.update();
  // have the mouse paint itself to canvas
  owl.display();
}

class Night {
  constructor() {
    this.brightest = 40;
    this.xoff = 10000000;
    this.xIncr = 0.01;
  }

  display() {
    // using perlin noise to simulate light level fluctuations in the night sky
    const skyColor = noise(this.xoff) * this.brightest;
    // refresh the background each time to allow us to see a fresh screen
    background(skyColor);
    this.xoff += this.xIncr;
  }
}

class Owl {
  constructor() {
    // starting position of owl predator is centered
    this.pos = createVector(width / 2, height / 2);
    // no beginning velocity
    this.vel = createVector(0, 0);
    // no beginning acceleration
    this.acc = createVector(0, 0);
    // start the x-offset at the begining of it's time space
    this.xoff = 0;
    // push the y-offset to an arbitrary time distance from the x
    this.yoff = 100000;
    // boolean to decide whether the owl predator can "hear" the mouse prey
    // is mapped to mousePressed()
    this.towardMouse = false;
    // easingCount is used to transistion from one velocity direction to another more smoothly
    this.easingCount = 0;
    // the amount to move through perlin time each time fly() is run (per frame)
    this.offsetIncr = 0.001;
    // starting size of the owl
    this.size = 20;
    // how big the mouse is, will be used to calculate if the owl has caught it
    this.mouseSize = 8;
  }

  getAcceleration() {
    // acceleration can be towards the mouse or generated using perlin, here it is decided
    if (this.towardMouse) { // if the mouse is currently pressed
      // set a mouse vector
      const mouseVector = createVector(mouseX, mouseY);
      // get a new acceleratoin vector, normalise it to a unit vector and than change it's magnitude to feeling
      return p5.Vector.sub(mouseVector, this.pos).normalize().mult(0.2);
    } else { // if the mouse is not being pressed
      // get random x and y coordinates using perlin and the sketch dimensions
      const x = noise(this.xoff) * width;
      const y = noise(this.yoff) * height;
      // create a vector using these randomised values
      const noiseVector = createVector(x, y);
      // get a new acceleratoin vector, normalise it to a unit vector and than change it's magnitude to feeling
      // when the owl is scouting without a target it will move more slowly then when it can hear something, hence mult(0.05)
      return p5.Vector.sub(noiseVector, this.pos).normalize().mult(0.05);
    }
  }
  
  hasCaughtMouse() {
    // very simple collision detection, currently the mouse is a square
    const halfSize = this.mouseSize / 2; // get the half size so we can work out from it's center
    const x = this.pos.x;
    const y = this.pos.y;
    // the boundaries of the mouse are pretty self-explanitory
    const lowerXBoundary = mouseX - halfSize;
    const upperXBoundary = mouseX + halfSize;
    const lowerYBoundary = mouseY - halfSize;
    const upperYBoundary = mouseY + halfSize;
    // calculate a boolean for if the owls x position is within the mouse's body
    const withinXBoundary = x > lowerXBoundary && x < upperXBoundary;
    // do the same for y
    const withinYBoundary = y > lowerYBoundary && y < upperYBoundary;
    // we want to check that the mouse is being heard, is set upon, and that it isn't the same mouse that was just eaten
    return this.towardMouse && withinXBoundary && withinYBoundary && this.easingCount === 0;
  }
  
  update() {
    // have the owl do it's thing
    this.fly();
    // if the owl catches the mouse it will get bigger and stronger
    if (this.hasCaughtMouse()) this.size += 2;
  }
  
  fly() {
    // tucked away the acceleration logic
    this.acc = this.getAcceleration();
    // the easing count is a countdown activate after the mouse has disappeared
    if (this.easingCount > 0) {
      // slow the velocity in the direction of the previously visible mouse
      this.vel.mult(0.8);
      // decrease the count
      this.easingCount--;
    }
    
    // whilst the owl cannot hear the mouse continue moving through perlin time
    if (!this.towardMouse) {
      this.xoff += this.offsetIncr;
      this.yoff += this.offsetIncr;
    }
    // add the acceleration to the current velocity
    this.vel.add(this.acc);
    // then add this velocity to the position to create the movement
    this.pos.add(this.vel);
  }

  display() {
    // set the owl's color
    fill(78, 143, 0);
    // and remove the stroke
    noStroke();

    // to uncomplicate the math I am using the translate function
    translate(this.pos.x, this.pos.y);
    // rotation to point the owl's nose in the direction of flight
    let rotation = this.vel.heading() + 1.5; // some offsetting is needed, do not know why
    rotate(rotation);
    // triangle(-16, 32, 0, 0, 16, 32);
    const halfSize = this.size / 2;
    triangle(-1 * halfSize, this.size, 0, 0, halfSize, this.size);
  }

  // handler to deal with a mouse pressed event from the canvas
  handleMousePressed() {
    this.towardMouse = true;
  }

  // handler to deal with a mouse released event from the canvas
  handleMouseReleased() {
    // when the mouse button is released the "mouse" has disappeared from sight
    // so we set an easing count value to have the owl stop deccelerate in that direction
    this.easingCount = 40;
    this.towardMouse = false;
  }
}