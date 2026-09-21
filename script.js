document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(pointer: fine)').matches;
const isRepeatVisit = (function () {
  try { return sessionStorage.getItem('ls-visited') === '1'; } catch (e) { return false; }
})();
try { sessionStorage.setItem('ls-visited', '1'); } catch (e) {}

/* content images fade in as they finish loading, instead of popping in
   the instant the network delivers them */
try {
  document.querySelectorAll('main img').forEach(img => {
    if (img.closest('.hero')) return;
    img.classList.add('fade-img');
    const markLoaded = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth > 0) markLoaded();
    else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markLoaded);
      setTimeout(markLoaded, 4000); // never leave an image invisible
    }
  });
} catch (e) {}

/* hero safety net — this is the first thing anyone sees, so it gets its
   own short, tight backstop instead of waiting on the global one below */
function revealHero(){
  ['.hero-banner', '.hero-cta', '.hero-scroll'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.classList.remove('reveal-armed-op'); el.style.opacity = ''; el.style.transform = ''; }
  });
}
window.addEventListener('load', () => setTimeout(revealHero, 2600));

/* global safety net — nothing on this page is allowed to stay invisible */
function revealEverything(){
  document.querySelectorAll('.reveal-armed, .reveal-armed-op').forEach(el => {
    el.classList.remove('reveal-armed', 'reveal-armed-op');
    el.style.opacity = '';
    el.style.transform = '';
  });
  revealHero();
  document.querySelectorAll('.word-mask .word').forEach(el => { el.style.transform = ''; });
  document.querySelector('.site-header')?.classList.add('ready');
  document.getElementById('preloader')?.remove();
  document.body.style.overflow = '';
}
window.addEventListener('load', () => setTimeout(revealEverything, 5500));

/* preloader — skipped on repeat visits within the session, and for
   users who asked for reduced motion, so returning visitors aren't
   forced through the intro every time */
if (reduceMotion || isRepeatVisit) {
  document.getElementById('preloader')?.remove();
  document.querySelector('.site-header')?.classList.add('ready');
} else {
  try {
    document.body.style.overflow = 'hidden';
    const introTl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        document.getElementById('preloader')?.remove();
      }
    });
    introTl
      .to('.preloader-name', { opacity: 1, duration: 1, ease: 'sine.inOut' })
      .to('.preloader-line', { width: '56px', duration: .8, ease: 'sine.inOut' }, '-=.4')
      .to('.preloader-role', { opacity: 1, duration: .7, ease: 'sine.inOut' }, '-=.5')
      .to('.site-header', { opacity: 1, duration: .7, ease: 'sine.inOut' }, '-=.3')
      .to('.preloader-inner', { opacity: 0, duration: .6, ease: 'sine.inOut' }, '+=.55')
      .to('#preloader', { autoAlpha: 0, duration: .6, ease: 'sine.inOut' }, '-=.3');
  } catch (e) { revealEverything(); }
}

/* custom cursor — only takes over the pointer once it's actually running */
if (isFinePointer) {
  try {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    const label = document.getElementById('cursorLabel');
    document.body.classList.add('cursor-ready');
    let mx = 0, my = 0, rx = 0, ry = 0, lastT = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.setProperty('--x', mx + 'px');
      dot.style.setProperty('--y', my + 'px');
    });
    // Trailing ring/label lerp toward the pointer. The catch-up factor is
    // scaled by the actual time since the last frame so the trail closes at
    // the same real-world speed on a 60Hz display and a 120Hz ProMotion one
    // — a plain per-frame factor converges roughly twice as fast at 120fps,
    // which reads as a noticeably tighter/twitchier trail on those screens.
    (function loop(t){
      const dt = lastT ? t - lastT : 16.7;
      lastT = t;
      const k = 1 - Math.pow(1 - .16, dt / 16.7);
      rx += (mx - rx) * k; ry += (my - ry) * k;
      const x = rx + 'px', y = ry + 'px';
      ring.style.setProperty('--x', x); ring.style.setProperty('--y', y);
      label.style.setProperty('--x', x); label.style.setProperty('--y', y);
      requestAnimationFrame(loop);
    })(0);
    document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
      if (el.closest('.creation-item')) return;
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });
    document.querySelectorAll('.creation-item').forEach(el => {
      el.addEventListener('mouseenter', () => label.classList.add('show'));
      el.addEventListener('mouseleave', () => label.classList.remove('show'));
    });
    document.querySelectorAll('.site-header, .section-contact, .section-creations').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('on-dark'));
      el.addEventListener('mouseleave', () => ring.classList.remove('on-dark'));
    });
  } catch (e) {}
}

