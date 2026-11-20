
/**
 * ============================================================
 * WELLCARE FOUNDATION — MAIN JAVASCRIPT
 * ============================================================
 *
 * Features:
 * 01. Reusable header and footer components
 * 02. Active navigation links
 * 03. Responsive mobile navigation
 * 04. Bootstrap-compatible dropdown navigation
 * 05. Sticky header
 * 06. Scroll progress indicator
 * 07. Back-to-top button
 * 08. Smooth scrolling
 * 09. Scroll reveal animations
 * 10. Animated statistics counters
 * 11. Gallery filtering
 * 12. Testimonial carousel
 * 13. FAQ accordion
 * 14. Contact and newsletter form validation
 * 15. Automatic copyright year
 *
 * Dependencies:
 * - Vanilla JavaScript (required)
 * - Bootstrap JavaScript (optional for dropdowns)
 * - jQuery and Owl Carousel (optional for legacy carousel)
 *
 * ============================================================
 */

(() => {
    "use strict";

    /* ========================================================
       01. GLOBAL CONFIGURATION
    ======================================================== */

    const CONFIG = {
        mobileBreakpoint: 1050,
        scrollThreshold: 100,
        backToTopThreshold: 500,
        animationDuration: 1500
    };

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const scrollBehavior = () =>
        prefersReducedMotion.matches ? "auto" : "smooth";

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    /* ========================================================
       02. LOAD REUSABLE HTML COMPONENTS
    ======================================================== */

    async function loadComponent(element) {
        const filePath = element.dataset.include;

        if (!filePath) {
            return false;
        }

        try {
            const response = await fetch(filePath, {
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to load ${filePath}: ${response.status}`
                );
            }

            const html = await response.text();

            element.innerHTML = html;

            return true;

        } catch (error) {
            console.error("Component loading error:", error);

            element.innerHTML = `
                <p class="component-warning" role="alert">
                    Unable to load website component.
                    Please run the website using a local server.
                </p>
            `;

            return false;
        }
    }

    // async function loadLayout() {
    //     const components = $$("[data-include]");

    //     // Support the original header/footer IDs when data-include
    //     // is not already configured in the HTML.
    //     const fallbackComponents = [
    //         {
    //             id: "header",
    //             path: "components/header.html"
    //         },
    //         {
    //             id: "footer",
    //             path: "components/footer.html"
    //         }
    //     ];

    //     fallbackComponents.forEach(component => {
    //         const element = document.getElementById(component.id);

    //         if (
    //             element &&
    //             !element.dataset.include &&
    //             !element.innerHTML.trim()
    //         ) {
    //             element.dataset.include = component.path;
    //             components.push(element);
    //         }
    //     });

    //     await Promise.all(
    //         components.map(component => loadComponent(component))
    //     );

    //     // Initialize navigation only after header is loaded.
    //     initActiveNavigation();
    //     initMobileNavigation();
    //     initDropdownNavigation();

    //     // Footer content may have been loaded dynamically.
    //     initCopyrightYear();
    // }


async function loadLayout() {
    // 1. Find components already configured in HTML.
    const components = [...document.querySelectorAll("[data-include]")];

    // 2. Support reusable header/footer placeholders.
    const fallbackComponents = [
        {
            id: "header",
            path: "components/header.html"
        },
        {
            id: "footer",
            path: "components/footer.html"
        }
    ];

    fallbackComponents.forEach(({ id, path }) => {
        const element = document.getElementById(id);

        if (!element) return;

        // Do not overwrite existing component paths.
        if (!element.dataset.include && !element.innerHTML.trim()) {
            element.dataset.include = path;
        }

        // Avoid loading an element twice.
        if (element.dataset.include && !components.includes(element)) {
            components.push(element);
        }
    });

    // 3. Load components before initializing their functionality.
    await Promise.all(
        components.map(component => loadComponent(component))
    );

    // 4. Initialize header features after the header is present.
    initActiveNavigation();
    initMobileNavigation();
    initDropdownNavigation();

    // 5. Update dynamic footer content.
    initCopyrightYear();
}


    /* ========================================================
       03. ACTIVE NAVIGATION LINKS
    ======================================================== */

    function initActiveNavigation() {
        const currentPage =
            window.location.pathname.split("/").pop() || "index.html";

        const links = $$(
            ".navbar .nav-link, .main-menu-3 a"
        );

        links.forEach(link => {
            const href = link.getAttribute("href");

            if (!href) return;

            const url = new URL(href, window.location.href);

            const linkPage =
                url.pathname.split("/").pop() || "index.html";

            const isSamePage =
                url.origin === window.location.origin &&
                linkPage === currentPage;

            // Only mark page links, not every section anchor.
            const isActive =
                isSamePage && !url.hash;

            link.classList.toggle("active", isActive);
            link.classList.toggle("is-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        initSectionNavigation();
    }

    /* ========================================================
       04. ACTIVE SECTION NAVIGATION
    ======================================================== */

    function initSectionNavigation() {
        const navigationLinks = $$(
            '.main-menu-3 a[href^="#"]'
        );

        if (!navigationLinks.length) return;

        const sections = navigationLinks
            .map(link => {
                const id = link.getAttribute("href");

                if (!id || id === "#") return null;

                return document.getElementById(id.slice(1));
            })
            .filter(Boolean);

        if (!sections.length) return;

        if (!("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(
            entries => {
                const visibleSections = entries
                    .filter(entry => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            b.intersectionRatio -
                            a.intersectionRatio
                    );

                if (!visibleSections.length) return;

                const activeId =
                    `#${visibleSections[0].target.id}`;

                navigationLinks.forEach(link => {
                    const active =
                        link.getAttribute("href") === activeId;

                    link.classList.toggle("is-active", active);

                    if (active) {
                        link.setAttribute(
                            "aria-current",
                            "location"
                        );
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            },
            {
                rootMargin: "-25% 0px -55% 0px",
                threshold: 0
            }
        );

        sections.forEach(section => observer.observe(section));
    }

    /* ========================================================
       05. MOBILE NAVIGATION
    ======================================================== */

    // function initMobileNavigation() {
    //     const header = $("#site-header-bar");

    //     if (!header) return;

    //     const toggle = $(".site-header__toggle", header);
    //     const menu = $("#primary-nav", header);
    //     const backdrop = $(".mobile-backdrop");

    //     if (!toggle || !menu) return;

    //     const mobileQuery = window.matchMedia(
    //         `(max-width: ${CONFIG.mobileBreakpoint}px)`
    //     );

    //     const setMenuOpen = (open, restoreFocus = false) => {
    //         const shouldOpen =
    //             Boolean(open && mobileQuery.matches);

    //         header.classList.toggle(
    //             "menu-open",
    //             shouldOpen
    //         );

    //         toggle.setAttribute(
    //             "aria-expanded",
    //             String(shouldOpen)
    //         );

    //         toggle.setAttribute(
    //             "aria-label",
    //             shouldOpen
    //                 ? "Close navigation menu"
    //                 : "Open navigation menu"
    //         );

    //         document.body.classList.toggle(
    //             "menu-lock",
    //             shouldOpen
    //         );

    //         if (backdrop) {
    //             backdrop.hidden = !shouldOpen;
    //         }

    //         if (shouldOpen) {
    //             $("a", menu)?.focus();
    //         } else if (restoreFocus) {
    //             toggle.focus();
    //         }
    //     };

    //     toggle.addEventListener("click", () => {
    //         setMenuOpen(
    //             !header.classList.contains("menu-open")
    //         );
    //     });

    //     backdrop?.addEventListener("click", () => {
    //         setMenuOpen(false, true);
    //     });

    //     $$("a", menu).forEach(link => {
    //         link.addEventListener("click", () => {
    //             setMenuOpen(false);
    //         });
    //     });

    //     window.addEventListener("keydown", event => {
    //         if (
    //             event.key === "Escape" &&
    //             header.classList.contains("menu-open")
    //         ) {
    //             setMenuOpen(false, true);
    //         }
    //     });

    //     mobileQuery.addEventListener("change", () => {
    //         setMenuOpen(false);
    //     });
    // }


function initMobileNavigation() {
    const header = document.getElementById("site-header-bar");

    if (!header) return;

    const toggle = header.querySelector(".site-header__toggle");
    const menu = header.querySelector("#primary-nav");
    const backdrop = document.querySelector(".mobile-backdrop");

    if (!toggle || !menu) {
        console.warn("Mobile navigation toggle or menu not found.");
        return;
    }

    const mobileQuery = window.matchMedia(
        `(max-width: ${CONFIG.mobileBreakpoint}px)`
    );

    // Prevent duplicate initialization.
    if (toggle.dataset.initialized === "true") return;
    toggle.dataset.initialized = "true";

    function setMenuOpen(open, restoreFocus = false) {
        const shouldOpen = Boolean(open && mobileQuery.matches);

        header.classList.toggle("menu-open", shouldOpen);
        document.body.classList.toggle("menu-lock", shouldOpen);

        toggle.setAttribute("aria-expanded", String(shouldOpen));
        toggle.setAttribute(
            "aria-label",
            shouldOpen ? "Close navigation menu" : "Open navigation menu"
        );

        if (backdrop) {
            backdrop.hidden = !shouldOpen;
        }

        // Keep navigation accessible on desktop and
        // unavailable to keyboard focus while closed on mobile.
        menu.inert = mobileQuery.matches && !shouldOpen;

        if (shouldOpen) {
            menu.querySelector("a")?.focus();
        } else if (restoreFocus) {
            toggle.focus();
        }
    }

    // Open/close when clicking the toggle.
    toggle.addEventListener("click", () => {
        const isOpen = header.classList.contains("menu-open");
        setMenuOpen(!isOpen);
    });

    // Close when clicking outside the menu.
    backdrop?.addEventListener("click", () => {
        setMenuOpen(false, true);
    });

    // Close when clicking a navigation link.
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });

    // Close using the Escape key.
    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            header.classList.contains("menu-open")
        ) {
            setMenuOpen(false, true);
        }
    });

    // Close when switching between desktop and mobile layouts.
    mobileQuery.addEventListener("change", () => {
        setMenuOpen(false);
    });

    // Initialize the closed/open state correctly.
    setMenuOpen(false);
}


    /* ========================================================
       06. BOOTSTRAP DROPDOWN NAVIGATION
    ======================================================== */

    function initDropdownNavigation() {
        const dropdowns = $$(".navbar .dropdown");

        if (!dropdowns.length) return;

        const desktopQuery = window.matchMedia(
            "(min-width: 993px)"
        );

        dropdowns.forEach(dropdown => {
            const toggle = $(".dropdown-toggle", dropdown);

            if (!toggle) return;

            if (
                !window.bootstrap ||
                !window.bootstrap.Dropdown
            ) {
                return;
            }

            const instance =
                window.bootstrap.Dropdown.getOrCreateInstance(
                    toggle
                );

            dropdown.addEventListener("mouseenter", () => {
                if (desktopQuery.matches) {
                    instance.show();
                }
            });

            dropdown.addEventListener("mouseleave", () => {
                if (desktopQuery.matches) {
                    instance.hide();
                }
            });
        });
    }

    /* ========================================================
       07. STICKY HEADER AND SCROLL PROGRESS
    ======================================================== */

    function initScrollEffects() {
        const header =
            $("#site-header-bar") ||
            $(".site-header");

        const progress = $(".scroll-progress");

        const backToTop =
            $(".back-to-top") ||
            $(".scroll-top");

        let scrollPending = false;

        function updateScroll() {
            scrollPending = false;

            const scrollTop = window.scrollY;

            const documentHeight =
                document.documentElement.scrollHeight -
                window.innerHeight;

            const scrollPercentage =
                documentHeight > 0
                    ? (scrollTop / documentHeight) * 100
                    : 0;

            if (header) {
                header.classList.toggle(
                    "is-scrolled",
                    scrollTop > CONFIG.scrollThreshold
                );
            }

            if (progress) {
                progress.style.width =
                    `${Math.min(100, Math.max(0, scrollPercentage))}%`;
            }

            if (backToTop) {
                const visible =
                    scrollTop > CONFIG.backToTopThreshold;

                backToTop.classList.toggle(
                    "is-visible",
                    visible
                );

                backToTop.style.display =
                    visible ? "flex" : "none";
            }
        }

        window.addEventListener(
            "scroll",
            () => {
                if (!scrollPending) {
                    scrollPending = true;

                    requestAnimationFrame(updateScroll);
                }
            },
            { passive: true }
        );

        window.addEventListener(
            "resize",
            updateScroll,
            { passive: true }
        );

        updateScroll();

        if (backToTop) {
            backToTop.addEventListener("click", event => {
                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: scrollBehavior()
                });
            });
        }
    }

    /* ========================================================
       08. SMOOTH SCROLLING
    ======================================================== */

    function initSmoothScrolling() {
        document.addEventListener("click", event => {
            const link = event.target.closest(
                'a[href^="#"]'
            );

            if (!link) return;

            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const target = document.getElementById(
                href.slice(1)
            );

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: scrollBehavior(),
                block: "start"
            });

            history.pushState(null, "", href);
        });
    }

    /* ========================================================
       09. SCROLL REVEAL ANIMATIONS
    ======================================================== */

    function initRevealAnimations() {
        const elements = $$(".reveal");

        if (!elements.length) return;

        if (
            prefersReducedMotion.matches ||
            !("IntersectionObserver" in window)
        ) {
            elements.forEach(element => {
                element.classList.add("is-visible");
            });

            return;
        }

        document.documentElement.classList.add(
            "js-motion"
        );

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add(
                        "is-visible"
                    );

                    currentObserver.unobserve(
                        entry.target
                    );
                });
            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        elements.forEach(element => {
            observer.observe(element);
        });
    }

    /* ========================================================
       10. ANIMATED STATISTICS COUNTERS
    ======================================================== */

    function initCounters() {
        const counters = $$("[data-counter]");

        if (!counters.length) return;

        function animateCounter(element) {
            if (element.dataset.counted === "true") {
                return;
            }

            const target = Number(
                element.dataset.counter
            );

            if (!Number.isFinite(target)) return;

            element.dataset.counted = "true";

            const formatNumber = value =>
                Math.round(value).toLocaleString("en-AU");

            if (prefersReducedMotion.matches) {
                element.textContent = formatNumber(target);
                return;
            }

            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed =
                    currentTime - startTime;

                const progress = Math.min(
                    elapsed / CONFIG.animationDuration,
                    1
                );

                const easing =
                    1 - Math.pow(1 - progress, 3);

                const currentValue =
                    target * easing;

                element.textContent =
                    formatNumber(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(
                        updateCounter
                    );
                }
            }

            requestAnimationFrame(updateCounter);
        }

        if (!("IntersectionObserver" in window)) {
            counters.forEach(animateCounter);
            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    animateCounter(entry.target);

                    currentObserver.unobserve(
                        entry.target
                    );
                });
            },
            { threshold: 0.3 }
        );

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    /* ========================================================
       11. GALLERY FILTERING
    ======================================================== */

    function initGallery() {
        const filters = $$("[data-filter]");
        const galleryItems = $$(
            "[data-gallery-category]"
        );

        if (!filters.length) return;

        filters.forEach(filter => {
            filter.addEventListener("click", () => {
                const category =
                    filter.dataset.filter;

                filters.forEach(button => {
                    const active =
                        button === filter;

                    button.classList.toggle(
                        "is-active",
                        active
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );
                });

                galleryItems.forEach(item => {
                    const itemCategory =
                        item.dataset.galleryCategory;

                    item.hidden =
                        category !== "all" &&
                        itemCategory !== category;
                });
            });
        });
    }

    /* ========================================================
       12. TESTIMONIAL CAROUSEL
    ======================================================== */

    function initTestimonials() {
        const modernTrack = $(
            "[data-testimonial-slider]"
        );

        if (modernTrack) {
            const previousButton = $(
                "[data-slider-prev]"
            );

            const nextButton = $(
                "[data-slider-next]"
            );

            function moveSlider(direction) {
                const card = $(
                    ".quote-card",
                    modernTrack
                );

                if (!card) return;

                const gap =
                    parseFloat(
                        getComputedStyle(
                            modernTrack
                        ).columnGap
                    ) || 18;

                const distance =
                    card.getBoundingClientRect().width +
                    gap;

                modernTrack.scrollBy({
                    left: direction * distance,
                    behavior: scrollBehavior()
                });
            }

            previousButton?.addEventListener(
                "click",
                () => moveSlider(-1)
            );

            nextButton?.addEventListener(
                "click",
                () => moveSlider(1)
            );
        }

        // Legacy Owl Carousel support.
        if (
            window.jQuery &&
            typeof window.jQuery.fn.owlCarousel ===
            "function"
        ) {
            const $carousel = window.jQuery(
                ".testimonial-carousel"
            );

            if ($carousel.length) {
                $carousel.owlCarousel({
                    autoplay:
                        !prefersReducedMotion.matches,
                    autoplayHoverPause: true,
                    smartSpeed: 800,
                    dots: true,
                    loop: true,
                    items: 1
                });
            }
        }
    }

    /* ========================================================
       13. FAQ ACCORDION
    ======================================================== */

    function initFAQ() {
        const faqItems = $$(".faq-item");

        faqItems.forEach(item => {
            // Native <details> FAQ items.
            if (item.tagName !== "DETAILS") {
                return;
            }

            item.addEventListener("toggle", () => {
                if (!item.open) return;

                faqItems.forEach(other => {
                    if (
                        other !== item &&
                        other.tagName === "DETAILS"
                    ) {
                        other.open = false;
                    }
                });
            });
        });
    }

    /* ========================================================
       14. CONTACT FORM
    ======================================================== */

    function initContactForm() {
        const form = $("#contact-form");

        if (!form) return;

        const status = $(
            "#contact-form-status"
        );

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.checkValidity()) {
                if (status) {
                    status.textContent =
                        "Please complete all required fields.";
                }

                form.reportValidity();
                return;
            }

            if (status) {
                status.textContent =
                    "Demo completed. Your message was not sent. " +
                    "Connect a secure backend to enable enquiries.";
            }
        });
    }

    /* ========================================================
       15. NEWSLETTER FORM
    ======================================================== */

    function initNewsletterForm() {
        const form = $("#newsletter-form");

        if (!form) return;

        const status = $("#newsletter-status");

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.checkValidity()) {
                if (status) {
                    status.textContent =
                        "Please enter a valid email address.";
                }

                form.reportValidity();
                return;
            }

            if (status) {
                status.textContent =
                    "Demo only. No subscription was created.";
            }
        });
    }

    /* ========================================================
       16. AUTOMATIC COPYRIGHT YEAR
    ======================================================== */

    function initCopyrightYear() {
        const yearElement = $("#footer-year");

        if (yearElement) {
            yearElement.textContent =
                new Date().getFullYear();
        }
    }

    /* ========================================================
       17. INITIALIZE WEBSITE
    ======================================================== */

    async function initializeWebsite() {
        // Load shared components first.
        await loadLayout();

        // Initialize website functions.
        initScrollEffects();
        initSmoothScrolling();
        initRevealAnimations();
        initCounters();
        initGallery();
        initTestimonials();
        initFAQ();
        initContactForm();
        initNewsletterForm();

        console.info(
            "Wellcare Foundation website initialized."
        );
    }

    /* ========================================================
       18. DOCUMENT READY
    ======================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeWebsite,
            { once: true }
        );
    } else {
        initializeWebsite();
    }

    const form = document.querySelector("#contact-form");

    console.log({
        formFound: !!form,
        numberOfForms: document.querySelectorAll("#contact-form").length,
        classes: form?.className,
        display: form ? getComputedStyle(form).display : null,
        opacity: form ? getComputedStyle(form).opacity : null,
        visibility: form ? getComputedStyle(form).visibility : null,
        width: form?.getBoundingClientRect().width
    });

})();
