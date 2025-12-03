// Get all text sections and background images
const textSections = document.querySelectorAll('.text-section');
const backgroundImages = document.querySelectorAll('.background-image');
let currentActiveIndex = 0;
let isTransitioning = false;

// Function to update background based on scroll position
function updateBackground() {
    if (isTransitioning) return;

    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    textSections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionMiddle = sectionTop + (section.offsetHeight / 2);

        // Check if section is in viewport
        const isInViewport = scrollPosition + windowHeight > sectionTop &&
                           scrollPosition < sectionBottom;

        // Show text box when section is in view
        const textBox = section.querySelector('.text-box');
        if (isInViewport && scrollPosition + (windowHeight / 2) > sectionTop) {
            textBox.classList.add('visible');
        }

        // Change background when section middle is near viewport center
        const viewportCenter = scrollPosition + (windowHeight / 2);
        const distanceFromCenter = Math.abs(viewportCenter - sectionMiddle);

        if (distanceFromCenter < windowHeight / 3 && currentActiveIndex !== index) {
            changeBackground(index);
        }
    });
}

// Function to change background with smooth transition
function changeBackground(newIndex) {
    if (newIndex === currentActiveIndex) return;

    isTransitioning = true;

    // Get current and new background elements
    const currentBg = backgroundImages[currentActiveIndex];
    const newBg = backgroundImages[newIndex];

    // Remove active class from current background
    currentBg.classList.remove('active');
    currentBg.classList.remove('zooming');

    // Reset zoom on current background
    setTimeout(() => {
        currentBg.style.transform = 'scale(1)';
        currentBg.style.animation = 'none';
    }, 1500);

    // Add active class to new background and restart zoom animation
    newBg.style.animation = 'none';
    newBg.style.transform = 'scale(1)';

    // Force reflow to restart animation
    void newBg.offsetWidth;

    newBg.classList.add('active');
    newBg.classList.add('zooming');

    currentActiveIndex = newIndex;

    // Allow transitions again after animation completes
    setTimeout(() => {
        isTransitioning = false;
    }, 1500);
}

// Throttle function to limit scroll event firing
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add scroll event listener with throttling
window.addEventListener('scroll', throttle(updateBackground, 100));

// Initial check on page load
window.addEventListener('load', () => {
    updateBackground();

    // Show first text box
    const firstTextBox = textSections[0].querySelector('.text-box');
    setTimeout(() => {
        firstTextBox.classList.add('visible');
    }, 500);
});

// Handle resize events
window.addEventListener('resize', throttle(updateBackground, 200));

// Intersection Observer for better performance (alternative approach)
const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const index = Array.from(textSections).indexOf(entry.target);
            if (index !== -1 && index !== currentActiveIndex) {
                changeBackground(index);
            }
        }
    });
}, observerOptions);

// Observe all sections
textSections.forEach(section => {
    sectionObserver.observe(section);
});
