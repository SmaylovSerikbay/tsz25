document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const header = document.querySelector('.header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    let lastScrollTop = 0;
    let menuOverlay;

    // Create menu overlay
    function createOverlay() {
        menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        document.body.appendChild(menuOverlay);

        menuOverlay.addEventListener('click', () => {
            closeMobileMenu();
        });
    }

    createOverlay();

    // Mobile menu toggle with smooth animation
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Handle touch events for better mobile experience
        let touchStartX = 0;
        let touchEndX = 0;

        nav.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        nav.addEventListener('touchmove', (e) => {
            if (nav.scrollHeight > nav.clientHeight) {
                e.stopPropagation();
            }
        }, { passive: true });

        nav.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 100;
            const swipeDistance = touchEndX - touchStartX;

            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0 && !nav.classList.contains('active')) {
                    // Swipe right to open
                    toggleMobileMenu();
                } else if (swipeDistance < 0 && nav.classList.contains('active')) {
                    // Swipe left to close
                    closeMobileMenu();
                }
            }
        }
    }

    // Enhanced dropdown handling
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns with animation
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.nav-dropdown-menu');
                        if (otherMenu && otherMenu.classList.contains('active')) {
                            otherMenu.classList.remove('active');
                        }
                    }
                });
                
                // Toggle current dropdown with animation
                menu.classList.toggle('active');
            });
        }
    });

    // Improved header visibility control
    let headerTimeout;
    let lastScrollY = window.scrollY;
    let scrollDirection = 'up';

    window.addEventListener('scroll', function() {
        if (!headerTimeout) {
            headerTimeout = setTimeout(function() {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > lastScrollY) {
                    scrollDirection = 'down';
                } else {
                    scrollDirection = 'up';
                }

                if (scrollDirection === 'down' && currentScrollY > header.offsetHeight) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }

                lastScrollY = currentScrollY;
                headerTimeout = null;
            }, 100);
        }
    });

    // Enhanced window resize handling
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
                dropdowns.forEach(dropdown => {
                    const menu = dropdown.querySelector('.nav-dropdown-menu');
                    if (menu) {
                        menu.classList.remove('active');
                    }
                });
            }
        }, 250);
    });

    // Improved message alerts
    const messages = document.querySelectorAll('.message-alert');
    messages.forEach(message => {
        message.style.opacity = '1';
        message.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });

    // Enhanced helper functions
    function toggleMobileMenu() {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = nav.classList.contains('active') ? 'ri-close-line' : 'ri-menu-line';
        }
        
        body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        nav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.style.overflow = '';
        
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-menu-line';
        }
    }
}); 