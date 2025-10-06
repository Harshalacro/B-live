(function(){
  function initializeStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, stars, animationId;

    function resize(){
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(220, Math.floor((width * height) / 12000));
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.5 + 0.5,
        r: Math.random() * 1.2 + 0.2
      }));
    }

    let scrollOffset = 0;
    window.addEventListener('scroll', () => { scrollOffset = window.scrollY; });

    function render(){
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = 'white';
      for (const s of stars) {
        const parallax = scrollOffset * 0.0005 * s.z;
        let x = (s.x + parallax) % width; if (x < 0) x += width;
        let y = (s.y + parallax) % height; if (y < 0) y += height;
        ctx.globalAlpha = 0.3 + s.z * 0.7;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      animationId = requestAnimationFrame(render);
    }

    resize();
    render();
    window.addEventListener('resize', resize);
    return () => cancelAnimationFrame(animationId);
  }

  function initializeScrollReveal() {
    const nodes = document.querySelectorAll('.reveal-on-scroll');
    if (!nodes.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(n => io.observe(n));
  }

  function startTypewriter(target, phrases, options) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el || !phrases || !phrases.length) return;
    const speed = (options && options.speed) || 60;
    const backDelay = (options && options.backDelay) || 1200;
    const loop = (options && options.loop) !== false;
    let i = 0, j = 0, delet = false;

    function tick(){
      const phrase = phrases[i % phrases.length];
      if (!delet) {
        j++;
        el.textContent = phrase.slice(0, j) + '▍';
        if (j === phrase.length) { delet = true; setTimeout(tick, backDelay); return; }
      } else {
        j--;
        el.textContent = phrase.slice(0, j) + '▍';
        if (j === 0) { delet = false; i++; if (!loop && i >= phrases.length) return; }
      }
      setTimeout(tick, delet ? 28 : speed);
    }
    tick();
  }

  function initializeTilt(selector = '.tilt') {
    const cards = document.querySelectorAll(selector);
    const maxTilt = 8;
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * maxTilt;
        const ry = (x - 0.5) * maxTilt;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0) rotateY(0)';
      });
    });
  }

  window.PortfolioAnimations = {
    initializeStarfield,
    initializeScrollReveal,
    startTypewriter,
    initializeTilt
  };
})();
