document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealSelector = [
        '.hero-copy > *',
        '.hero-panel > *',
        '.section-heading',
        '.feature-card',
        '.cta-box',
        '.auth-layout',
        '.dashboard-intro',
        '.account-hero',
        '.account-summary-card',
        '.dashboard-grid > .card',
        '.account-grid > .card',
        '.radar-card',
        '.weather-card',
        '.forecast-section'
    ].join(',');
    const tiltSelector = [
        '.sky-visual',
        '.preview-card',
        '.feature-card',
        '.auth-visual',
        '.auth-card',
        '.dashboard-weather-mark',
        '.account-avatar',
        '.account-summary-card',
        '.weather-current'
    ].join(',');
    const revealed = new WeakSet();
    const tilted = new WeakSet();

    function getElements(root, selector) {
        const elements = [];

        if (root instanceof Element && root.matches(selector)) {
            elements.push(root);
        }

        if (root.querySelectorAll) {
            elements.push(...root.querySelectorAll(selector));
        }

        return elements;
    }

    const revealObserver = !reduceMotion && 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -30px 0px' })
        : null;

    function initReveal(root = document) {
        getElements(root, revealSelector).forEach((element, index) => {
            if (revealed.has(element)) {
                return;
            }

            revealed.add(element);
            element.classList.add('reveal-on-scroll');
            element.style.setProperty('--reveal-delay', `${Math.min(index * 55, 330)}ms`);

            if (revealObserver) {
                revealObserver.observe(element);
            } else {
                element.classList.add('is-visible');
            }
        });
    }

    function initTilt(root = document) {
        if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) {
            return;
        }

        getElements(root, tiltSelector).forEach((element) => {
            if (tilted.has(element)) {
                return;
            }

            tilted.add(element);
            element.classList.add('tilt-card');

            element.addEventListener('pointermove', (event) => {
                const rect = element.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                element.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
                element.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
            });

            element.addEventListener('pointerleave', () => {
                element.style.setProperty('--tilt-x', '0deg');
                element.style.setProperty('--tilt-y', '0deg');
            });
        });
    }

    initReveal();
    initTilt();

    if ('MutationObserver' in window) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) {
                        return;
                    }

                    initReveal(node);
                    initTilt(node);
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
});
