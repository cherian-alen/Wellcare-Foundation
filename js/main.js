// (function ($) {
//     "use strict";
    
//     // Dropdown on mouse hover
//     $(document).ready(function () {
//         function toggleNavbarMethod() {
//             if ($(window).width() > 992) {
//                 $('.navbar .dropdown').on('mouseover', function () {
//                     $('.dropdown-toggle', this).trigger('click');
//                 }).on('mouseout', function () {
//                     $('.dropdown-toggle', this).trigger('click').blur();
//                 });
//             } else {
//                 $('.navbar .dropdown').off('mouseover').off('mouseout');
//             }
//         }
//         toggleNavbarMethod();
//         $(window).resize(toggleNavbarMethod);
//     });
    
    
//     // Back to top button
//     $(window).scroll(function () {
//         if ($(this).scrollTop() > 100) {
//             $('.back-to-top').fadeIn('slow');
//         } else {
//             $('.back-to-top').fadeOut('slow');
//         }
//     });
//     $('.back-to-top').click(function () {
//         $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
//         return false;
//     });


//     // Testimonials carousel
//     $(".testimonial-carousel").owlCarousel({
//         autoplay: true,
//         smartSpeed: 1500,
//         dots: true,
//         loop: true,
//         items: 1
//     });
    
// })(jQuery);


(function ($) {
    "use strict";

    // ==========================================
    // 1. LOAD HEADER AND FOOTER COMPONENTS
    // ==========================================

    async function loadComponent(elementId, filePath) {
        try {
            const response = await fetch(filePath);

            if (!response.ok) {
                throw new Error("Failed to load " + filePath);
            }

            const html = await response.text();

            const element = document.getElementById(elementId);

            if (element) {
                element.innerHTML = html;
            }

        } catch (error) {
            console.error("Component loading error:", error);
        }
    }

    async function loadLayout() {

        await Promise.all([
            loadComponent("header", "/components/header.html"),
            loadComponent("footer", "/components/footer.html")
        ]);

        // Highlight the active navigation link
        const currentPage =
            window.location.pathname.split("/").pop() || "index.html";

        $("#header .nav-link").each(function () {
            const link = $(this).attr("href");

            $(this).toggleClass("active", link === currentPage);
        });

        // Initialize dropdown after header is loaded
        toggleNavbarMethod();
    }


    // ==========================================
    // 2. DROPDOWN ON MOUSE HOVER
    // ==========================================

    function toggleNavbarMethod() {

        // Remove previous event handlers
        $('.navbar .dropdown').off('mouseenter mouseleave');

        if ($(window).width() > 992) {

            $('.navbar .dropdown').on('mouseenter', function () {
                $(this).find('.dropdown-toggle')
                    .dropdown('show');
            });

            $('.navbar .dropdown').on('mouseleave', function () {
                $(this).find('.dropdown-toggle')
                    .dropdown('hide');
            });
        }
    }


    // ==========================================
    // 3. BACK TO TOP BUTTON
    // ==========================================

    $(window).scroll(function () {

        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });

    $('.back-to-top').click(function () {

        $('html, body').animate(
            { scrollTop: 0 },
            1500,
            'easeInOutExpo'
        );

        return false;
    });


    // ==========================================
    // 4. TESTIMONIALS CAROUSEL
    // ==========================================

    if ($.fn.owlCarousel) {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            dots: true,
            loop: true,
            items: 1
        });
    }


    // ==========================================
    // 5. DOCUMENT READY
    // ==========================================

    $(document).ready(function () {

        // Load common header and footer
        loadLayout();

        // Handle window resize
        $(window).resize(toggleNavbarMethod);

    });

})(jQuery);

