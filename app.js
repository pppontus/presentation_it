document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.scroll-container');
    const slides = document.querySelectorAll('.slide');
    const navItems = document.querySelectorAll('.nav-item');
    const mainHeader = document.querySelector('.main-header'); // Selected entire header
    const logoContainer = document.getElementById('main-logo');
    const sideNav = document.querySelector('.side-nav');

    let currentSlideIndex = 0;

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

        // Update Dots active state
        navItems.forEach(item => item.classList.remove('active'));
        if (navItems[index]) navItems[index].classList.add('active');

        // Hide header logo on final slide
        if (index === slides.length - 1) {
            mainHeader.classList.add('hidden');
        } else {
            mainHeader.classList.remove('hidden');
        }

        // Update Logo Color
        if (isDark) {
            logoContainer.src = 'resources/logo_white.svg';
            sideNav.classList.remove('light-mode');
            sideNav.classList.add('dark-mode');
        } else {
            logoContainer.src = 'resources/logo_blue.svg';
            sideNav.classList.remove('dark-mode');
            sideNav.classList.add('light-mode');
        }
    }

    // --- Keyboard Navigation ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            scrollToSlide(currentSlideIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToSlide(currentSlideIndex - 1);
        }
    });

    function scrollToSlide(index) {
        if (index >= 0 && index < slides.length) {
            slides[index].scrollIntoView({ behavior: 'smooth' });
        }
    }

    // --- Dot Navigation ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-slide'));
            scrollToSlide(index);
        });
    });
});