/* progress bar */
try {
  const progressBar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  }, { passive: true });
} catch (e) {}

/* header stays fixed and visible at all times — no hide-on-scroll.
   Past the hero it gets a solid backdrop instead of the difference-blend
   look, so it never visually merges with a heading scrolling underneath it */
try {
  const header = document.querySelector('.site-header');
  const setScrolled = () => header.classList.toggle('scrolled', window.scrollY > 80);
  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
} catch (e) {}

/* mobile nav */
try {
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    burger.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
} catch (e) {}

/* active nav link + dot nav */
try {
  const navLinks = document.querySelectorAll('[data-nav]');
  const dotLinks = document.querySelectorAll('.dot-nav a');
  const trackedSections = document.querySelectorAll('main section[id], .hero[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`[data-nav][href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
        dotLinks.forEach(d => d.classList.remove('active'));
        const dot = document.querySelector(`.dot-nav a[data-dot="${entry.target.id}"]`);
        if (dot) dot.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  trackedSections.forEach(s => navObserver.observe(s));
} catch (e) {}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}
if (window.gsap && window.Flip) {
  gsap.registerPlugin(Flip);
}

/* hero banner + CTAs settle in on load */
try {
  const banner = document.querySelector('.hero-banner');
  const cta = document.querySelector('.hero-cta');
  const scroll = document.querySelector('.hero-scroll');
  gsap.set([banner, cta], { opacity: 0, y: 14 });
  gsap.to(banner, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: .3 });
  gsap.to(cta, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: .8 });
  gsap.set(scroll, { opacity: 0 });
  gsap.to(scroll, { opacity: 1, duration: 1, delay: 1.5 });
} catch (e) {}

/* generic reveal — pure opacity, tied to scroll position (no slide) */
try {
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    if (el.closest('.hero')) return;
    el.classList.add('reveal-armed');
    el.style.transform = 'none';
    gsap.to(el, {
      opacity: 1, duration: .1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 96%', end: 'top 68%', scrub: .4 }
    });
  });
} catch (e) {}

/* opacity-only reveal — for elements whose own hover state already animates
   transform (service cards lift on hover); a slide reveal would fight that */
try {
  gsap.utils.toArray('[data-reveal-fade]').forEach(el => {
    el.classList.add('reveal-armed-op');
    gsap.to(el, {
      opacity: 1, duration: .1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 65%', scrub: .4 }
    });
  });
} catch (e) {}

/* section numbers — count up from 00 as they enter view, like a spec sheet */
try {
  document.querySelectorAll('.section-num').forEach(el => {
    const full = el.textContent.trim();
    const m = full.match(/^(\d+)(.*)$/);
    if (!m || reduceMotion) return;
    const targetNum = parseInt(m[1], 10);
    const suffix = m[2];
    const pad = m[1].length;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: targetNum, duration: 1.1, ease: 'power2.out',
          onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(pad, '0') + suffix; },
          onComplete: () => { el.textContent = full; }
        });
      }
    });
  });
} catch (e) {}

/* section titles — split into words that rise up out of a masked line */
try {
  document.querySelectorAll('[data-reveal-chars]').forEach(title => {
    const text = title.textContent.trim();
    title.innerHTML = text.split(' ').map(w =>
      `<span class="word-mask"><span class="word">${w}</span></span>`
    ).join(' ');
    const words = title.querySelectorAll('.word');
    if (reduceMotion) return;
    gsap.set(words, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: title, start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(words, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .05 });
        // real-timer backstop: never leave a title clipped mid-reveal
        setTimeout(() => words.forEach(w => { w.style.transform = ''; }), 1600);
      }
    });
  });
} catch (e) {}

