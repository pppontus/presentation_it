document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.scroll-container');
    const slides = document.querySelectorAll('.slide');
    const navItems = document.querySelectorAll('.nav-item');
    const mainHeader = document.querySelector('.main-header'); // Selected entire header
    const logoContainer = document.getElementById('main-logo');
    const sideNav = document.querySelector('.side-nav');

    let currentSlideIndex = 0;
    const deviceCycleSlide = document.querySelector('.device-cycle');
    const deviceCycleItems = deviceCycleSlide ? Array.from(deviceCycleSlide.querySelectorAll('.device-cycle-item')) : [];
    let deviceCycleIndex = 0;
    const animDurationMs = getAnimationDurationMs();

    if (deviceCycleItems.length) {
        const activeIndex = deviceCycleItems.findIndex((item) => item.classList.contains('is-active'));
        deviceCycleIndex = activeIndex >= 0 ? activeIndex : 0;
        deviceCycleItems.forEach((item, index) => {
            if (index === deviceCycleIndex) {
                item.classList.add('is-active');
                item.classList.remove('is-hidden', 'is-exit-up');
            } else {
                item.classList.remove('is-active', 'is-exit-up');
                item.classList.add('is-hidden');
                item.style.removeProperty('--enter-shift');
            }
        });
    }

    // --- Intersection Observer for Logo Color & Nav Dots ---
    const observerOptions = {
        threshold: 0.6 // Increased threshold slightly for cleaner transitions
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Trigger animation
                const index = parseInt(entry.target.getAttribute('id').split('-')[1]);
                updateUI(index, entry.target.classList.contains('dark'));
            } else {
                 entry.target.classList.remove('visible'); // Allow replay on scroll back
            }
        });
    }, observerOptions);

    slides.forEach(slide => observer.observe(slide));

    function updateUI(index, isDark) {
        currentSlideIndex = index;
        const isLast = index === slides.length - 1;

        // Update Dots active state
        navItems.forEach(item => item.classList.remove('active'));
        if (navItems[index]) navItems[index].classList.add('active');

        // Hide header logo on final slide
        if (isLast) {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }

        // Update nav colors regardless of slide
        if (isDark) {
            sideNav.classList.remove('light-mode');
            sideNav.classList.add('dark-mode');
        } else {
            sideNav.classList.remove('dark-mode');
            sideNav.classList.add('light-mode');
        }

        // Update Logo Color only when header is visible
        if (!isLast) {
            logoContainer.src = isDark ? 'resources/logo_white.svg' : 'resources/logo_blue.svg';
        }
    }

    function getAnimationDurationMs() {
        const cssValue = getComputedStyle(document.documentElement).getPropertyValue('--anim-duration').trim();
        const seconds = Number.parseFloat(cssValue);
        if (!Number.isNaN(seconds)) {
            return seconds * 1000;
        }
        return 800;
    }

    function transitionDeviceCycle(nextIndex, direction) {
        if (!deviceCycleItems.length) return false;
        if (nextIndex < 0 || nextIndex >= deviceCycleItems.length || nextIndex === deviceCycleIndex) return false;

        const currentItem = deviceCycleItems[deviceCycleIndex];
        const nextItem = deviceCycleItems[nextIndex];

        // 1. Prepare Start Position
        // We set the "Enter From" class while "is-hidden" is still present.
        // "is-hidden" ensures transition is disabled (none), so the jump to start pos is instant.
        nextItem.classList.remove('enter-from-top', 'enter-from-bottom'); 
        if (direction === 'up') {
             nextItem.classList.add('enter-from-top');
        } else {
             nextItem.classList.add('enter-from-bottom');
        }

        // Remove old exit states causing conflicts, but KEEP is-hidden for now
        nextItem.classList.remove('is-exit-up', 'is-exit-down');
        nextItem.classList.remove('is-active'); // Should already be gone, but safety
        
        // 2. Force Reflow (Instant Snap to Start Pos)
        void nextItem.offsetHeight;

        // 3. Enable Animation & Transition
        nextItem.classList.remove('is-hidden'); // Unblocks transition
        
        // 4. Animate to End Pos
        currentItem.classList.remove('is-active');
        currentItem.classList.add(direction === 'up' ? 'is-exit-down' : 'is-exit-up');
        nextItem.classList.add('is-active');

        deviceCycleIndex = nextIndex;
        window.setTimeout(() => {
            // Cleanup
            if (!currentItem.classList.contains('is-active')) {
                currentItem.classList.remove('is-exit-up', 'is-exit-down');
                currentItem.classList.add('is-hidden');
                currentItem.classList.remove('enter-from-top', 'enter-from-bottom');
            }
        }, animDurationMs + 50);

        return true;
    }

    function handleDeviceCycleNavigation(direction) {
        if (!deviceCycleSlide || !deviceCycleItems.length) return false;
        const cycleSlideIndex = parseInt(deviceCycleSlide.getAttribute('id').split('-')[1], 10);
        if (currentSlideIndex !== cycleSlideIndex) return false;

        const nextIndex = direction === 'down' ? deviceCycleIndex + 1 : deviceCycleIndex - 1;
        
        // If we are at the start or end, return false to let the event bubble (allowing scroll to next/prev slide)
        if (nextIndex < 0 || nextIndex >= deviceCycleItems.length) return false;

        return transitionDeviceCycle(nextIndex, direction);
    }

    // --- Keyboard Navigation ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (handleDeviceCycleNavigation('down')) return;
            scrollToSlide(currentSlideIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (handleDeviceCycleNavigation('up')) return;
            scrollToSlide(currentSlideIndex - 1);
        }
    });

    function scrollToSlide(index) {
        if (index >= 0 && index < slides.length) {
            slides[index].scrollIntoView({ behavior: 'smooth' });
        }
    }

    container.addEventListener('wheel', (event) => {
        if (!deviceCycleSlide || !deviceCycleItems.length) return;
        if (currentSlideIndex !== parseInt(deviceCycleSlide.getAttribute('id').split('-')[1], 10)) return;
        const direction = event.deltaY > 0 ? 'down' : 'up';
        if (handleDeviceCycleNavigation(direction)) {
            event.preventDefault();
        }
    }, { passive: false });

    // --- Dot Navigation ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-slide'));
            scrollToSlide(index);
        });
    });
});