/* ======================================================================
   WELLCARE FOUNDATION — VANILLA JAVASCRIPT
   - Reusable header/footer HTML includes
   - Accessible responsive navigation
   - Sticky header, scroll indicator and back-to-top
   - IntersectionObserver reveal and animated DEMO counters
   - Gallery filters, testimonial carousel, FAQ accordion
   - Front-end-only form feedback (no server requests)
   ====================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reduceMotion.matches ? 'instant' : 'smooth';

  async function loadComponent(root) {
    const path = root.dataset.include;
    if (!path) return false;

    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      root.innerHTML = await response.text();
      return true;
    } catch (error) {
      console.error(`Unable to load ${path}`, error);
      root.innerHTML = '<p class="component-warning" role="alert">Component could not load. Open this website using VS Code Live Server or an HTTP server.</p>';
      return false;
    }
  }

  function initHeader() {
    const header = document.getElementById('site-header-bar');
    if (!header) return;

    const toggle = header.querySelector('.site-header__toggle');
    const menu = header.querySelector('#primary-nav');
    const backdrop = document.querySelector('.mobile-backdrop');
    const mobile = window.matchMedia('(max-width: 1050px)');
    const links = [...menu.querySelectorAll('a[href^="#"]')];

    const setMenuOpen = (open, restoreFocus = false) => {
      const state = Boolean(open && mobile.matches);
      header.classList.toggle('menu-open', state);
      toggle.setAttribute('aria-expanded', String(state));
      toggle.setAttribute('aria-label', state ? 'Close navigation menu' : 'Open navigation menu');
      backdrop.hidden = !state;
      document.body.classList.toggle('menu-lock', state);
      if (state) links[0]?.focus();
      else if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setMenuOpen(!header.classList.contains('menu-open')));
    backdrop.addEventListener('click', () => setMenuOpen(false, true));
    links.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) setMenuOpen(false, true);
    });
    mobile.addEventListener('change', () => setMenuOpen(false));

    // Intersection-based active section state (works without hard-coded page names).
    const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const id = `#${visible[0].target.id}`;
        links.forEach(link => {
          const active = link.getAttribute('href') === id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });
      sections.forEach(section => observer.observe(section));
    }

    // Use one passive scroll listener for sticky styles and progress.
    let pending = false;
    const updateScroll = () => {
      pending = false;
      const top = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      header.classList.toggle('is-scrolled', top > 12);
      document.querySelector('.back-to-top')?.classList.toggle('is-visible', top > 500);
      const progress = document.querySelector('.scroll-progress');
      if (progress) progress.style.width = `${Math.min(100, top / maxScroll * 100)}%`;
    };
    window.addEventListener('scroll', () => {
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(updateScroll);
      }
    }, { passive: true });
    updateScroll();
  }

  function initReveals() {
    const items = [...document.querySelectorAll('.reveal')];
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        current.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    items.forEach(item => observer.observe(item));
  }

  function initCounters() {
    const nodes = [...document.querySelectorAll('[data-counter]')];
    const showFinal = node => { node.textContent = Number(node.dataset.counter).toLocaleString('en-AU'); };

    const animate = node => {
      if (node.dataset.counted) return;
      node.dataset.counted = 'true';
      const target = Number(node.dataset.counter);
      if (!Number.isFinite(target)) return;
      if (reduceMotion.matches) { showFinal(node); return; }
      const duration = 1500;
      const start = performance.now();
      function frame(time) {
        const pct = Math.min(1, (time - start) / duration);
        const eased = 1 - Math.pow(1 - pct, 3);
        node.textContent = Math.round(target * eased).toLocaleString('en-AU');
        if (pct < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };
    if (!('IntersectionObserver' in window)) nodes.forEach(animate);
    else {
      const observer = new IntersectionObserver((entries, current) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { animate(entry.target); current.unobserve(entry.target); }
        });
      }, { threshold: 0.3 });
      nodes.forEach(node => observer.observe(node));
    }
  }

  function initGallery() {
    const filters = document.querySelectorAll('[data-filter]');
    const tiles = document.querySelectorAll('[data-gallery-category]');
    filters.forEach(filter => filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      filters.forEach(button => {
        const active = button === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      tiles.forEach(tile => { tile.hidden = category !== 'all' && tile.dataset.galleryCategory !== category; });
    }));
  }

  function initTestimonials() {
    const track = document.querySelector('[data-testimonial-slider]');
    if (!track) return;
    const card = track.querySelector('.quote-card');
    const shift = direction => {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 18;
      track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: behavior() });
    };
    document.querySelector('[data-slider-prev]')?.addEventListener('click', () => shift(-1));
    document.querySelector('[data-slider-next]')?.addEventListener('click', () => shift(1));
  }

  function initFaq() {
    const details = [...document.querySelectorAll('.faq-item')];
    details.forEach(item => item.addEventListener('toggle', () => {
      if (!item.open) return;
      details.forEach(other => { if (other !== item) other.open = false; });
    }));
  }

  function initForms() {
    const contact = document.getElementById('contact-form');
    contact?.addEventListener('submit', e => {
      e.preventDefault();
      const status = document.getElementById('contact-form-status');
      if (!contact.checkValidity()) {
        status.textContent = 'Please complete all required fields with valid information.';
        contact.reportValidity();
        return;
      }
      status.textContent = 'Demo completed. Your information was NOT submitted or saved. Connect a secure backend to enable enquiries.';
    });

    const newsletter = document.getElementById('newsletter-form');
    newsletter?.addEventListener('submit', e => {
      e.preventDefault();
      const status = document.getElementById('newsletter-status');
      if (!newsletter.checkValidity()) {
        status.textContent = 'Please enter a valid email address.';
        newsletter.reportValidity();
        return;
      }
      status.textContent = 'Demo only — no subscription was created and no email was stored.';
    });
  }

  async function start() {
    const componentRoots = document.querySelectorAll('[data-include]');
    await Promise.all([...componentRoots].map(loadComponent));
    document.getElementById('footer-year')?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));
    initHeader();
    initReveals();
    initCounters();
    initGallery();
    initTestimonials();
    initFaq();
    initForms();
    document.querySelector('.back-to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: behavior() }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