/* parallax drift */
try {
  gsap.to('.portrait-frame img', {
    yPercent: -10, ease: 'none',
    scrollTrigger: { trigger: '.apropos-visual', start: 'top bottom', end: 'bottom top', scrub: true }
  });
} catch (e) {}


/* palette copy — delegated so it also works on swatches cloned into the
   project detail page, not just the ones present at load */
try {
  const toast = document.getElementById('toast');
  document.addEventListener('click', e => {
    const sw = e.target.closest('.swatch');
    if (!sw) return;
    const hex = sw.dataset.copy;
    navigator.clipboard?.writeText(hex).catch(() => {});
    toast.textContent = `${sw.dataset.name} (${hex}) copié ✓`;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  });
} catch (e) {}

/* creation filters — same cascade reveal as sur jaurysmgrt.github.io/Portfolio :
   chaque tuile qui apparaît fait un fondu + léger glissement + démasquage,
   une par une (léger décalage). Celles qui disparaissent sortent tout de
   suite : un fondu de sortie les laissait visibles (mauvaise catégorie)
   pendant un court instant, donc on coupe net comme sur le site de
   référence. La grille ne déplace jamais rien (pas de Flip / absolu). */
try {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const creationItems = Array.from(document.querySelectorAll('.creation-item'));

  let wave = 0, waveTimer = null;
  function waveDelay() {
    wave++;
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => { wave = 0; }, 240);
    return Math.min(wave - 1, 9) * 60;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      item.style.setProperty('--gd', waveDelay() + 'ms');
      item.classList.add('shown');
      revealObserver.unobserve(item);
    });
  }, { threshold: .1 });

  function applyFilter(f, animate) {
    let n = 0;
    creationItems.forEach(item => {
      const cats = (item.dataset.cat || '').split(' ');
      const show = f === 'all' || cats.includes(f);

      if (show) {
        item.classList.remove('is-hidden');
        item.classList.remove('shown');
        if (!animate || reduceMotion) {
          revealObserver.observe(item);
          return;
        }
        item.style.setProperty('--gd', Math.min(n++, 9) * 60 + 'ms');
        requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('shown')));
      } else {
        item.classList.add('is-hidden');
        item.classList.remove('shown');
        revealObserver.unobserve(item);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter, true);
    });
  });

  // au premier chargement, chaque tuile se révèle au scroll plutôt que
  // toutes en cascade derrière le préchargeur (invisible sinon)
  applyFilter('all', false);

  // filet de sécurité : une tuile ne doit jamais rester invisible si
  // l'observateur ne se déclenche pas pour une raison ou une autre
  setTimeout(() => {
    creationItems.forEach(item => {
      if (!item.classList.contains('is-hidden')) item.classList.add('shown');
    });
  }, 4000);
} catch (e) {}

/* project detail pages — clicking a tile expands its cover photo straight
   into the hero of the detail page (GSAP Flip), instead of just opening
   a panel on top of everything */
