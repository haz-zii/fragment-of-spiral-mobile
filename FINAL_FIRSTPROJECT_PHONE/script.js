document.addEventListener("DOMContentLoaded", function () {
    startTypewriter();
  
    document.getElementById("readAgainButton").addEventListener("click", function () {
      resetProject();
    });
  
    document.getElementById("scrollContainer").addEventListener("scroll", onScroll);
  });
  

  function startTypewriter() {
    const text =
      "Have you ever spiraled mentally when the silence of gazing into a painting starts to look and sound like your own thoughts?";
    const target = document.getElementById("typewriter-text");
    target.textContent = "";
    let i = 0;
    const speed = 50; 
  
    function type() {
      if (i < text.length) {
        target.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => {
          const phase1 = document.getElementById("phase1");
          phase1.classList.add("fade-out");
          setTimeout(() => {
            phase1.style.display = "none";
            const scrollContainer = document.getElementById("scrollContainer");
            scrollContainer.style.display = "block";
            scrollContainer.offsetHeight;
            scrollContainer.style.opacity = "1";
            document.body.style.overflow = "auto";
          }, 1000);
        }, 3000);
      }
    }
    type();
  }
  

  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  function resizeCanvas() {
    canvas.width = 390;
    canvas.height = 844;
  }
  
  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  
  class Particle {
    constructor(effect) {
      this.effect = effect;
      this.x = Math.floor(Math.random() * this.effect.width);
      this.y = Math.floor(Math.random() * this.effect.height);
      this.speedX;
      this.speedY;
      this.speedModifier = Math.floor(Math.random() * 2 + 1);
      this.history = [{ x: this.x, y: this.y }];
      this.maxLength = Math.floor(Math.random() * 60 + 50);
      this.angle = 0;
      this.newAngle = 0;
      this.angleCorrector = Math.random() * 0.5 + 0.01;
      this.timer = this.maxLength * 2;
    }
    draw(context) {
      context.beginPath();
      context.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 0; i < this.history.length; i++) {
        context.lineTo(this.history[i].x, this.history[i].y);
      }
      context.strokeStyle = "#661b8e";
      context.stroke();
    }
    update() {
      this.timer--;
      if (this.timer >= 1) {
        let x = Math.floor(this.x / this.effect.cellSize);
        let y = Math.floor(this.y / this.effect.cellSize);
        let index = y * this.effect.cols + x;
        if (this.effect.flowField[index]) {
          this.angle = this.effect.flowField[index].colorAngle;
          if (this.angle > this.newAngle) {
            this.angle -= this.angleCorrector;
          } else if (this.angle < this.newAngle) {
            this.angle += this.angleCorrector;
          } else {
            this.angle = this.newAngle;
          }
        }
        this.speedX = Math.cos(this.angle);
        this.speedY = Math.sin(this.angle);
        this.x += this.speedX * this.speedModifier;
        this.y += this.speedY * this.speedModifier;
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > this.maxLength) {
          this.history.shift();
        }
      } else if (this.history.length > 1) {
        this.history.shift();
      } else {
        this.reset();
      }
    }
    reset() {
      let attempts = 0;
      let resetSuccess = false;
      while (attempts < 10 && !resetSuccess) {
        attempts++;
        let testIndex = Math.floor(Math.random() * this.effect.flowField.length);
        if (this.effect.flowField[testIndex].alpha > 0) {
          this.x = this.effect.flowField[testIndex].x;
          this.y = this.effect.flowField[testIndex].y;
          this.history = [{ x: this.x, y: this.y }];
          this.timer = this.maxLength * 2;
          resetSuccess = true;
        }
      }
      if (!resetSuccess) {
        this.x = Math.random() * this.effect.width;
        this.y = Math.random() * this.effect.height;
        this.history = [{ x: this.x, y: this.y }];
        this.timer = this.maxLength * 2;
      }
    }
  }
  
  class Effect {
    constructor(canvas, ctx) {
      this.canvas = canvas;
      this.context = ctx;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.particles = [];
      this.numberOfParticles = 1000;
      this.cellSize = 3;
      this.rows;
      this.cols;
      this.flowField = [];
      this.debug = true;
      this.init();
  
      window.addEventListener("resize", () => {
        this.resize(window.innerWidth, window.innerHeight);
      });
    }
    drawText() {
      this.context.font = "100px Impact";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      const gradient3 = this.context.createRadialGradient(
        this.width * 0.5,
        this.height * 0.5,
        10,
        this.width * 0.5,
        this.height * 0.5,
        this.width
      );
      gradient3.addColorStop(0.2, "blue");
      gradient3.addColorStop(0.4, "rgb(200,255,0)");
      gradient3.addColorStop(0.6, "rgb(0,0,255)");
      gradient3.addColorStop(0.8, "rgb(0,0,0)");
      this.context.fillStyle = gradient3;
      this.context.fillText("SPIRAL", this.width * 0.5, this.height * 0.5, this.width * 0.8);
    }
    init() {
      this.rows = Math.floor(this.height / this.cellSize);
      this.cols = Math.floor(this.width / this.cellSize);
      this.flowField = [];
      this.drawText();
      const pixels = this.context.getImageData(0, 0, this.width, this.height).data;
      for (let y = 0; y < this.height; y += this.cellSize) {
        for (let x = 0; x < this.width; x += this.cellSize) {
          const index = (y * this.width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const greyscale = (red + green + blue) / 3;
          const colorAngle = ((greyscale / 255) * 6.28).toFixed(2);
          this.flowField.push({
            x: x,
            y: y,
            alpha: alpha,
            colorAngle: colorAngle,
          });
        }
      }
      this.particles = [];
      for (let i = 0; i < this.numberOfParticles; i++) {
        this.particles.push(new Particle(this));
      }
      this.particles.forEach((particle) => particle.reset());
    }
    resize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }
    render() {
      this.particles.forEach((particle) => {
        particle.draw(this.context);
        particle.update();
      });
    }
  }
  
  const effect = new Effect(canvas, ctx);
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.render();
    requestAnimationFrame(animate);
  }
  animate();
  

  function onScroll(e) {
    const phase3 = document.getElementById("phase3");
    const rect = phase3.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
      const svgPath = document.getElementById("text-curve");
      const pathLength = svgPath.getTotalLength();
      const offset = (1 - scrollPercent) * pathLength;
      document.getElementById("text-Path").setAttribute("startOffset", offset);
    }
  }
  
 
  function resetProject() {
    location.reload();
  }
  