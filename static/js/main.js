document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
            body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = nav.classList.contains('active') ? 'ri-close-line' : 'ri-menu-line';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                nav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.style.overflow = '';
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'ri-menu-line';
                }
            }
        });
    }

    // Dropdown menu
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
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
                        if (otherMenu) {
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

    // Message alerts auto-hide with animation
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

    // Prevent body scroll when mobile menu is open
    function toggleBodyScroll(disable) {
        body.style.overflow = disable ? 'hidden' : '';
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                nav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.style.overflow = '';
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'ri-menu-line';
                }
            }
        }, 250);
    });
}); 