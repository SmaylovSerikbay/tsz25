document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const header = document.querySelector('.header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    let lastScrollTop = 0;

    // Mobile menu toggle
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Prevent scrolling when menu is open
        nav.addEventListener('touchmove', function(e) {
            if (nav.scrollHeight > nav.clientHeight) {
                e.stopPropagation();
            } else {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Handle dropdowns
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.nav-dropdown-menu');
                        if (otherMenu && otherMenu.classList.contains('active')) {
                            otherMenu.classList.remove('active');
                        }
                    }
                });
                
                menu.classList.toggle('active');
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        dropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('.nav-dropdown-menu');
            if (menu && menu.classList.contains('active') && !dropdown.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    });

    // Handle header visibility on scroll
    let headerTimeout;
    window.addEventListener('scroll', function() {
        if (!headerTimeout) {
            headerTimeout = setTimeout(function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Show/hide header based on scroll direction
                if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                    // Scrolling down
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
                headerTimeout = null;
            }, 100);
        }
    });

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }, 250);
    });

    // Message alerts
    const messages = document.querySelectorAll('.message-alert');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });

    // Helper functions
    function toggleMobileMenu() {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = nav.classList.contains('active') ? 'ri-close-line' : 'ri-menu-line';
        }
        body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        nav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.style.overflow = '';
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-menu-line';
        }
    }
}); 