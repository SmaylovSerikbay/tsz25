// ===== АДАПТИВНЫЙ JAVASCRIPT ДЛЯ ВСЕХ СТРАНИЦ =====

document.addEventListener('DOMContentLoaded', function() {
    

    
    // Мобильные фильтры для каталога
    const mobileFiltersToggle = document.querySelector('.mobile-filters-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const filtersOverlay = document.querySelector('.filters-overlay');
    
    if (mobileFiltersToggle && filtersSidebar) {
        mobileFiltersToggle.addEventListener('click', function() {
            filtersSidebar.classList.toggle('active');
            if (filtersOverlay) {
                filtersOverlay.classList.toggle('active');
            }
            document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : '';
        });
        
        // Закрытие фильтров при клике на оверлей
        if (filtersOverlay) {
            filtersOverlay.addEventListener('click', function() {
                filtersSidebar.classList.remove('active');
                filtersOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Закрытие фильтров при нажатии Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && filtersSidebar.classList.contains('active')) {
                filtersSidebar.classList.remove('active');
                if (filtersOverlay) {
                    filtersOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    }
    
    // Адаптивные таблицы
    const tables = document.querySelectorAll('.dashboard-table');
    
    tables.forEach(table => {
        if (window.innerWidth <= 768) {
            const wrapper = document.createElement('div');
            wrapper.style.overflowX = 'auto';
            wrapper.style.webkitOverflowScrolling = 'touch';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
    
    // Адаптивные изображения
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Добавляем lazy loading для мобильных устройств
        if ('IntersectionObserver' in window && window.innerWidth <= 768) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        observer.unobserve(img);
                    }
                });
            });
            
            imageObserver.observe(img);
        }
    });
    
    // Адаптивные формы
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Предотвращение зума на iOS
            if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.type === 'password') {
                input.style.fontSize = '16px';
            }
            
            // Улучшенная валидация для мобильных
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('error');
                    showError(this, 'Это поле обязательно для заполнения');
                } else {
                    this.classList.remove('error');
                    hideError(this);
                }
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error') && this.value.trim()) {
                    this.classList.remove('error');
                    hideError(this);
                }
            });
        });
    });
    
    // Функция показа ошибки
    function showError(input, message) {
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `<i class="ri-error-warning-line"></i> ${message}`;
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    // Функция скрытия ошибки
    function hideError(input) {
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // Адаптивные модальные окна
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('.modal-close, .btn[data-dismiss="modal"]');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            });
        });
        
        // Закрытие модального окна при клике вне его
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        
        // Закрытие модального окна при нажатии Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Адаптивные сообщения
    const messages = document.querySelectorAll('.message-alert');
    
    messages.forEach(message => {
        const closeButton = message.querySelector('.close-message');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                message.remove();
            });
        }
        
        // Автоматическое скрытие сообщений через 5 секунд
        setTimeout(() => {
            if (message.parentNode) {
                message.style.opacity = '0';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 300);
            }
        }, 5000);
    });
    
    // Адаптивные кнопки
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Добавляем touch-события для мобильных устройств
        if ('ontouchstart' in window) {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        }
        
        // Улучшенная доступность
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Адаптивные карточки
    const cards = document.querySelectorAll('.performer-card, .feature, .category');
    
    cards.forEach(card => {
        // Добавляем touch-события для мобильных устройств
        if ('ontouchstart' in window) {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        }
    });
    
    // Адаптивная навигация по хешам
    const hashLinks = document.querySelectorAll('a[href^="#"]');
    
    hashLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Закрываем мобильное меню при переходе
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenuToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Плавная прокрутка к элементу
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Адаптивные изображения портфолио
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        const deleteButton = item.querySelector('.delete-photo');
        if (deleteButton) {
            deleteButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (confirm('Вы уверены, что хотите удалить это изображение?')) {
                    // Здесь можно добавить AJAX-запрос для удаления
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.remove();
                    }, 300);
                }
            });
        }
        
        // Просмотр изображения в модальном окне
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                showImageModal(img.src, img.alt);
            }
        });
    });
    
    // Функция показа модального окна с изображением
    function showImageModal(src, alt) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; max-height: 90%; padding: 0; background: transparent; box-shadow: none;">
                <button class="modal-close" style="position: absolute; top: -40px; right: 0; color: white; background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                <img src="${src}" alt="${alt}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Закрытие модального окна
        const closeButton = modal.querySelector('.modal-close');
        closeButton.addEventListener('click', function() {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }
    
    // Адаптивные календари
    const calendarButtons = document.querySelectorAll('.calendar-btn');
    
    calendarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const picker = this.nextElementSibling;
            if (picker && picker.classList.contains('calendar-picker')) {
                picker.style.display = picker.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
    
    // Закрытие календарей при клике вне их
    document.addEventListener('click', function(e) {
        const calendarPickers = document.querySelectorAll('.calendar-picker');
        calendarPickers.forEach(picker => {
            if (!picker.contains(e.target) && !e.target.classList.contains('calendar-btn')) {
                picker.style.display = 'none';
            }
        });
    });
    
    // Адаптивные фильтры
    const filterOptions = document.querySelectorAll('.filter-option');
    
    filterOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (checkbox) {
            option.addEventListener('click', function() {
                checkbox.checked = !checkbox.checked;
                // Здесь можно добавить логику для применения фильтров
            });
        }
    });
    
    // Адаптивные сортировки
    const sortSelects = document.querySelectorAll('.sort-select');
    
    sortSelects.forEach(select => {
        select.addEventListener('change', function() {
            // Здесь можно добавить логику для сортировки
            console.log('Сортировка изменена на:', this.value);
        });
    });
    
    // Адаптивные поиски
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                // Здесь можно добавить логику для поиска
                console.log('Поиск:', this.value);
            }, 300);
        });
    });
    
    // Обработка изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Пересчитываем адаптивные элементы при изменении размера окна
            const tables = document.querySelectorAll('.dashboard-table');
            tables.forEach(table => {
                if (window.innerWidth <= 768) {
                    if (!table.parentNode.style.overflowX) {
                        const wrapper = document.createElement('div');
                        wrapper.style.overflowX = 'auto';
                        wrapper.style.webkitOverflowScrolling = 'touch';
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                    }
                }
            });
        }, 250);
    });
    
    // Инициализация при загрузке страницы
    function initResponsive() {
        // Проверяем, является ли устройство мобильным
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Добавляем класс для мобильных устройств
            document.body.classList.add('mobile-device');
            
            // Инициализируем touch-события
            initTouchEvents();
        } else {
            document.body.classList.remove('mobile-device');
        }
    }
    
    // Инициализация touch-событий
    function initTouchEvents() {
        const touchElements = document.querySelectorAll('.btn, .card, .performer-card, .feature, .category');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
    
    // Запускаем инициализацию
    initResponsive();
    
    // Обработка изменения ориентации устройства
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            initResponsive();
        }, 100);
    });
    
    // Улучшенная обработка ошибок
    window.addEventListener('error', function(e) {
        console.error('Ошибка JavaScript:', e.error);
    });
    
    // Улучшенная производительность для мобильных устройств
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Выполняем неважные задачи в свободное время
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        });
    }

    // Улучшенная функциональность табов для мобильных устройств
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length > 0) {
        // Функция для переключения табов
        function switchTab(tabId, button) {
            // Убираем активный класс со всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            button.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Плавная анимация появления контента
                targetContent.style.opacity = '0';
                targetContent.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    targetContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    targetContent.style.opacity = '1';
                    targetContent.style.transform = 'translateY(0)';
                }, 10);
            }
            
            // Прокручиваем к активному табу на мобильных устройствах
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    button.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }, 100);
            }
        }
        
        // Добавляем обработчики событий для каждой кнопки таба
        tabButtons.forEach(button => {
            // Обработчик клика
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('onclick')?.match(/showTab\('([^']+)'/)?.[1];
                if (tabId) {
                    switchTab(tabId, this);
                }
            });
            
            // Улучшенные touch события для мобильных устройств
            if ('ontouchstart' in window) {
                button.addEventListener('touchstart', function(e) {
                    this.style.transform = 'scale(0.95)';
                });
                
                button.addEventListener('touchend', function(e) {
                    this.style.transform = '';
                });
                
                button.addEventListener('touchcancel', function(e) {
                    this.style.transform = '';
                });
            }
        });
        
        // Глобальная функция showTab для совместимости с существующим кодом
        window.showTab = function(tabId, button) {
            switchTab(tabId, button);
        };
        
        // Автоматическое переключение табов при свайпе на мобильных устройствах
        if (window.innerWidth <= 768) {
            let startX = 0;
            let currentTabIndex = 0;
            
            const tabContainer = document.querySelector('.tab-buttons');
            if (tabContainer) {
                tabContainer.addEventListener('touchstart', function(e) {
                    startX = e.touches[0].clientX;
                });
                
                tabContainer.addEventListener('touchend', function(e) {
                    const endX = e.changedTouches[0].clientX;
                    const diffX = startX - endX;
                    const threshold = 50;
                    
                    if (Math.abs(diffX) > threshold) {
                        const activeButton = document.querySelector('.tab-button.active');
                        const activeIndex = Array.from(tabButtons).indexOf(activeButton);
                        
                        if (diffX > 0 && activeIndex < tabButtons.length - 1) {
                            // Свайп влево - следующий таб
                            const nextButton = tabButtons[activeIndex + 1];
                            const nextTabId = nextButton.getAttribute('onclick')?.match(/showTab\('([^']+)'/)?.[1];
                            if (nextTabId) {
                                switchTab(nextTabId, nextButton);
                            }
                        } else if (diffX < 0 && activeIndex > 0) {
                            // Свайп вправо - предыдущий таб
                            const prevButton = tabButtons[activeIndex - 1];
                            const prevTabId = prevButton.getAttribute('onclick')?.match(/showTab\('([^']+)'/)?.[1];
                            if (prevTabId) {
                                switchTab(prevTabId, prevButton);
                            }
                        }
                    }
                });
            }
        }
    }
});

// Экспорт функций для использования в других скриптах
window.ResponsiveUtils = {
    showError: function(input, message) {
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `<i class="ri-error-warning-line"></i> ${message}`;
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    },
    
    hideError: function(input) {
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    },
    
    showModal: function(content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        const closeButton = modal.querySelector('.modal-close');
        closeButton.addEventListener('click', function() {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        return modal;
    },
    
    isMobile: function() {
        return window.innerWidth <= 768;
    },
    
    isTablet: function() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },
    
    isDesktop: function() {
        return window.innerWidth > 1024;
    }
}; 