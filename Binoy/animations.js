/* ================================================================
   ANIMATIONS.JS — Ar. Binoy K. Portfolio Motion Engine
   "The weight of concrete, the precision of a drafted line."
   ================================================================ */

(function () {
    'use strict';

    const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

    /* ============================================================
       UTILITIES
       ============================================================ */

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /** Split element's text content into individually wrapped <span> words */
    function splitIntoWords(el, className) {
        const raw = el.textContent.trim();
        const words = raw.split(/\s+/);
        el.innerHTML = '';
        const spans = [];
        words.forEach(function (word, i) {
            var s = document.createElement('span');
            s.className = className;
            s.textContent = word;
            el.appendChild(s);
            if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
            spans.push(s);
        });
        return spans;
    }

    /** Split testimonial text into sentence-level lines */
    function splitIntoLines(el, className) {
        var text = el.textContent.trim();
        // Split on sentences
        var parts = text.match(/[^.!?]+[.!?]+/g);
        if (!parts) parts = [text];
        el.innerHTML = '';
        var spans = [];
        parts.forEach(function (part, i) {
            var s = document.createElement('span');
            s.className = className;
            s.textContent = part.trim();
            el.appendChild(s);
            if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
            spans.push(s);
        });
        return spans;
    }

    /* ============================================================
       INTERSECTION OBSERVER — 15% from bottom
       ============================================================ */

    var observerOpts = { threshold: 0, rootMargin: '0px 0px -15% 0px' };

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOpts);

    /* ============================================================
       1. HERO SEQUENCE — timed page-load choreography
       ============================================================ */

    function initHeroSequence() {
        var navbar = document.querySelector('[data-anim="navbar-enter"]');
        var heading = document.querySelector('[data-anim="hero-words"]');
        var subtext = document.querySelector('[data-anim="hero-subtext"]');
        var education = document.querySelector('[data-anim="hero-education"]');
        var socials = document.querySelectorAll('[data-anim="hero-social"]');
        var portrait = document.querySelector('[data-anim="portrait-reveal"]');
        var stats = document.querySelectorAll('[data-anim="stat-reveal"]');
        var heroLines = document.querySelectorAll('.hero ~ .stats-bar [data-anim="line-draw"], .stats-bar');

        // Navbar: 200ms
        if (navbar) setTimeout(function () { navbar.classList.add('in-view'); }, 200);

        // Heading words: stagger 100ms starting at 400ms
        var headingEnd = 800;
        if (heading) {
            var words = splitIntoWords(heading, 'hero-word');
            words.forEach(function (w, i) {
                setTimeout(function () { w.classList.add('in-view'); }, 400 + i * 100);
            });
            headingEnd = 400 + words.length * 100 + 700;
        }

        // Subtext: after heading, 600ms delay from load
        if (subtext) {
            var subtextDelay = Math.max(headingEnd, 600);
            setTimeout(function () { subtext.classList.add('in-view'); }, subtextDelay);
        }

        // Education: 800ms
        if (education) setTimeout(function () { education.classList.add('in-view'); }, 800);

        // Social links: 80ms stagger from 900ms
        socials.forEach(function (link, i) {
            setTimeout(function () { link.classList.add('in-view'); }, 900 + i * 80);
        });

        // Portrait: 600ms
        if (portrait) setTimeout(function () { portrait.classList.add('in-view'); }, 600);

        // Stats: 100ms stagger after portrait (~1700ms)
        stats.forEach(function (stat, i) {
            setTimeout(function () { stat.classList.add('in-view'); }, 1700 + i * 100);
        });
    }

    /* ============================================================
       2. CONTACT HERO — heavy serif word-by-word
       ============================================================ */

    function initContactHero() {
        var heading = document.querySelector('[data-anim="contact-words"]');
        if (!heading) return;
        var words = splitIntoWords(heading, 'contact-word');
        words.forEach(function (w, i) {
            setTimeout(function () { w.classList.add('in-view'); }, 400 + i * 80);
        });
    }

    /* ============================================================
       3. SCROLL REVEALS — observe all [data-anim] elements
       ============================================================ */

    function initScrollReveals() {
        // Hero animations are timed, not scroll-triggered
        var heroTypes = [
            'navbar-enter', 'hero-words', 'hero-subtext', 'hero-education',
            'hero-social', 'portrait-reveal', 'stat-reveal', 'contact-words'
        ];

        document.querySelectorAll('[data-anim]').forEach(function (el) {
            if (heroTypes.indexOf(el.dataset.anim) !== -1) return;
            revealObserver.observe(el);
        });

        // Stagger groups — parent with data-stagger, children get delayed
        document.querySelectorAll('[data-stagger]').forEach(function (parent) {
            var ms = parseInt(parent.dataset.stagger) || 80;
            var children = Array.from(parent.children);

            var groupObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        children.forEach(function (child, i) {
                            child.style.transitionDelay = (i * ms) + 'ms';
                            setTimeout(function () { child.classList.add('in-view'); }, i * ms);
                        });
                        groupObs.unobserve(entry.target);
                    }
                });
            }, observerOpts);

            groupObs.observe(parent);
        });
    }

    /* ============================================================
       4. WORK ROWS — stagger + border draw on scroll
       ============================================================ */

    function initWorkRows() {
        var rows = document.querySelectorAll('[data-anim="work-row-reveal"]');
        if (!rows.length) return;

        rows.forEach(function (row, i) {
            row.classList.add('anim-ready');
            row.style.transitionDelay = (i * 80) + 'ms';
        });
    }

    /* ============================================================
       5. COUNTER ANIMATION — counts 0 → target
       ============================================================ */

    function animateCounter(el, target, duration) {
        var start = performance.now();
        function tick(now) {
            var t = Math.min((now - start) / duration, 1);
            var ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
            el.textContent = Math.round(target * ease) + '%';
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    /* ============================================================
       6. PROGRESS BARS — fill width + counter
       ============================================================ */

    function initProgressBars() {
        var bars = document.querySelectorAll('.proficiency-bar-fill');
        if (!bars.length) return;

        var barObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var bar = entry.target;
                var tw = bar.dataset.targetWidth;
                var pct = parseInt(tw);
                var delay = parseInt(bar.dataset.delay || 0);
                var isDrawing = !!bar.closest('.drawing-skills');

                bar.style.width = '0%';
                bar.classList.add('bar-animate');

                setTimeout(function () {
                    bar.style.width = tw;
                    var valEl = bar.closest('.proficiency-item');
                    if (valEl) {
                        valEl = valEl.querySelector('.proficiency-value');
                        if (valEl) animateCounter(valEl, pct, isDrawing ? 1000 : 800);
                    }
                }, delay);

                barObs.unobserve(bar);
            });
        }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

        bars.forEach(function (bar, i) {
            bar.dataset.targetWidth = bar.style.width;
            bar.dataset.delay = (i * 100).toString();
            barObs.observe(bar);
        });
    }

    /* ============================================================
       7. SOFTWARE TILE STAGGER — diagonal 2×4 grid
       ============================================================ */

    function initSoftwareTiles() {
        var tiles = document.querySelectorAll('[data-anim="tile-reveal"]');
        if (!tiles.length) return;

        // Diagonal stagger: delay = (row + col) * 60ms
        // Assuming 4 columns
        var cols = 4;
        tiles.forEach(function (tile, i) {
            var row = Math.floor(i / cols);
            var col = i % cols;
            tile.style.transitionDelay = ((row + col) * 60) + 'ms';
        });
    }

    /* ============================================================
       8. SVG DRAW-ON — stroke-dashoffset animation
       ============================================================ */

    function initSVGDrawOn() {
        var containers = document.querySelectorAll('[data-anim="svg-draw"]');
        containers.forEach(function (container) {
            var elements = container.querySelectorAll('line, rect, path, circle, ellipse, polygon, polyline');
            var speed = parseInt(container.dataset.speed || 2000);
            var stagger = parseInt(container.dataset.stagger || 50);

            elements.forEach(function (el, i) {
                try {
                    var len = el.getTotalLength ? el.getTotalLength() : 1000;
                    el.style.strokeDasharray = len;
                    el.style.strokeDashoffset = len;
                    el.classList.add('svg-draw-path');
                    el.style.transitionDuration = speed + 'ms';
                    el.style.transitionDelay = (i * stagger) + 'ms';
                    el.style.transitionTimingFunction = EASE;
                    el.style.transitionProperty = 'stroke-dashoffset';
                } catch (e) { /* skip text elements etc */ }
            });

            var drawObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.svg-draw-path').forEach(function (p) {
                            p.classList.add('in-view');
                        });
                        drawObs.unobserve(entry.target);
                    }
                });
            }, observerOpts);

            drawObs.observe(container);
        });
    }

    /* ============================================================
       9. TESTIMONIALS — quote mark, line-by-line, author
       ============================================================ */

    function initTestimonials() {
        var quoteText = document.querySelector('.testimonial-text');
        if (!quoteText) return;

        var lines = splitIntoLines(quoteText, 'quote-line');
        var section = quoteText.closest('.section') || quoteText.closest('.testimonial-block');
        if (!section) return;

        var qObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var mark = section.querySelector('[data-anim="quote-mark"]');
                if (mark) setTimeout(function () { mark.classList.add('in-view'); }, 100);

                lines.forEach(function (line, i) {
                    setTimeout(function () { line.classList.add('in-view'); }, 200 + i * 80);
                });

                var author = section.querySelector('[data-anim="author-slide"]');
                if (author) {
                    setTimeout(function () { author.classList.add('in-view'); }, 200 + lines.length * 80 + 200);
                }

                qObs.unobserve(entry.target);
            });
        }, observerOpts);

        qObs.observe(section);
    }

    /* ============================================================
       10. GALLERY — cascade reveal + filter transitions
       ============================================================ */

    function initGallery() {
        // Cascade stagger
        var items = document.querySelectorAll('[data-anim="gallery-cascade"]');
        if (!items.length) return;

        // Compute grid cascade: left→right, top→bottom
        var cols = 3; // desktop grid
        items.forEach(function (item, i) {
            var row = Math.floor(i / cols);
            var col = i % cols;
            item.style.transitionDelay = ((row * cols + col) * 60) + 'ms';
        });

        // Filter buttons
        var btns = document.querySelectorAll('.gallery-filter-btn');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                btns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');

                var filter = btn.textContent.trim().toLowerCase();
                var allItems = document.querySelectorAll('.gallery-item');
                var delay = 0;

                allItems.forEach(function (item) {
                    var label = item.querySelector('.gallery-item-label');
                    var cat = label ? label.textContent.toLowerCase() : '';

                    if (filter === 'all' || cat.indexOf(filter) !== -1) {
                        item.classList.remove('filter-out');
                        item.style.transitionDelay = (delay * 60) + 'ms';
                        item.classList.add('filter-in');
                        delay++;
                    } else {
                        item.classList.remove('filter-in');
                        item.classList.add('filter-out');
                    }
                });
            });
        });
    }

    /* ============================================================
       11. PHOTO CAROUSEL — crossfade with directional slide
       ============================================================ */

    function initPhotoCarousel() {
        var mainPhoto = document.getElementById('mainPhoto');
        var thumbStrip = document.getElementById('thumbStrip');
        var indexEl = document.getElementById('photoIndex');
        var overlay = document.getElementById('photoOverlay');

        if (!mainPhoto || !thumbStrip) return;

        var thumbs = thumbStrip.querySelectorAll('.thumb-item');
        var images = [];
        thumbs.forEach(function (t) {
            var img = t.querySelector('img');
            if (img) images.push(img.src);
        });

        var current = 0;

        // Photo overlay wipe reveal on load
        if (overlay) {
            setTimeout(function () { overlay.classList.add('revealed'); }, 800);
        }

        function goTo(idx) {
            if (idx === current || idx < 0 || idx >= images.length) return;
            var dir = idx > current ? 1 : -1;

            // Slide out
            mainPhoto.style.opacity = '0';
            mainPhoto.style.transform = 'translateX(' + (-30 * dir) + 'px)';

            setTimeout(function () {
                mainPhoto.src = images[idx];
                mainPhoto.style.transform = 'translateX(' + (30 * dir) + 'px)';

                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        mainPhoto.style.opacity = '1';
                        mainPhoto.style.transform = 'translateX(0)';
                    });
                });
            }, 200);

            thumbs.forEach(function (t) { t.classList.remove('active'); });
            thumbs[idx].classList.add('active');
            if (indexEl) indexEl.textContent = String(idx + 1).padStart(2, '0');
            current = idx;
        }

        var prev = document.querySelector('.photo-nav.prev');
        var next = document.querySelector('.photo-nav.next');
        if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
        if (next) next.addEventListener('click', function () { goTo(current + 1); });

        thumbs.forEach(function (t, i) {
            t.addEventListener('click', function () { goTo(i); });
        });
    }

    /* ============================================================
       12. PROJECT DETAIL — title halves, metadata, thumbs
       ============================================================ */

    function initProjectDetail() {
        var tl = document.querySelector('.title-half-left');
        var tr = document.querySelector('.title-half-right');
        if (tl && tr) {
            setTimeout(function () {
                tl.classList.add('in-view');
                tr.classList.add('in-view');
            }, 600);
        }

        // Thumbnail stagger
        var thumbs = document.querySelectorAll('[data-anim="thumb-slide"]');
        thumbs.forEach(function (t, i) { t.style.transitionDelay = (i * 80) + 'ms'; });

        // Metadata row stagger
        var meta = document.querySelectorAll('[data-anim="meta-row"]');
        meta.forEach(function (m, i) { m.style.transitionDelay = (i * 60) + 'ms'; });
    }

    /* ============================================================
       13. TIMELINE — line draw → node pop → content fade
       ============================================================ */

    function initTimeline() {
        var line = document.querySelector('[data-anim="timeline-draw"]');
        var steps = document.querySelectorAll('.timeline-step');
        if (!line || !steps.length) return;

        // Set initial hidden state for step internals
        steps.forEach(function (step) {
            var node = step.querySelector('.step-node');
            var parts = step.querySelectorAll('.step-number, .step-title, .step-desc');
            if (node) {
                node.setAttribute('data-anim', 'step-node');
                node.style.transform = 'scale(0)';
            }
            parts.forEach(function (p) {
                p.classList.add('step-content-anim');
            });
        });

        var tObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                // 1. Draw line
                line.classList.add('in-view');

                // 2. Pop nodes after line (1000ms)
                steps.forEach(function (step, i) {
                    var node = step.querySelector('[data-anim="step-node"]');
                    var parts = step.querySelectorAll('.step-content-anim');

                    setTimeout(function () {
                        if (node) node.classList.add('in-view');
                        // Content after node
                        parts.forEach(function (p, j) {
                            setTimeout(function () { p.classList.add('in-view'); }, 60 * (j + 1));
                        });
                    }, 1000 + i * 80);
                });

                tObs.unobserve(entry.target);
            });
        }, observerOpts);

        tObs.observe(line.closest('.timeline-wrapper') || line.parentElement);
    }

    /* ============================================================
       14. SERVICES GRID — cell content fade-up with stagger
       ============================================================ */

    function initServicesGrid() {
        var grid = document.querySelector('.services-grid');
        if (!grid) return;

        var cells = grid.querySelectorAll('.service-cell');

        var gObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                cells.forEach(function (cell, i) {
                    var parts = cell.querySelectorAll('.service-number, .service-title, .service-desc');
                    parts.forEach(function (el) {
                        el.classList.add('service-content-anim');
                    });
                    setTimeout(function () {
                        parts.forEach(function (el, j) {
                            setTimeout(function () { el.classList.add('in-view'); }, j * 40);
                        });
                    }, 400 + i * 60);
                });

                gObs.unobserve(entry.target);
            });
        }, observerOpts);

        gObs.observe(grid);
    }

    /* ============================================================
       15. CONTACT FORM — submit state machine
       ============================================================ */

    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('.submit-btn');
            if (!btn || btn.classList.contains('sending') || btn.classList.contains('sent')) return;

            btn.classList.add('sending');
            btn.disabled = true;

            setTimeout(function () {
                btn.classList.remove('sending');
                btn.classList.add('sent');

                setTimeout(function () {
                    btn.classList.remove('sent');
                    btn.disabled = false;
                    form.reset();
                }, 3000);
            }, 2000);
        });
    }

    /* ============================================================
       16. NAVBAR — scroll-reactive background
       ============================================================ */

    function initNavbar() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;

        var onScroll = function () {
            if (window.scrollY > 80) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // initial check
    }

    /* ============================================================
       17. CUSTOM CURSOR
       ============================================================ */

    function initCustomCursor() {
        // Skip touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
        if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

        var cursor = document.createElement('div');
        cursor.className = 'custom-cursor';

        var label = document.createElement('span');
        label.className = 'cursor-label';
        cursor.appendChild(label);

        var icon = document.createElement('span');
        icon.className = 'cursor-icon';
        cursor.appendChild(icon);

        document.body.appendChild(cursor);
        document.body.classList.add('has-custom-cursor');

        var mx = 0, my = 0, cx = 0, cy = 0;

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
        });

        function tick() {
            cx = lerp(cx, mx, 0.15);
            cy = lerp(cy, my, 0.15);
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // Hover state management
        document.addEventListener('mouseover', function (e) {
            var t = e.target;

            // Gallery items / work rows → "VIEW"
            if (t.closest('.gallery-item') || t.closest('.work-row')) {
                cursor.className = 'custom-cursor text-cursor';
                label.textContent = 'VIEW';
                icon.textContent = '';
                return;
            }
            // Portrait photo → camera
            if (t.closest('.hero-image-wrapper')) {
                cursor.className = 'custom-cursor icon-cursor';
                label.textContent = '';
                icon.textContent = '📷';
                return;
            }
            // Links / buttons → expanded ring
            if (t.closest('a') || t.closest('button') || t.closest('.photo-nav')) {
                cursor.className = 'custom-cursor expanded';
                label.textContent = '';
                icon.textContent = '';
                return;
            }
        });

        document.addEventListener('mouseout', function (e) {
            var t = e.target;
            if (t.closest('.gallery-item') || t.closest('.work-row') ||
                t.closest('.hero-image-wrapper') || t.closest('a') ||
                t.closest('button') || t.closest('.photo-nav')) {
                cursor.className = 'custom-cursor';
                label.textContent = '';
                icon.textContent = '';
            }
        });
    }

    /* ============================================================
       18. PAGE TRANSITIONS — cream overlay wipe
       ============================================================ */

    function initPageTransitions() {
        var overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay hidden';
        document.body.appendChild(overlay);

        function clearOverlay() {
            overlay.className = 'page-transition-overlay hidden';
            overlay.style.transform = '';
            overlay.style.animation = '';
        }

        // On load: if arriving from transition, wipe out
        if (sessionStorage.getItem('binoy-transition') === '1') {
            sessionStorage.removeItem('binoy-transition');

            // Start with overlay covering the page (no .hidden = no translateX(-101%))
            overlay.className = 'page-transition-overlay';

            // Double-rAF ensures the browser has painted the covering state
            // before we trigger the wipe-out animation
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    overlay.classList.add('wipe-out');
                    overlay.addEventListener('animationend', clearOverlay, { once: true });

                    // FALLBACK: if animationend never fires, force-clear after 800ms
                    setTimeout(clearOverlay, 800);
                });
            });
        }

        // Intercept internal navigation
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (!href || href === '#' || href.startsWith('#') ||
                href.startsWith('http') || href.startsWith('mailto') ||
                href.startsWith('tel') || href.startsWith('javascript')) return;

            e.preventDefault();
            sessionStorage.setItem('binoy-transition', '1');

            // Reset overlay to hidden position, then animate in
            overlay.className = 'page-transition-overlay hidden';
            overlay.style.transform = '';

            // Force a reflow so the browser paints the hidden state
            void overlay.offsetWidth;

            overlay.className = 'page-transition-overlay';
            overlay.classList.add('wipe-in');
            overlay.addEventListener('animationend', function () {
                window.location.href = href;
            }, { once: true });

            // FALLBACK: navigate even if animation fails
            setTimeout(function () {
                window.location.href = href;
            }, 600);
        });
    }

    /* ============================================================
       19. CONTACT BLOCKS STAGGER
       ============================================================ */

    function initContactBlocks() {
        var blocks = document.querySelectorAll('[data-anim="contact-block"]');
        blocks.forEach(function (b, i) {
            b.style.transitionDelay = (i * 80) + 'ms';
        });
    }

    /* ============================================================
       20. SAFETY NET — ensure content always becomes visible
       ============================================================ */

    function initSafetyNet() {
        // After 2.5 seconds, force all hidden animated elements to be visible.
        // This catches any edge case where IntersectionObserver, hero sequence,
        // or page transitions fail to trigger reveals.
        setTimeout(function () {
            document.querySelectorAll('[data-anim]:not(.in-view)').forEach(function (el) {
                el.classList.add('in-view');
            });
            document.querySelectorAll('.hero-word:not(.in-view), .contact-word:not(.in-view), .quote-line:not(.in-view)').forEach(function (el) {
                el.classList.add('in-view');
            });
            document.querySelectorAll('.step-content-anim:not(.in-view)').forEach(function (el) {
                el.classList.add('in-view');
            });
            document.querySelectorAll('.service-content-anim:not(.in-view)').forEach(function (el) {
                el.classList.add('in-view');
            });
            document.querySelectorAll('.svg-draw-path:not(.in-view)').forEach(function (el) {
                el.classList.add('in-view');
            });
            // Make sure the overlay is gone too
            var ov = document.querySelector('.page-transition-overlay');
            if (ov && !ov.classList.contains('hidden')) {
                ov.className = 'page-transition-overlay hidden';
                ov.style.transform = '';
            }
        }, 2500);
    }

    /* ============================================================
       INITIALIZATION — DOMContentLoaded
       ============================================================ */

    document.addEventListener('DOMContentLoaded', function () {
        initNavbar();
        initHeroSequence();
        initContactHero();
        initScrollReveals();
        initWorkRows();
        initProgressBars();
        initSoftwareTiles();
        initSVGDrawOn();
        initTestimonials();
        initGallery();
        initPhotoCarousel();
        initProjectDetail();
        initTimeline();
        initServicesGrid();
        initContactForm();
        initContactBlocks();
        initCustomCursor();
        initPageTransitions();
        initSafetyNet();
    });

})();
