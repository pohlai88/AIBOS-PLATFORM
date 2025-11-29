/* -----------------------------------------------------
   Kite String Wave Animation (Natural Wind Motion)
------------------------------------------------------ */

// Kite string with dynamic variation on each cycle
const stringTween = gsap.to("#stringPath", {
  duration: 6,
  repeat: -1,
  yoyo: true,
  attr: { d: "M 0 150 Q 350 130 700 160 T 1400 155" },
  ease: "sine.inOut",
  onRepeat: function () {
    this.vars.attr.d = `M 0 150 Q 350 ${120 + Math.random() * 40} 700 ${150 + Math.random() * 40} T 1400 ${150 + Math.random() * 40}`;
  },
});

/* -----------------------------------------------------
     Wind Particles Canvas
  ------------------------------------------------------ */

const canvas = document.getElementById("windCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
const particleCount = 90;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.3 + Math.random() * 0.6,
      size: Math.random() * 2,
      opacity: Math.random() * 0.3 + 0.05,
    });
  }
}

createParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    p.x += p.speed;
    if (p.x > canvas.width) p.x = -10;
  });

  requestAnimationFrame(drawParticles);
}

drawParticles();
/* -----------------------------------------------------
   Chapter 2 – Floating Cards Scatter on Scroll
------------------------------------------------------ */

gsap.to(".floating-card", {
  scrollTrigger: {
    trigger: "#before-rhythm",
    start: "top 70%",
    end: "top 30%",
    scrub: 1,
  },
  opacity: 0,
  y: -80,
  x: (i) => (i % 2 === 0 ? -120 : 120),
  ease: "power1.out",
});
/* -----------------------------------------------------
   Chapter 3 — MCP Nodes Lighting Up
------------------------------------------------------ */

const nodesContainer = document.getElementById("mcp-nodes");

// Generate 12 nodes
for (let i = 0; i < 12; i++) {
  const node = document.createElement("div");
  node.classList.add("mcp-node");

  node.style.left = `${5 + i * (90 / 12)}%`;
  node.style.top = `${100 + Math.sin(i * 0.8) * 25}px`;

  nodesContainer.appendChild(node);

  gsap.fromTo(
    node,
    { opacity: 0 },
    {
      opacity: 1,
      scrollTrigger: {
        trigger: "#emergence",
        start: "top 80%",
        end: "top 40%",
        scrub: true,
      },
      duration: 1.2,
      delay: i * 0.15,
    }
  );
}

/* -----------------------------------------------------
   Chapter 3 — String Pulse Animation
------------------------------------------------------ */

// Chapter 3 string with dynamic variation
gsap.to("#chapter3Path", {
  duration: 6,
  repeat: -1,
  yoyo: true,
  attr: { d: "M 0 100 Q 350 90 700 110 T 1400 105" },
  ease: "sine.inOut",
  onRepeat: function () {
    this.vars.attr.d = `M 0 100 Q 350 ${80 + Math.random() * 40} 700 ${100 + Math.random() * 40} T 1400 ${100 + Math.random() * 40}`;
  },
});
/* -----------------------------------------------------
   Chapter 4 — Ripple Simulation
------------------------------------------------------ */

const rippleCanvas = document.getElementById("rippleCanvas");
const rctx = rippleCanvas.getContext("2d");

function resizeRipple() {
  rippleCanvas.width = window.innerWidth;
  rippleCanvas.height = window.innerHeight;
}
resizeRipple();
window.addEventListener("resize", resizeRipple);

let ripples = [];

function createRipple(x, y) {
  ripples.push({
    x,
    y,
    radius: 2,
    opacity: 0.5,
  });
}

function rippleDraw() {
  rctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);

  ripples.forEach((r, idx) => {
    r.radius += 0.8;
    r.opacity -= 0.007;

    if (r.opacity <= 0) ripples.splice(idx, 1);

    rctx.beginPath();
    rctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    rctx.strokeStyle = `rgba(139,92,246,${r.opacity})`;
    rctx.lineWidth = 2;
    rctx.stroke();
  });

  requestAnimationFrame(rippleDraw);
}

rippleDraw();

gsap.to(
  {},
  {
    scrollTrigger: {
      trigger: "#ripple",
      start: "top 80%",
      end: "bottom 10%",
      scrub: true,
      onUpdate: (self) => {
        const x = window.innerWidth * (0.3 + Math.random() * 0.4);
        const y = window.innerHeight * (0.3 + Math.random() * 0.4);
        createRipple(x, y);
      },
    },
  }
);
/* -----------------------------------------------------
   Chapter 5 — Subtle background ripple
------------------------------------------------------ */

const hCanvas = document.getElementById("subtleRipples");
const hctx = hCanvas.getContext("2d");

function resizeHumanCanvas() {
  hCanvas.width = window.innerWidth;
  hCanvas.height = window.innerHeight;
}
resizeHumanCanvas();
window.addEventListener("resize", resizeHumanCanvas);

let softRipples = [];

function addSoftRipple() {
  const x = window.innerWidth * (0.2 + Math.random() * 0.6);
  const y = window.innerHeight * (0.4 + Math.random() * 0.2);

  softRipples.push({
    x,
    y,
    radius: 2,
    opacity: 0.3,
  });
}

function drawSoftRipples() {
  hctx.clearRect(0, 0, hCanvas.width, hCanvas.height);

  softRipples.forEach((r, idx) => {
    r.radius += 0.5;
    r.opacity -= 0.003;

    if (r.opacity <= 0) softRipples.splice(idx, 1);

    hctx.beginPath();
    hctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    hctx.strokeStyle = `rgba(180,160,255,${r.opacity})`;
    hctx.lineWidth = 1.5;
    hctx.stroke();
  });

  requestAnimationFrame(drawSoftRipples);
}

drawSoftRipples();

gsap.to(
  {},
  {
    scrollTrigger: {
      trigger: "#human",
      start: "top 90%",
      end: "bottom 10%",
      scrub: true,
      onUpdate: () => addSoftRipple(),
    },
  }
);
