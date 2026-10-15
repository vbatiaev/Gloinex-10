/* GLOINEX: interactions & animations */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $('.nav');
  const burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- smooth scroll ---------- */
  let lenis;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const target = a.getAttribute('href');
      if (target.length < 2 && target !== '#') return;
      e.preventDefault();
      lenis.scrollTo(target === '#top' ? 0 : target, { offset: -70 });
    }));
  }

  /* ---------- scroll state, progress, active link ---------- */
  const progress = $('.progress');
  const links = $$('.nav-links a');
  const sections = links.map(a => $(a.getAttribute('href')));
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    progress.style.transform = `scaleX(${h ? y / h : 0})`;
    let idx = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) idx = i; });
    links.forEach((l, i) => l.classList.toggle('active', i === idx));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- cursor + magnetic + tilt ---------- */
  if (fine && !reduce) {
    const cur = $('.cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    (function loop() {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    $$('a,button,.tile,.card').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .35;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      el.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1)';
    });
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(px - .5) * 12}deg`);
        el.style.setProperty('--rx', `${(.5 - py) * 12}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
      el.addEventListener('mouseleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- GSAP reveals ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    // split headings into words
    $$('.split').forEach(h => {
      h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      gsap.from($$('.w>span', h), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: .06,
        scrollTrigger: { trigger: h, start: 'top 85%' } });
    });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-title .line>span', { yPercent: 115, duration: 1.2, stagger: .12 }, .2)
      .from('.hero .reveal', { y: 30, opacity: 0, duration: 1, stagger: .1 }, .5)
      .from('.globe-wrap', { scale: .8, opacity: 0, duration: 1.6 }, .2)
      .from('.nav', { y: -40, opacity: 0, duration: 1 }, .3);

    $$('.reveal').filter(el => !el.closest('.hero')).forEach(el => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    ScrollTrigger.batch('.tile', { start: 'top 92%', onEnter: b => gsap.fromTo(b, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .9, ease: 'power3.out', overwrite: true }) });
    $$('.reveal-scale').forEach(el => gsap.from(el, { scale: .85, opacity: 0, rotate: -6, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } }));

    // about network: draw links on scroll
    $$('.network .links path').forEach(p => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: `${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut',
        onComplete: () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; },
        scrollTrigger: { trigger: '.network', start: 'top 75%' } });
    });

    // process: route draws & ship sails with scroll
    const path = $('#routePath');
    if (path && innerWidth > 860) {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      const ship = $('.route-ship'), steps = $$('.step'), route = $('.route'), svg = $('.route-line');
      ScrollTrigger.create({
        trigger: route, start: 'top 75%', end: 'bottom 55%', scrub: .6,
        onUpdate: self => {
          const p = self.progress;
          path.style.strokeDashoffset = len * (1 - p);
          const pt = path.getPointAtLength(len * p);
          const x = svg.offsetLeft + pt.x / 1000 * svg.clientWidth, y = svg.offsetTop + pt.y / 40 * svg.clientHeight;
          ship.style.transform = `translate(${x}px,${y}px)`;
          steps.forEach((s, i) => s.classList.toggle('lit', p >= i / 4 + .02));
        }
      });
    } else {
      $$('.step').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 70%', onEnter: () => s.classList.add('lit') }));
    }

    // parallax glows
    gsap.to('.hero-glow', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.contact-glow', { y: -150, ease: 'none', scrollTrigger: { trigger: '.contact', scrub: true } });
  } else {
    $$('.step').forEach(s => s.classList.add('lit'));
  }

  /* ---------- globe ---------- */
  const canvas = $('#globe');
  if (!canvas || !window.d3 || !window.topojson) return;
  const ctx = canvas.getContext('2d');
  const INDIA = [78.9, 21.5];
  const MARKETS = [
    [-0.1, 51.5], [10, 53.5], [2.35, 48.85], [37.6, 55.75], [55.3, 25.2], [-74, 40.7],
    [103.8, 1.35], [139.7, 35.7], [151.2, -33.9], [36.8, -1.3], [-46.6, -23.5], [28.9, 41], [-79.4, 43.7]
  ];
  const routes = MARKETS.map((m, i) => ({ to: m, interp: d3.geoInterpolate(INDIA, m), dist: d3.geoDistance(INDIA, m), off: i / MARKETS.length }));
  let W, R, dpr, dots = [];
  const proj = d3.geoOrthographic().clipAngle(90);
  const rot = { l: -70, p: -18, vl: 0, vp: 0 };
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; R = W * .4;
    canvas.width = canvas.height = W * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    proj.scale(R).translate([W / 2, W / 2]);
  };
  size(); addEventListener('resize', size);

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json').then(r => r.json()).then(topo => {
    const land = topojson.feature(topo, topo.objects.land);
    for (let lat = -58; lat <= 80; lat += 2.2) {
      const step = 2.2 / Math.cos(lat * Math.PI / 180);
      for (let lon = -180; lon < 180; lon += step) if (d3.geoContains(land, [lon, lat])) dots.push([lon, lat]);
    }
  });

  // drag to spin
  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    rot.vl = (e.clientX - drag[0]) * .25; rot.vp = -(e.clientY - drag[1]) * .15;
    rot.l += rot.vl; rot.p = Math.max(-45, Math.min(45, rot.p + rot.vp)); drag = [e.clientX, e.clientY];
  });
  canvas.addEventListener('pointerup', () => { drag = null; });

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);

  const visibleAt = c => d3.geoDistance(c, [-rot.l, -rot.p]) < Math.PI / 2 - .02;
  const lifted = (c, h) => {
    const p = proj(c), cx = W / 2, cy = W / 2;
    return [cx + (p[0] - cx) * (1 + h), cy + (p[1] - cy) * (1 + h)];
  };

  const draw = t => {
    requestAnimationFrame(draw);
    if (!visible) return;
    if (!drag) {
      rot.vl *= .95; rot.vp *= .95;
      rot.l += reduce ? 0 : .08 + rot.vl * .05;
      rot.p += (-18 - rot.p) * .01;
    }
    proj.rotate([rot.l, rot.p]);
    ctx.clearRect(0, 0, W, W);

    // atmosphere
    const g = ctx.createRadialGradient(W / 2, W / 2, R * .85, W / 2, W / 2, R * 1.25);
    g.addColorStop(0, 'rgba(123,108,255,.35)'); g.addColorStop(1, 'rgba(123,108,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, W / 2, R * 1.25, 0, 7); ctx.fill();
    const s = ctx.createRadialGradient(W * .4, W * .38, R * .1, W / 2, W / 2, R);
    s.addColorStop(0, '#24286B'); s.addColorStop(1, '#0E1036');
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(W / 2, W / 2, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,208,137,.25)'; ctx.lineWidth = 1; ctx.stroke();

    // graticule
    const path = d3.geoPath(proj, ctx);
    ctx.beginPath(); path(d3.geoGraticule10()); ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.stroke();

    // land dots
    ctx.fillStyle = 'rgba(228,224,255,.55)';
    const ds = Math.max(1, R / 180);
    for (const d of dots) {
      if (!visibleAt(d)) continue;
      const p = proj(d);
      const india = d[0] > 68 && d[0] < 92 && d[1] > 7 && d[1] < 35;
      if (india) { ctx.fillStyle = '#F59A3C'; ctx.fillRect(p[0] - ds, p[1] - ds, ds * 2.2, ds * 2.2); ctx.fillStyle = 'rgba(228,224,255,.55)'; }
      else ctx.fillRect(p[0] - ds / 2, p[1] - ds / 2, ds * 1.3, ds * 1.3);
    }

    // arcs
    const time = t / 1000;
    routes.forEach(r => {
      const H = .12 + r.dist * .12;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 40; i++) {
        const f = i / 40, c = r.interp(f);
        if (!visibleAt(c) && Math.sin(Math.PI * f) < .3) { started = false; continue; }
        const p = lifted(c, Math.sin(Math.PI * f) * H);
        started ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); started = true;
      }
      ctx.strokeStyle = 'rgba(245,154,60,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
      // cargo particle
      const f = (time * .18 + r.off) % 1, c = r.interp(f);
      if (visibleAt(c) || Math.sin(Math.PI * f) > .3) {
        const p = lifted(c, Math.sin(Math.PI * f) * H);
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, 7); ctx.fillStyle = '#FFD089';
        ctx.shadowColor = '#F59A3C'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
      }
      // market dot
      if (visibleAt(r.to)) {
        const p = proj(r.to);
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, 7); ctx.fillStyle = '#5EE6D0'; ctx.fill();
      }
    });

    // India beacon
    if (visibleAt(INDIA)) {
      const p = proj(INDIA), k = (time % 2) / 2;
      ctx.beginPath(); ctx.arc(p[0], p[1], 6 + k * 26, 0, 7);
      ctx.strokeStyle = `rgba(245,154,60,${1 - k})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 7); ctx.fillStyle = '#FFD089'; ctx.fill();
    }
  };
  requestAnimationFrame(draw);
})();
