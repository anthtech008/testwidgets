(() => {
  const canvas = document.getElementById('cat-canvas');
  const ctx = canvas.getContext('2d');

  const GRID = 16;
  const COLORS = {
    outline: '#2b2320',
    fur: '#d97a34',
    belly: '#f5efe1',
    eye: '#241c14',
    sparkle: '#ffffff',
    nose: '#f2b6c9',
  };

  const mirrorX = (x, w) => GRID - x - w;

  // Pixel-art cat bust, built from rectangles on a 16x16 grid. Only the
  // left half is chosen deliberately; every right-side piece is the
  // mirrorX() of its left twin, so the sprite is symmetric by construction.
  const baseParts = [
    { x: 2, y: 0, w: 3, h: 3, c: COLORS.outline }, // ear L outline
    { x: mirrorX(2, 3), y: 0, w: 3, h: 3, c: COLORS.outline }, // ear R outline
    { x: 0, y: 2, w: 16, h: 14, c: COLORS.outline }, // head outline block
    { x: 3, y: 1, w: 1, h: 1, c: COLORS.fur }, // ear L peek
    { x: mirrorX(3, 1), y: 1, w: 1, h: 1, c: COLORS.fur }, // ear R peek
    { x: 1, y: 3, w: 14, h: 12, c: COLORS.fur }, // head fill
    { x: 4, y: 6, w: 2, h: 2, c: COLORS.eye },
    { x: mirrorX(4, 2), y: 6, w: 2, h: 2, c: COLORS.eye },
    { x: 5, y: 7, w: 1, h: 1, c: COLORS.sparkle },
    { x: mirrorX(5, 1), y: 7, w: 1, h: 1, c: COLORS.sparkle },
    { x: 7, y: 8, w: 2, h: 1, c: COLORS.nose },
    { x: 4, y: 11, w: 8, h: 3, c: COLORS.belly },
  ];

  const neutralMouth = [{ x: 6, y: 10, w: 4, h: 1, c: COLORS.outline }];
  const smileMouth = [
    { x: 6, y: 10, w: 4, h: 1, c: COLORS.outline },
    { x: 5, y: 9, w: 1, h: 1, c: COLORS.outline },
    { x: mirrorX(5, 1), y: 9, w: 1, h: 1, c: COLORS.outline },
  ];

  const cat = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 96,
    smiling: false,
    smileUntil: 0,
    nextTurn: 0,
  };

  let cssW = 0;
  let cssH = 0;

  function resize() {
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cat.size = Math.max(56, Math.min(cssW, cssH) * 0.14);
    cat.x = Math.min(cat.x, Math.max(0, cssW - cat.size));
    cat.y = Math.min(cat.y, Math.max(0, cssH - cat.size));
  }

  function randomDirection() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 50; // css px / sec
    cat.vx = Math.cos(angle) * speed;
    cat.vy = Math.sin(angle) * speed;
  }

  function pickNewTurnTime(now) {
    cat.nextTurn = now + 1500 + Math.random() * 2500;
  }

  function drawCat() {
    const scale = cat.size / GRID;
    const mouth = cat.smiling ? smileMouth : neutralMouth;
    for (const part of baseParts.concat(mouth)) {
      ctx.fillStyle = part.c;
      ctx.fillRect(
        cat.x + part.x * scale,
        cat.y + part.y * scale,
        part.w * scale,
        part.h * scale
      );
    }
  }

  let lastTime = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (!cat.smiling) {
      if (now >= cat.nextTurn) {
        randomDirection();
        pickNewTurnTime(now);
      }

      cat.x += cat.vx * dt;
      cat.y += cat.vy * dt;

      const maxX = cssW - cat.size;
      const maxY = cssH - cat.size;

      if (cat.x < 0) {
        cat.x = 0;
        cat.vx *= -1;
      }
      if (cat.x > maxX) {
        cat.x = maxX;
        cat.vx *= -1;
      }
      if (cat.y < 0) {
        cat.y = 0;
        cat.vy *= -1;
      }
      if (cat.y > maxY) {
        cat.y = maxY;
        cat.vy *= -1;
      }
    } else if (now >= cat.smileUntil) {
      cat.smiling = false;
      randomDirection();
      pickNewTurnTime(now);
    }

    ctx.clearRect(0, 0, cssW, cssH);
    drawCat();

    requestAnimationFrame(frame);
  }

  function handleClick(evt) {
    const rect = canvas.getBoundingClientRect();
    const point = evt.changedTouches ? evt.changedTouches[0] : evt;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    const pad = cat.size * 0.1;
    const hit =
      x >= cat.x - pad &&
      x <= cat.x + cat.size + pad &&
      y >= cat.y - pad &&
      y <= cat.y + cat.size + pad;

    if (hit) {
      cat.smiling = true;
      cat.vx = 0;
      cat.vy = 0;
      cat.smileUntil = performance.now() + 1400;
    }
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchend', handleClick, { passive: true });

  resize();
  cat.x = (cssW - cat.size) / 2;
  cat.y = (cssH - cat.size) / 2;
  randomDirection();
  pickNewTurnTime(performance.now());
  requestAnimationFrame(frame);
})();
