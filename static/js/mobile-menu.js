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
            
            toggleMobileMenu();
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
            link.addEventListener('click', function(e) {
                // Не закрываем меню для дропдаунов
                if (!this.closest('.mobile-nav-dropdown-menu')) {
                    // Добавляем небольшую задержку для плавности
                    setTimeout(() => {
                        closeMobileMenu();
                    }, 150);
                }
            });
        });
        
        // Функция переключения мобильного меню
        function toggleMobileMenu() {
            const isActive = mobileMenu.classList.contains('active');
            
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }
        
        // Функция открытия мобильного меню
        function openMobileMenu() {
            mobileMenuToggle.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.classList.add('menu-open');
            
            // Сохраняем позицию скролла
            const scrollY = window.scrollY;
            document.body.style.top = `-${scrollY}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        }
        
        // Функция закрытия мобильного меню
        function closeMobileMenu() {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Восстанавливаем позицию скролла
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        
        // Обработка изменения размера окна
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }, 250);
        });
    }
    
    // Мобильные дропдауны
    const mobileDropdownToggles = document.querySelectorAll('.mobile-nav-dropdown-toggle');
    
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownMenu = this.nextElementSibling;
            const arrow = this.querySelector('i:last-child');
            
            // Закрываем все другие дропдауны
            mobileDropdownToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    otherToggle.classList.remove('active');
                    const otherMenu = otherToggle.nextElementSibling;
                    if (otherMenu) {
                        otherMenu.classList.remove('active');
                    }
                    const otherArrow = otherToggle.querySelector('i:last-child');
                    if (otherArrow) {
                        otherArrow.style.transform = '';
                    }
                }
            });
            
            this.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
            
            if (arrow) {
                arrow.style.transform = this.classList.contains('active') ? 'rotate(180deg)' : '';
            }
        });
    });
    
    // Десктопные дропдауны
    const desktopDropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    
    console.log('Found desktop dropdown toggles:', desktopDropdownToggles.length);
    
    desktopDropdownToggles.forEach(toggle => {
        console.log('Adding event listener to desktop dropdown toggle');
        toggle.addEventListener('click', function(e) {
            console.log('Desktop dropdown toggle clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const dropdownMenu = this.nextElementSibling;
            const arrow = this.querySelector('i:last-child');
            
            console.log('Dropdown menu:', dropdownMenu);
            console.log('Arrow:', arrow);
            
            // Закрываем все другие дропдауны
            desktopDropdownToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    otherToggle.classList.remove('active');
                    const otherMenu = otherToggle.nextElementSibling;
                    if (otherMenu) {
                        otherMenu.classList.remove('active');
                    }
                    const otherArrow = otherToggle.querySelector('i:last-child');
                    if (otherArrow) {
                        otherArrow.style.transform = '';
                    }
                }
            });
            
            this.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
            
            console.log('Toggle active:', this.classList.contains('active'));
            console.log('Menu active:', dropdownMenu.classList.contains('active'));
            
            if (arrow) {
                arrow.style.transform = this.classList.contains('active') ? 'rotate(180deg)' : '';
            }
        });
        
        // Закрытие дропдаунов при клике вне их
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target)) {
                toggle.classList.remove('active');
                const dropdownMenu = toggle.nextElementSibling;
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('active');
                }
                const arrow = toggle.querySelector('i:last-child');
                if (arrow) {
                    arrow.style.transform = '';
                }
            }
        });
    });
    
    // Обработка изменения размера окна
    function handleResize() {
        // Закрываем мобильное меню при переходе на десктоп
        if (window.innerWidth > 768) {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
            }
        }
        
        // Закрываем все дропдауны при изменении размера
        const allDropdownToggles = document.querySelectorAll('.nav-dropdown-toggle, .mobile-nav-dropdown-toggle');
        allDropdownToggles.forEach(toggle => {
            toggle.classList.remove('active');
            const dropdownMenu = toggle.nextElementSibling;
            if (dropdownMenu) {
                dropdownMenu.classList.remove('active');
            }
            const arrow = toggle.querySelector('i:last-child');
            if (arrow) {
                arrow.style.transform = '';
            }
        });
    }
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', handleResize);
    
    // Инициализация при загрузке страницы
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
            document.body.classList.remove('menu-open');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        }
    },
    
    open: function() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.classList.add('menu-open');
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