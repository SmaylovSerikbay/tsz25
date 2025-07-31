// ===== МОБИЛЬНОЕ МЕНЮ ДЛЯ ВСЕХ СТРАНИЦ =====

document.addEventListener('DOMContentLoaded', function() {
    
    // Мобильное меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuContent = document.querySelector('.mobile-menu-content');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Блокируем прокрутку body при открытом меню
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });
        
        // Закрытие мобильного меню при клике вне его
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
        
        // Закрытие мобильного меню при нажатии Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        // Закрытие мобильного меню при клике на ссылку
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Не закрываем меню для дропдаунов
                if (!this.closest('.mobile-nav-dropdown-menu')) {
                    setTimeout(() => {
                        closeMobileMenu();
                    }, 100);
                }
            });
        });
        
        // Функция закрытия мобильного меню
        function closeMobileMenu() {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }
    
    // Мобильные дропдауны
    const mobileDropdownToggles = document.querySelectorAll('.mobile-nav-dropdown-toggle');
    
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownMenu = this.nextElementSibling;
            const arrow = this.querySelector('i:last-child');
            
            this.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
            
            if (arrow) {
                arrow.style.transform = this.classList.contains('active') ? 'rotate(180deg)' : '';
            }
        });
    });
    
    // Десктопные дропдауны
    const desktopDropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    
    desktopDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownMenu = this.nextElementSibling;
            const arrow = this.querySelector('i:last-child');
            
            this.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
            
            if (arrow) {
                arrow.style.transform = this.classList.contains('active') ? 'rotate(180deg)' : '';
            }
        });
        
        // Закрытие дропдауна при клике вне его
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target)) {
                toggle.classList.remove('active');
                const dropdownMenu = toggle.nextElementSibling;
                dropdownMenu.classList.remove('active');
                const arrow = toggle.querySelector('i:last-child');
                if (arrow) {
                    arrow.style.transform = '';
                }
            }
        });
    });
    
    // Закрытие всех дропдаунов при клике вне их
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown') && !e.target.closest('.mobile-nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown-menu').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.nav-dropdown-toggle').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.mobile-nav-dropdown-menu').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.mobile-nav-dropdown-toggle').forEach(t => t.classList.remove('active'));
        }
    });
    
    // Touch-события для мобильных устройств
    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('.mobile-nav-link, .mobile-nav-dropdown-toggle, .btn');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
    
    // Адаптация для разных размеров экранов
    function handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Инициализация при загрузке
    handleResize();
});

// Экспорт функций для использования в других скриптах
window.MobileMenu = {
    close: function() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    },
    
    open: function() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    },
    
    toggle: function() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.click();
        }
    }
}; 