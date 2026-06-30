/* ============================================================
   Zarynth Blazze portfolio — interactions
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Theme toggle (persistent) ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  const savedTheme = localStorage.getItem('zb-theme');
  if (savedTheme === 'light') {
    root.classList.remove('dark');
  } else if (savedTheme === 'dark') {
    root.classList.add('dark');
  }
  // default: dark (already on <html>)

  themeToggle?.addEventListener('click', () => {
    root.classList.toggle('dark');
    const isDark = root.classList.contains('dark');
    localStorage.setItem('zb-theme', isDark ? 'dark' : 'light');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0E0D12' : '#F7F3EE');
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  menuBtn?.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  mobileMenu?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileMenu.classList.add('hidden'))
  );

  /* ---------- Lenis smooth scroll ---------- */
  let lenis;
  if (window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // anchor links → use lenis if available
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.3 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Nav shrink on scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- GSAP reveal + parallax ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // sync ScrollTrigger with lenis
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // reveal-on-scroll
    gsap.utils.toArray('.reveal').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        delay: (i % 4) * 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      });
    });

    // staggered hero cards
    gsap.from('.hero-card', {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.4,
    });

    // hero headline letters subtle stagger
    const heroTitle = document.querySelector('h1');
    if (heroTitle) {
      const spans = heroTitle.querySelectorAll('span');
      gsap.from(spans, {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.15,
      });
    }

    // tier hover scale handled by CSS; small reveal
    gsap.from('.tier', {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: '#commissions',
        start: 'top 70%',
      },
    });
  } else {
    // fallback if GSAP fails
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ---------- 3D tilt cards ---------- */
  const isFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (isFinePointer) {
    document.querySelectorAll('.art-card.tilt').forEach(card => {
      const damp = 12;
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateX(${-y * damp}deg) rotateY(${x * damp}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lightbox-image');
  const lbTitle = document.getElementById('lightbox-title');
  const lbTag = document.getElementById('lightbox-tag');
  const lbClose = document.getElementById('lightbox-close');

  const openLightbox = (card) => {
    const bg = card.querySelector('.art-bg');
    if (!bg) return;

    if (bg.tagName === 'IMG') {
      lbImage.src = bg.currentSrc || bg.src;
      lbImage.alt = bg.alt || card.dataset.title || '';
    } else {
      // gradient placeholder fallback — render as transparent pixel + show caption
      lbImage.removeAttribute('src');
      lbImage.alt = card.dataset.title || '';
    }

    lbTitle.textContent = card.dataset.title || '';
    lbTag.textContent = card.dataset.tag || '';
    lightbox.classList.add('is-open');
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  };

  document.querySelectorAll('.art-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
  });
  lbClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  /* ---------- Cursor-follow accent on hero ---------- */
  if (isFinePointer) {
    const orbs = document.querySelectorAll('.orb');
    let mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    });
    function loop() {
      tx += (mx - tx) * 0.04;
      ty += (my - ty) * 0.04;
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 18;
        orb.style.translate = `${tx * depth}px ${ty * depth}px`;
      });
      requestAnimationFrame(loop);
    }
    loop();
  }
})();
