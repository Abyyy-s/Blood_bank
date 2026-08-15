/* Shared Life Link motion language: progressive enhancement only. */
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function revealOnScroll() {
        const targets = document.querySelectorAll('.card, .stat-card, .workspace-header, .table-container, .dashboard-operations, .workflow-steps, .alert');
        if (!targets.length) return;
        targets.forEach((el, index) => {
            if (el.closest('.modal') || el.classList.contains('ll-no-motion')) return;
            el.classList.add('ll-reveal');
            el.style.setProperty('--ll-delay', `${Math.min(index * 35, 240)}ms`);
        });
        if (reduceMotion || !('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('ll-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('ll-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        targets.forEach(el => observer.observe(el));
    }

    function magneticButtons() {
        if (reduceMotion || !window.matchMedia('(pointer:fine)').matches) return;
        document.querySelectorAll('.btn, .text-action').forEach(button => {
            if (button.dataset.motionReady) return;
            button.dataset.motionReady = 'true';
            button.addEventListener('pointermove', (event) => {
                const rect = button.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
                button.style.setProperty('--mx', `${x}px`);
                button.style.setProperty('--my', `${y}px`);
                button.classList.add('ll-magnetic');
            });
            button.addEventListener('pointerleave', () => {
                button.style.setProperty('--mx', '0px');
                button.style.setProperty('--my', '0px');
            });
        });
    }

    function tableInteractions() {
        document.querySelectorAll('.table tbody tr').forEach(row => {
            row.addEventListener('click', () => {
                document.querySelectorAll('.table tbody tr.ll-row-focus').forEach(r => r.classList.remove('ll-row-focus'));
                row.classList.add('ll-row-focus');
            });
        });
    }

    function modalMotion() {
        document.querySelectorAll('.modal').forEach(modal => {
            const observer = new MutationObserver(() => {
                if (modal.classList.contains('active')) modal.classList.add('ll-modal-open');
                else modal.classList.remove('ll-modal-open');
            });
            observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
        });
    }

    function pageProgress() {
        if (reduceMotion) return;
        const bar = document.createElement('div');
        bar.className = 'll-scroll-progress';
        document.body.appendChild(bar);
        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = `scaleX(${progress})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
        update();
    }

    function softPointerGlow() {
        if (reduceMotion || !window.matchMedia('(pointer:fine)').matches) return;
        const glow = document.createElement('div');
        glow.className = 'll-pointer-glow';
        document.body.appendChild(glow);
        let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
        window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
        const tick = () => {
            x += (tx - x) * .12;
            y += (ty - y) * .12;
            glow.style.transform = `translate3d(${x}px,${y}px,0)`;
            requestAnimationFrame(tick);
        };
        tick();
    }

    document.addEventListener('DOMContentLoaded', () => {
        revealOnScroll();
        magneticButtons();
        tableInteractions();
        modalMotion();
        pageProgress();
        softPointerGlow();
    });
}());