try {
  const items = Array.from(document.querySelectorAll('.creation-item'));
  const page = document.getElementById('projectPage');
  const elHero = document.getElementById('projectHeroImg');
  const elIndex = document.getElementById('projectIndex');
  const elTitle = document.getElementById('projectTitle');
  const elDesc = document.getElementById('projectDesc');
  const elGallery = document.getElementById('projectGallery');
  const elCount = document.getElementById('projectCount');
  const elTag = document.getElementById('projectTag');
  const elPalette = document.getElementById('projectPalette');
  const elPaletteSwatches = document.getElementById('projectPaletteSwatches');
  const hasFlip = window.gsap && window.Flip;
  const catLabels = { bijoux: 'Bijoux', 'dessin-technique': 'Dessins techniques', silhouette: 'Mode', collab: 'Collaboration', print: 'Prints', moodboard: 'Moodboard' };
  let currentProject = 0;

  function renderProject(i, skipTextAnim) {
    const item = items[i];
    if (!item) return;
    currentProject = i;
    const idx = item.querySelector('.creation-index')?.textContent.trim() || '';
    const title = item.querySelector('h3')?.textContent.trim() || '';
    const desc = item.querySelector('.full-desc')?.textContent.trim() || '';
    const imgs = item.querySelectorAll('.creation-thumb img, .extra-gallery img');
    const cover = item.querySelector('.tile-cover');
    const cats = (item.dataset.cat || '').split(' ').filter(Boolean).map(c => catLabels[c] || c);

    elHero.src = cover ? (cover.currentSrc || cover.src) : (imgs[0] ? (imgs[0].currentSrc || imgs[0].src) : '');
    elHero.alt = title;
    elHero.classList.toggle('label-cover', elHero.src.includes('/label-'));
    page.classList.toggle('brand-layout', item.dataset.layout === 'brand');
    elIndex.textContent = idx;
    elTag.textContent = cats.join(' · ');
    elTag.hidden = cats.length === 0;
    elTitle.textContent = title;
    elDesc.textContent = desc;
    elGallery.innerHTML = '';
    imgs.forEach(img => {
      const clone = document.createElement('img');
      clone.src = img.currentSrc || img.src;
      clone.alt = img.alt || title;
      if (img.classList.contains('wm-src')) clone.className = 'wm-src';
      if (img.classList.contains('wide-src')) clone.className = 'wide-src';
      elGallery.appendChild(clone);
    });
    const paletteSource = item.querySelector('.palette');
    if (paletteSource) {
      elPaletteSwatches.innerHTML = paletteSource.innerHTML;
      elPalette.hidden = false;
    } else {
      elPaletteSwatches.innerHTML = '';
      elPalette.hidden = true;
    }

    elCount.textContent = `${i + 1} / ${items.length}`;
    page.scrollTop = 0;

    if (!skipTextAnim) {
      gsap.fromTo([elIndex, elTitle, elDesc], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out' });
      gsap.fromTo(elGallery.children, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out', delay: .1 });
    }
  }

  function openProject(i, sourceTile) {
    const tileImg = sourceTile && sourceTile.querySelector('.tile-cover');
    if (hasFlip && tileImg && !reduceMotion) {
      const state = Flip.getState(tileImg);
      renderProject(i, true);
      page.classList.add('open');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        Flip.from(state, {
          targets: elHero, duration: .9, ease: 'power3.inOut', absolute: true,
          onComplete: () => {
            gsap.fromTo([elIndex, elTitle, elDesc], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .08, ease: 'power3.out' });
            gsap.fromTo(elGallery.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, stagger: .06, ease: 'power3.out' });
          }
        });
      });
    } else {
      renderProject(i);
      page.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProject() {
    page.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.swatch')) return;
      openProject(i, item);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(i, item); }
    });
  });

  document.getElementById('projectClose')?.addEventListener('click', closeProject);
  document.getElementById('projectPrev')?.addEventListener('click', () => renderProject((currentProject - 1 + items.length) % items.length));
  document.getElementById('projectNext')?.addEventListener('click', () => renderProject((currentProject + 1) % items.length));
  window.addEventListener('keydown', (e) => {
    if (!page.classList.contains('open')) return;
    if (document.getElementById('lightbox')?.classList.contains('open')) return;
    if (e.key === 'Escape') closeProject();
    if (e.key === 'ArrowRight') renderProject((currentProject + 1) % items.length);
    if (e.key === 'ArrowLeft') renderProject((currentProject - 1 + items.length) % items.length);
  });
} catch (e) {}

/* lightbox — click any gallery/hero image to see it full size, uncropped */
try {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt){
    lightboxImg.classList.remove('errored');
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  lightboxImg.addEventListener('error', () => { lightboxImg.classList.add('errored'); });
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', e => {
    const img = e.target.closest('.project-gallery img, .project-hero img');
    if (!img) return;
    openLightbox(img.currentSrc || img.src, img.alt);
  });
  /* these images are cloned into the DOM per project, so the custom cursor's
     one-time querySelectorAll binding (see the cursor block above) never
     sees them — delegate instead, or the native cursor:zoom-in they rely on
     stays invisible under body.cursor-ready{cursor:none} with no cue at all */
  if (isFinePointer) {
    const ring = document.querySelector('.cursor-ring');
    document.addEventListener('mouseover', e => {
      if (e.target.closest('.project-gallery img, .project-hero img')) ring.classList.add('big');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('.project-gallery img, .project-hero img')) ring.classList.remove('big');
    });
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
} catch (e) {}

