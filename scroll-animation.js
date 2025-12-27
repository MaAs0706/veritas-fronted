// scroll-animations.js
class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.scrollIndicator = null;
        this.readingProgress = null;
        this.lastScroll = 0;
        this.init();
    }

    init() {
        this.createScrollIndicator();
        this.createReadingProgress();
        this.initIntersectionObserver();
        this.setupScrollEvents();
        this.animateOnLoad();
    }

    createScrollIndicator() {
        this.scrollIndicator = document.createElement('div');
        this.scrollIndicator.className = 'scroll-indicator';
        this.scrollIndicator.innerHTML = '<i class="fas fa-chevron-up"></i>';
        this.scrollIndicator.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(this.scrollIndicator);
    }

    createReadingProgress() {
        this.readingProgress = document.createElement('div');
        this.readingProgress.className = 'reading-progress';
        document.body.appendChild(this.readingProgress);
    }

    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Special handling for staggered animations
                    if (entry.target.hasAttribute('data-scroll-stagger')) {
                        const children = entry.target.children;
                        Array.from(children).forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('visible');
                            }, index * 100);
                        });
                    }
                }
            });
        }, options);

        // Observe all elements with scroll animation attributes
        const animatedElements = document.querySelectorAll(
            '[data-scroll], [data-scroll-left], [data-scroll-right], ' +
            '[data-scroll-scale], [data-scroll-rotate], [data-scroll-blur], ' +
            '[data-scroll-stagger], .steps-timeline, .reveal-text'
        );

        animatedElements.forEach(el => this.observer.observe(el));
    }

    setupScrollEvents() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Update reading progress
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            if (this.readingProgress) {
                this.readingProgress.style.transform = `scaleX(${scrolled / 100})`;
            }

            // Show/hide scroll to top button
            if (this.scrollIndicator) {
                if (window.scrollY > 500) {
                    this.scrollIndicator.classList.add('visible');
                } else {
                    this.scrollIndicator.classList.remove('visible');
                }
            }
        });
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;
        const direction = currentScroll > this.lastScroll ? 'down' : 'up';
        
        // Parallax effect for hero
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }

        // Parallax for mission visual
        const missionVisual = document.querySelector('.mission-visual');
        if (missionVisual) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.2;
            missionVisual.style.transform = `rotateY(${rate}deg) rotateX(${rate}deg)`;
        }

        // Header shrink effect
        const header = document.querySelector('.header');
        if (header) {
            if (currentScroll > 100) {
                header.style.padding = '10px 0';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.padding = 'var(--spacing-lg) 0';
                header.style.backdropFilter = 'blur(10px)';
            }
        }

        this.lastScroll = currentScroll;
    }

    animateOnLoad() {
        // Animate hero elements on page load
        setTimeout(() => {
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroChip = document.querySelector('.tagline-chip');
            
            if (heroTitle) heroTitle.style.animation = 'floatTitle 3s ease-in-out infinite';
            if (heroSubtitle) heroSubtitle.classList.add('visible');
            if (heroChip) heroChip.classList.add('visible');
        }, 500);

        // Animate timeline connector
        setTimeout(() => {
            const timeline = document.querySelector('.steps-timeline');
            if (timeline) timeline.classList.add('visible');
        }, 1000);
    }

    // Utility function to add animation classes
    static animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 1000);
    }
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const scrollAnimations = new ScrollAnimations();
    
    // Add scroll animation attributes to elements
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (!section.classList.contains('hero')) {
            section.setAttribute('data-scroll', '');
        }
    });

    // Add staggered animation to grid elements
    const grids = document.querySelectorAll('.team-grid, .values-grid, .tech-grid');
    grids.forEach(grid => {
        grid.setAttribute('data-scroll-stagger', '');
    });

    // Add scale animation to cards
    const cards = document.querySelectorAll('.value-card, .tech-card');
    cards.forEach(card => {
        card.setAttribute('data-scroll-scale', '');
    });

    // Add reveal animation to headings
    const headings = document.querySelectorAll('h2, h3');
    headings.forEach(heading => {
        const wrapper = document.createElement('span');
        wrapper.className = 'reveal-text';
        heading.parentNode.insertBefore(wrapper, heading);
        wrapper.appendChild(heading);
    });

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.btn, .nav-link, .team-member, .faq-question');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ScrollAnimations.animateElement(el, 'pulse');
        });
    });
});

// Add CSS for pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    .pulse {
        animation: pulseEffect 0.6s ease;
    }
    
    @keyframes pulseEffect {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(pulseStyle);