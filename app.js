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
    let deviceCycleLock = false;
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
        if (!deviceCycleItems.length || deviceCycleLock) return false;
        if (nextIndex < 0 || nextIndex >= deviceCycleItems.length || nextIndex === deviceCycleIndex) return false;

        deviceCycleLock = true;
        const currentItem = deviceCycleItems[deviceCycleIndex];
        const nextItem = deviceCycleItems[nextIndex];

        const enterShift = direction === 'up' ? 'calc(-1 * var(--cycle-shift))' : 'var(--cycle-shift)';
        nextItem.style.setProperty('--enter-shift', enterShift);
        nextItem.classList.remove('is-exit-up', 'is-exit-down', 'is-hidden');
        nextItem.classList.remove('is-active');
        void nextItem.offsetHeight;

        currentItem.classList.remove('is-active');
        currentItem.classList.add(direction === 'up' ? 'is-exit-down' : 'is-exit-up');
        nextItem.classList.add('is-active');

        deviceCycleIndex = nextIndex;
        window.setTimeout(() => {
            currentItem.classList.remove('is-exit-up', 'is-exit-down');
            currentItem.classList.add('is-hidden');
            currentItem.style.removeProperty('--enter-shift');
            deviceCycleLock = false;
        }, animDurationMs + 50);

        return true;
    }

    function handleDeviceCycleNavigation(direction) {
        if (!deviceCycleSlide || !deviceCycleItems.length) return false;
        const cycleSlideIndex = parseInt(deviceCycleSlide.getAttribute('id').split('-')[1], 10);
        if (currentSlideIndex !== cycleSlideIndex) return false;
        const nextIndex = direction === 'down' ? deviceCycleIndex + 1 : deviceCycleIndex - 1;
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