/* contact popover — the hero's "Me contacter" button opens a small card
   with every contact channel, instead of jumping straight into a mail client */
try {
  const contactBtn = document.getElementById('heroContactBtn');
  const pop = document.getElementById('contactPop');
  const popLinks = pop.querySelectorAll('a');

  function positionPop(){
    const r = contactBtn.getBoundingClientRect();
    const popWidth = Math.min(300, window.innerWidth - 56);
    let left = r.left;
    if (left + popWidth > window.innerWidth - 16) left = window.innerWidth - popWidth - 16;
    if (left < 16) left = 16;

    const popHeight = pop.offsetHeight || 180;
    const spaceBelow = window.innerHeight - r.bottom;
    let top, origin;
    if (spaceBelow < popHeight + 24 && r.top > popHeight + 24) {
      top = r.top - popHeight - 12;
      origin = 'bottom left';
    } else {
      top = r.bottom + 12;
      origin = 'top left';
    }
    pop.style.setProperty('--pop-left', left + 'px');
    pop.style.setProperty('--pop-top', top + 'px');
    pop.style.setProperty('--pop-origin', origin);
  }
  function openPop(){
    positionPop();
    pop.classList.add('open');
    pop.setAttribute('aria-hidden', 'false');
    contactBtn.setAttribute('aria-expanded', 'true');
    popLinks.forEach(a => a.tabIndex = 0);
  }
  function closePop(){
    pop.classList.remove('open');
    pop.setAttribute('aria-hidden', 'true');
    contactBtn.setAttribute('aria-expanded', 'false');
    popLinks.forEach(a => a.tabIndex = -1);
  }
  contactBtn.addEventListener('click', () => {
    pop.classList.contains('open') ? closePop() : openPop();
  });
  document.addEventListener('click', e => {
    if (!pop.classList.contains('open')) return;
    if (e.target === contactBtn || contactBtn.contains(e.target)) return;
    if (!pop.contains(e.target)) closePop();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pop.classList.contains('open')) { closePop(); contactBtn.focus(); }
  });
  window.addEventListener('resize', () => { if (pop.classList.contains('open')) positionPop(); });
} catch (e) {}

/* legal modal — opened from the footer's "Mentions légales" link */
try {
  const legalBtn = document.getElementById('legalOpenBtn');
  const legalModal = document.getElementById('legalModal');
  const legalClose = document.getElementById('legalCloseBtn');
  function openLegal(){
    legalModal.classList.add('open');
    legalModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLegal(){
    legalModal.classList.remove('open');
    legalModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  legalBtn.addEventListener('click', openLegal);
  legalClose.addEventListener('click', closeLegal);
  legalModal.addEventListener('click', e => { if (e.target === legalModal) closeLegal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && legalModal.classList.contains('open')) closeLegal();
  });
} catch (e) {}


/* magnetic buttons */
try {
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * .3, y: y * .3, duration: .4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'power3.out' });
    });
  });
} catch (e) {}

/* image reveals — opacity + scale tied to scroll position, no slide */
try {
  gsap.utils.toArray('.portrait-frame, .creation-thumb').forEach(box => {
    box.classList.add('reveal-armed');
    box.style.transform = 'scale(1.08)';
    gsap.to(box, {
      opacity: 1, scale: 1, duration: .1, ease: 'none',
      scrollTrigger: { trigger: box, start: 'top 98%', end: 'top 60%', scrub: .5 }
    });
  });
} catch (e) {}

try { ScrollTrigger.refresh(); } catch (e) {}
window.addEventListener('load', () => { try { ScrollTrigger.refresh(); } catch (e) {} });
