/* ======================================================
   SPIDER-MAN — Animations & Interactions
   Dramatic GSAP animations with Spider-Man flair.
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ===== LOADER ===== */
  const loaderEl = document.getElementById('loader');
  const pctEl = document.getElementById('loaderPct');
  const barFill = document.getElementById('loaderBarFill');
  const spiderLogo = document.getElementById('spiderLogo');
  let count = { val: 0 };

  // === Animated web canvas background ===
  const webCvs = document.getElementById('webCanvas');
  const ctx = webCvs.getContext('2d');
  function resizeCanvas() { webCvs.width = window.innerWidth; webCvs.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Web pattern: radial lines + concentric rings from center, slowly rotating
  let webAngle = 0;
  let loaderActive = true;

  // Expanding pulse rings
  let pulseRings = [];
  function spawnRing() {
    if (!loaderActive) return;
    pulseRings.push({ r: 0, alpha: 0.25, birth: Date.now() });
    setTimeout(spawnRing, 800 + Math.random() * 400);
  }
  spawnRing();

  function drawWebBg() {
    if (!loaderActive) return;
    ctx.clearRect(0, 0, webCvs.width, webCvs.height);
    const cx = webCvs.width / 2;
    const cy = webCvs.height / 2;
    const maxR = Math.hypot(cx, cy);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(webAngle);
    webAngle += 0.0015;

    // Radial lines
    const rays = 32;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * maxR, Math.sin(a) * maxR);
      ctx.strokeStyle = 'rgba(226,54,54,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Concentric rings
    const rings = 14;
    for (let i = 1; i <= rings; i++) {
      const r = (maxR / rings) * i;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(226,54,54,' + (0.04 * (1 - i / rings)) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    ctx.restore();

    // Expanding pulse rings
    const now = Date.now();
    pulseRings = pulseRings.filter(ring => {
      const age = (now - ring.birth) / 1000;
      ring.r = age * 220;
      ring.alpha = Math.max(0, 0.25 - age * 0.1);
      if (ring.alpha <= 0) return false;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(226,54,54,' + ring.alpha + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return true;
    });

    // Red pulsing glow in the center
    const pulse = 0.35 + 0.2 * Math.sin(Date.now() * 0.003);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 280);
    grad.addColorStop(0, 'rgba(226,54,54,' + pulse + ')');
    grad.addColorStop(0.4, 'rgba(226,54,54,0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, webCvs.width, webCvs.height);

    requestAnimationFrame(drawWebBg);
  }
  drawWebBg();

  // Spider logo entrance — dramatic drop from above
  gsap.fromTo(spiderLogo,
    { y: -120, scale: 0.3, opacity: 0, rotation: -360 },
    { y: 0, scale: 1, opacity: 1, rotation: 0, duration: 1.5, delay: 0.1, ease: 'elastic.out(1, 0.5)' }
  );

  // Breathing pulse with red glow intensification
  gsap.to(spiderLogo, {
    scale: 1.08, duration: 0.9, repeat: -1, yoyo: true,
    ease: 'sine.inOut', delay: 1.6
  });

  // Count + bar
  gsap.to(count, {
    val: 100,
    duration: 2.4,
    ease: 'power2.inOut',
    roundProps: 'val',
    onUpdate() {
      const v = Math.floor(count.val);
      pctEl.innerHTML = v + '<span>%</span>';
      barFill.style.width = v + '%';
    },
    onComplete() {
      // Web explosion: draw expanding red particles on canvas
      loaderActive = false;
      let particles = [];
      const cx = webCvs.width / 2;
      const cy = webCvs.height / 2;
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 6;
        particles.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1 });
      }
      function drawExplosion() {
        ctx.clearRect(0, 0, webCvs.width, webCvs.height);
        let alive = false;
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015;
          if (p.life <= 0) return;
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(226,54,54,' + p.life * 0.6 + ')';
          ctx.fill();
          // Draw web trail
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(226,54,54,' + p.life * 0.08 + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
        if (alive) requestAnimationFrame(drawExplosion);
      }
      drawExplosion();

      const tl = gsap.timeline();
      tl.to(spiderLogo, { scale: 25, opacity: 0, duration: 0.9, ease: 'power4.in' })
        .to([pctEl, loaderEl.querySelector('.loader-bar'), loaderEl.querySelector('.loader-text')],
          { opacity: 0, y: 15, stagger: 0.04, duration: 0.25 }, '-=0.7')
        .to(loaderEl, {
          opacity: 0, duration: 0.4,
          onComplete() {
            loaderEl.style.display = 'none';
            ScrollTrigger.refresh(true);
            animateNav();
            runHeroAnim();
          }
        }, '-=0.15');
    }
  });

  /* ===== SCROLL PROGRESS ===== */
  const progressBar = document.getElementById('progress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0) progressBar.style.width = (window.scrollY / max * 100) + '%';
  });

  /* ===== NAV SCROLL ===== */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ===== NAV ACTIVE SECTION TRACKING ===== */
  const navLinks = document.querySelectorAll('.nav-link');
  const navGlow = document.getElementById('navActiveGlow');
  const navPill = document.getElementById('navPill');
  const sectionIds = ['about', 'skills', 'work', 'friends', 'contact'];

  function updateActiveNav() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let activeIdx = -1;
    sectionIds.forEach((id, i) => {
      const section = document.getElementById(id);
      if (section && scrollY >= section.offsetTop) activeIdx = i;
    });

    navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === activeIdx);
    });

    // Move glow indicator
    if (activeIdx >= 0 && navPill) {
      const activeLink = navLinks[activeIdx];
      const pillRect = navPill.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      navGlow.style.left = (linkRect.left - pillRect.left) + 'px';
      navGlow.style.width = linkRect.width + 'px';
      navGlow.style.opacity = '1';
    } else if (navGlow) {
      navGlow.style.opacity = '0';
    }
  }
  window.addEventListener('scroll', updateActiveNav);

  /* ===== NAV ENTRANCE ANIMATION ===== */
  // Animate logo + pill after loader
  function animateNav() {
    gsap.fromTo('.nav-logo',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' }
    );
    gsap.fromTo('.nav-pill',
      { y: -20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.2, ease: 'back.out(1.4)' }
    );
    gsap.fromTo('.nav-link',
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, delay: 0.4, ease: 'power2.out' }
    );
  }

  /* ===== NAV SMOOTH SCROLL ===== */
  document.querySelectorAll('.nav-link, .mnav-link, [href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      gsap.to(window, { scrollTo: { y: target, offsetY: 72 }, duration: 1, ease: 'power3.inOut' });
      closeMobileNav();
    });
  });

  /* ===== MOBILE NAV ===== */
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  function closeMobileNav() {
    toggle.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ===== HERO ANIMATED WEB CANVAS ===== */
  const heroCvs = document.getElementById('heroCanvas');
  const hctx = heroCvs.getContext('2d');
  let heroParticles = [];
  const PARTICLE_COUNT = 50;
  let mouseX = -1, mouseY = -1;

  function resizeHeroCanvas() {
    heroCvs.width = window.innerWidth;
    heroCvs.height = window.innerHeight;
  }
  resizeHeroCanvas();
  window.addEventListener('resize', resizeHeroCanvas);

  // Track mouse for interactive web lines
  document.getElementById('hero').addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  document.getElementById('hero').addEventListener('mouseleave', () => {
    mouseX = -1; mouseY = -1;
  });

  // Spawn floating particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    heroParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.3
    });
  }

  function drawHeroBg() {
    hctx.clearRect(0, 0, heroCvs.width, heroCvs.height);
    const w = heroCvs.width, h = heroCvs.height;

    // Move & draw particles
    heroParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      hctx.beginPath();
      hctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      hctx.fillStyle = 'rgba(226,54,54,' + p.alpha * 0.5 + ')';
      hctx.fill();
    });

    // Draw connection lines between nearby particles
    for (let i = 0; i < heroParticles.length; i++) {
      for (let j = i + 1; j < heroParticles.length; j++) {
        const a = heroParticles[i], b = heroParticles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const alpha = (1 - dist / 150) * 0.08;
          hctx.beginPath();
          hctx.moveTo(a.x, a.y);
          hctx.lineTo(b.x, b.y);
          hctx.strokeStyle = 'rgba(226,54,54,' + alpha + ')';
          hctx.lineWidth = 0.5;
          hctx.stroke();
        }
      }
    }

    // Draw web lines from mouse to nearby particles
    if (mouseX >= 0 && mouseY >= 0) {
      heroParticles.forEach(p => {
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const alpha = (1 - dist / 200) * 0.15;
          hctx.beginPath();
          hctx.moveTo(mouseX, mouseY);
          hctx.lineTo(p.x, p.y);
          hctx.strokeStyle = 'rgba(226,54,54,' + alpha + ')';
          hctx.lineWidth = 0.6;
          hctx.stroke();
        }
      });
    }

    // Subtle center glow
    const grd = hctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, w * 0.5);
    grd.addColorStop(0, 'rgba(226,54,54,0.03)');
    grd.addColorStop(1, 'transparent');
    hctx.fillStyle = grd;
    hctx.fillRect(0, 0, w, h);

    requestAnimationFrame(drawHeroBg);
  }
  drawHeroBg();

  /* ===== HERO ANIMATION ===== */
  function runHeroAnim() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero-tag',
      { y: 30, autoAlpha: 0, scale: 0.9 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.7 }
    )
    .fromTo('.hero-word', 
      { yPercent: 120, rotateX: -40 },
      {
        yPercent: 0, rotateX: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power4.out'
      }, '-=0.3'
    )
    .fromTo('.hero-role',
      { x: -30, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo('.hero-desc',
      { y: 25, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8 },
      '-=0.4'
    )
    .fromTo('.hero-cta',
      { y: 25, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8 },
      '-=0.5'
    )
    .fromTo('.hero-scroll',
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.7 },
      '-=0.3'
    );
  }

  /* ===== SECTION LABELS ===== */
  document.querySelectorAll('.section-label').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter() {
        gsap.fromTo(el.children,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
        );
      }
    });
  });

  /* ===== SECTION HEADINGS ===== */
  document.querySelectorAll('.section-heading, .about-heading, .contact-heading').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter() {
        gsap.fromTo(el,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
        );
      }
    });
  });

  /* ===== ABOUT ===== */
  // Image entrance with parallax tilt
  const aboutImg = document.querySelector('.about-img-wrap');
  ScrollTrigger.create({
    trigger: aboutImg, start: 'top 80%', once: true,
    onEnter() {
      gsap.fromTo(aboutImg,
        { x: -60, opacity: 0, scale: 0.9, rotateY: 8 },
        { x: 0, opacity: 1, scale: 1, rotateY: 0, duration: 1, ease: 'power3.out' }
      );
      // Animate corner brackets
      gsap.fromTo('.img-corner-tl',
        { opacity: 0, x: -10, y: -10 },
        { opacity: 1, x: 0, y: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo('.img-corner-br',
        { opacity: 0, x: 10, y: 10 },
        { opacity: 1, x: 0, y: 0, duration: 0.6, delay: 0.6, ease: 'power2.out' }
      );
    }
  });

  // 3D tilt on about image
  if (aboutImg) {
    aboutImg.addEventListener('mousemove', e => {
      const rect = aboutImg.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(aboutImg, {
        rotateY: x * 10, rotateX: -y * 10,
        duration: 0.3, ease: 'power2.out',
        transformPerspective: 600
      });
    });
    aboutImg.addEventListener('mouseleave', () => {
      gsap.to(aboutImg, {
        rotateY: 0, rotateX: 0,
        duration: 0.6, ease: 'power2.out'
      });
    });
  }

  // Heading entrance
  ScrollTrigger.create({
    trigger: '.about-heading', start: 'top 85%', once: true,
    onEnter() {
      gsap.fromTo('.about-heading',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  });

  // Text paragraphs stagger
  ScrollTrigger.create({
    trigger: '.about-text-col', start: 'top 80%', once: true,
    onEnter() {
      gsap.fromTo('.about-text-col p',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.7, ease: 'power2.out' }
      );
    }
  });

  /* ===== STAT COUNT-UP + BARS ===== */
  ScrollTrigger.create({
    trigger: '.about-stats', start: 'top 88%', once: true,
    onEnter() {
      gsap.fromTo('.stat-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'back.out(1.2)' }
      );
      document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        gsap.to({ v: 0 }, {
          v: target, duration: 1.8, ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
        });
      });
      // Animate stat bars
      document.querySelectorAll('.stat-bar-fill').forEach(bar => {
        const w = bar.dataset.width || '50%';
        gsap.to(bar, { width: w, duration: 1.5, delay: 0.3, ease: 'power2.out' });
      });
    }
  });

  /* ===== SKILLS ===== */
  const skillCards = document.querySelectorAll('.skill-card');

  // Set per-card brand color + inject glow overlay + web corner
  skillCards.forEach(card => {
    const color = card.dataset.color || '#e23636';
    card.style.setProperty('--card-color', color);

    // Random floating params
    card.style.setProperty('--float-dur', (3 + Math.random() * 2.5) + 's');
    card.style.setProperty('--float-delay', (Math.random() * 2) + 's');

    // Inject glow overlay div
    const glow = document.createElement('div');
    glow.className = 'card-glow';
    card.insertBefore(glow, card.firstChild);

    // Inject web-corner SVG (small decorative web in top-right)
    const webSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    webSvg.setAttribute('class', 'web-corner');
    webSvg.setAttribute('viewBox', '0 0 28 28');
    // Small web arc lines
    for (let i = 0; i < 4; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const angle = (i / 4) * (Math.PI / 2);
      line.setAttribute('x1', '28');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', String(28 - Math.cos(angle) * 26));
      line.setAttribute('y2', String(Math.sin(angle) * 26));
      webSvg.appendChild(line);
    }
    // Arc
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('d', 'M28 14 A14 14 0 0 1 14 0');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', color);
    arc.setAttribute('stroke-width', '0.5');
    arc.setAttribute('opacity', '0.4');
    webSvg.appendChild(arc);
    card.appendChild(webSvg);
  });

  // 3D tilt on hover with enhanced perspective
  skillCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(600px) rotateY(' + (x * 18) + 'deg) rotateX(' + (-y * 18) + 'deg) scale3d(1.06,1.06,1.06)';

      // Move glow position to follow cursor
      const glowEl = card.querySelector('.card-glow');
      if (glowEl) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        glowEl.style.background = 'radial-gradient(circle at ' + px + '% ' + py + '%, var(--card-color), transparent 60%)';
      }
    });
    card.addEventListener('mouseenter', () => {
      card.classList.remove('floating');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.classList.add('floating');
      const glowEl = card.querySelector('.card-glow');
      if (glowEl) {
        glowEl.style.background = '';
      }
    });
  });

  // Entrance animation — category wave cascade
  ScrollTrigger.create({
    trigger: '#skillsGrid', start: 'top 85%', once: true,
    onEnter() {
      // Animate category labels
      gsap.fromTo('.cat-label',
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.25, duration: 0.5, ease: 'power2.out' }
      );

      // Animate cards per category with stagger wave
      document.querySelectorAll('.skills-category').forEach((cat, ci) => {
        const cards = cat.querySelectorAll('.skill-card');
        gsap.fromTo(cards,
          { y: 50, opacity: 0, scale: 0.85, rotateX: -12 },
          {
            y: 0, opacity: 1, scale: 1, rotateX: 0,
            stagger: 0.06,
            delay: ci * 0.3 + 0.2,
            duration: 0.65,
            ease: 'back.out(1.5)',
            onComplete() {
              cards.forEach(c => c.classList.add('floating'));
            }
          }
        );
      });
      // Count up
      const countEl = document.getElementById('skillCount');
      if (countEl) {
        gsap.to({ v: 0 }, {
          v: 17, duration: 1.5, delay: 0.6, ease: 'power2.out',
          onUpdate() { countEl.textContent = Math.round(this.targets()[0].v); }
        });
      }
    }
  });

  /* ===== PROJECTS ===== */
  document.querySelectorAll('.project').forEach(proj => {
    ScrollTrigger.create({
      trigger: proj, start: 'top 80%', once: true,
      onEnter() {
        gsap.fromTo(proj.querySelector('.project-img'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
        );
        gsap.fromTo(proj.querySelector('.project-info'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, delay: 0.15, ease: 'power2.out' }
        );
      }
    });
  });

  /* ===== FRIENDS ===== */
  const friendCards = document.querySelectorAll('.friend-card');

  // Animated conic-gradient border angle
  friendCards.forEach(card => {
    let angle = 0;
    let rafId = null;
    card.addEventListener('mouseenter', () => {
      (function spin() {
        angle = (angle + 1.5) % 360;
        card.style.setProperty('--angle', angle + 'deg');
        rafId = requestAnimationFrame(spin);
      })();
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
    });
  });

  // 3D tilt on hover
  friendCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(700px) rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 12) + 'deg) translateZ(10px)';
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, z: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform' });
    });
  });

  // Entrance
  ScrollTrigger.create({
    trigger: '#friendsGrid', start: 'top 85%', once: true,
    onEnter() {
      gsap.fromTo('.friend-card',
        { y: 50, opacity: 0, rotateX: -12, scale: 0.9 },
        { y: 0, opacity: 1, rotateX: 0, scale: 1, stagger: 0.12, duration: 0.7, ease: 'back.out(1.3)' }
      );
      gsap.fromTo('.friends-sub',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }
  });

  /* ===== CONTACT ===== */
  // Per-card brand color injection
  document.querySelectorAll('.contact-card').forEach(card => {
    const hex = card.dataset.color || '#e23636';
    const r = parseInt(hex.slice(1,3),16),
          g = parseInt(hex.slice(3,5),16),
          b = parseInt(hex.slice(5,7),16);
    card.style.setProperty('--cc-color', hex);
    card.style.setProperty('--cc-r', r);
    card.style.setProperty('--cc-g', g);
    card.style.setProperty('--cc-b', b);
  });

  // Conic-gradient border spin on hover
  document.querySelectorAll('.contact-card').forEach(card => {
    let raf = null;
    card.addEventListener('mouseenter', () => {
      let a = 180;
      const spin = () => {
        a = (a + 1.5) % 360;
        card.style.setProperty('--cc-angle', a + 'deg');
        raf = requestAnimationFrame(spin);
      };
      raf = requestAnimationFrame(spin);
    });
    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
    });
  });

  // 3D tilt on contact cards
  document.querySelectorAll('.contact-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.5, ease: 'back.out(1.7)', clearProps: 'transform' });
    });
  });

  // Heading entrance — per-character cascade
  ScrollTrigger.create({
    trigger: '.contact-heading', start: 'top 85%', once: true,
    onEnter() {
      const heading = document.querySelector('.contact-heading');
      const html = heading.innerHTML;
      // wrap each visible char in a span
      heading.innerHTML = html.replace(/(<[^>]+>)|(.)/g, (m, tag, ch) => {
        if (tag) return tag;
        if (ch === ' ') return ' ';
        return `<span class="ch">${ch}</span>`;
      });
      const chars = heading.querySelectorAll('.ch');
      gsap.fromTo(chars,
        { opacity: 0, y: 30, rotateX: -60 },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.025, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  });

  // Sub text + status badge
  ScrollTrigger.create({
    trigger: '.contact-sub', start: 'top 85%', once: true,
    onEnter() {
      gsap.fromTo('.contact-sub',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
      );
      gsap.fromTo('.contact-status',
        { y: 16, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: 'back.out(1.7)' }
      );
    }
  });

  // Card entrance — elastic stagger with slight random X
  ScrollTrigger.create({
    trigger: '.contact-links', start: 'top 85%', once: true,
    onEnter() {
      gsap.fromTo('.contact-card',
        { y: 40, opacity: 0, scale: 0.92, rotateX: -15 },
        {
          y: 0, opacity: 1, scale: 1, rotateX: 0,
          stagger: { each: 0.12, from: 'random' },
          duration: 0.7, ease: 'back.out(1.7)'
        }
      );
    }
  });

  /* ===== FOOTER ===== */
  ScrollTrigger.create({
    trigger: '#footer', start: 'top 95%', once: true,
    onEnter() {
      gsap.fromTo('.footer-left',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo('.footer-right',
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.15 }
      );
    }
  });

});
