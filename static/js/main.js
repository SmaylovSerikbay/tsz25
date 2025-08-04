// Убеждаемся, что getCookie доступна глобально
window.getCookie = window.getCookie || function(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

// Простые и надежные функции чата
window.openModal = function(modalId) {
    console.log('openModal called with modalId:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Закрытие модалки по клику вне содержимого
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('click', function(event) {
        if (event.target.classList && event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Обработчики для кнопок чата
    document.querySelectorAll('.chat-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            console.log('Chat button clicked for orderId:', orderId);
            console.log('openChatModal function:', typeof window.openChatModal);
            if (typeof window.openChatModal === 'function') {
                window.openChatModal(orderId, null);
            } else {
                console.error('openChatModal is not defined');
                alert('Ошибка: функция чата не загружена');
            }
        });
    });
});

window.loadMessages = function(orderId, performerId = null) {
    console.log('loadMessages called with orderId:', orderId, 'performerId:', performerId);
    let url = `/chat/${orderId}/messages/`;
    if (performerId) {
        url += `?performer_id=${performerId}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) return;
            chatMessages.innerHTML = '';
            data.messages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.is_mine ? 'sent' : 'received'}`;
                messageDiv.innerHTML = `
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${message.timestamp}</div>
                `;
                chatMessages.appendChild(messageDiv);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            console.error('Error loading messages:', error);
        });
};

window.openChatModal = function(orderId, performerId = null) {
    console.log('openChatModal called with orderId:', orderId, 'performerId:', performerId);
    openModal('chatModal');
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.setAttribute('data-order-id', orderId);
        chatModal.setAttribute('data-performer-id', performerId || '');
        
        // Устанавливаем заголовок в зависимости от типа пользователя
        const chatTitle = document.getElementById('chatTitle');
        if (chatTitle) {
            // Проверяем URL чтобы определить тип пользователя
            const currentUrl = window.location.pathname;
            if (currentUrl.includes('/dashboard/performer/')) {
                chatTitle.textContent = 'Чат с заказчиком';
            } else if (currentUrl.includes('/dashboard/customer/')) {
                chatTitle.textContent = 'Чат с исполнителем';
            } else {
                chatTitle.textContent = 'Чат';
            }
        }
        
        loadMessages(orderId, performerId);
    }
};

window.sendMessage = function(event) {
    console.log('sendMessage called');
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input.form-input');
    const message = input.value.trim();
    if (!message) return;

    const chatModal = document.getElementById('chatModal');
    const orderId = chatModal.getAttribute('data-order-id');
    const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/chat/${orderId}/send/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            input.value = '';
            loadMessages(orderId);
        } else {
            alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при отправке сообщения');
    });
};

// Убеждаемся, что openBookingModal доступна глобально
window.openBookingModal = window.openBookingModal || function(performerId) {
    console.log('openBookingModal called with performerId:', performerId);
    console.log('Function is defined:', typeof window.openBookingModal);
    console.log('Document ready state:', document.readyState);
    
    // Инициализируем переменные календаря
    if (!window.calendarCurrentDate) {
        window.calendarCurrentDate = new Date();
    }
    if (!window.calendarMonths) {
        window.calendarMonths = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
    }
    
    // Создаем модальное окно для бронирования
    const modalId = 'bookingModal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content booking-modal">
            <div class="modal-header">
                <h3><i class="ri-calendar-check-line"></i> Забронировать исполнителя</h3>
                <button onclick="closeModal('${modalId}')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="bookingForm" method="POST" action="/create-order/${performerId}/">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${getCookie('csrftoken')}">
                    
                    <!-- Выбор типа бронирования -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="ri-file-list-line"></i> Тип бронирования
                        </label>
                        <div class="booking-type-selector">
                            <label class="booking-type-option">
                                <input type="radio" name="booking_type" value="new" checked>
                                <span class="booking-type-content">
                                    <i class="ri-add-circle-line"></i>
                                    <div>
                                        <strong>Новое бронирование</strong>
                                        <small>Создать новую заявку</small>
                                    </div>
                                </span>
                            </label>
                            <label class="booking-type-option">
                                <input type="radio" name="booking_type" value="existing">
                                <span class="booking-type-content">
                                    <i class="ri-link"></i>
                                    <div>
                                        <strong>Прикрепить к заявке</strong>
                                        <small>Использовать существующую заявку</small>
                                    </div>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Выбор существующей заявки (скрыто по умолчанию) -->
                    <div class="form-group" id="existingOrderGroup" style="display: none;">
                        <label for="order_id" class="form-label">
                            <i class="ri-file-list-line"></i> Выберите заявку
                        </label>
                        <select id="order_id" name="order_id" class="form-input">
                            <option value="">Загрузка заявок...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="event_date" class="form-label">
                            <i class="ri-calendar-line"></i> Дата мероприятия *
                        </label>
                        <div class="date-selection-wrapper">
                            <input type="hidden" id="event_date" name="event_date" required>
                            <button type="button" class="btn outline calendar-btn" onclick="openDatePicker()">
                                <i class="ri-calendar-line"></i> Выбрать дату
                            </button>
                        </div>
                        <div id="calendarPicker" class="calendar-picker" style="display: none;">
                            <div class="calendar-header">
                                <button type="button" class="calendar-nav-btn" onclick="prevMonth()">
                                    <i class="ri-arrow-left-s-line"></i>
                                </button>
                                <h4 id="currentMonthDisplay"></h4>
                                <button type="button" class="calendar-nav-btn" onclick="nextMonth()">
                                    <i class="ri-arrow-right-s-line"></i>
                                </button>
                            </div>
                            <div class="calendar-weekdays">
                                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                            </div>
                            <div id="calendarDays" class="calendar-days"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="tariff" class="form-label">
                            <i class="ri-price-tag-line"></i> Выберите тариф *
                        </label>
                        <select id="tariff" name="tariff" class="form-input" required>
                            <option value="">Загрузка тарифов...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="details" class="form-label">
                            <i class="ri-file-text-line"></i> Дополнительная информация
                        </label>
                        <textarea id="details" name="details" class="form-input" rows="4" placeholder="Опишите детали вашего мероприятия..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeModal('${modalId}')" class="btn outline">
                            <i class="ri-close-line"></i> Отмена
                        </button>
                        <button type="submit" class="btn accent">
                            <i class="ri-check-line"></i> Забронировать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Загружаем тарифы исполнителя
    if (typeof loadPerformerTariffs === 'function') {
        loadPerformerTariffs(performerId);
    }
    
    // Загружаем заявки заказчика
    if (typeof loadCustomerOrders === 'function') {
        loadCustomerOrders();
    }

    // Устанавливаем минимальную дату
    const dateInput = document.getElementById('event_date');
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];

    // Сохраняем ID исполнителя для использования в календаре
    window.currentPerformerId = performerId;
    
    // Загружаем занятые даты исполнителя
    if (typeof loadPerformerBusyDates === 'function') {
        loadPerformerBusyDates(performerId);
    }

    // Обработчик переключения типа бронирования
    const bookingTypeRadios = document.querySelectorAll('input[name="booking_type"]');
    const existingOrderGroup = document.getElementById('existingOrderGroup');
    
    bookingTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'existing') {
                existingOrderGroup.style.display = 'block';
            } else {
                existingOrderGroup.style.display = 'none';
            }
        });
    });

    // Обработчик изменения даты
    dateInput.addEventListener('change', function() {
        if (typeof checkDateAvailability === 'function') {
            checkDateAvailability(performerId, this.value);
        }
    });
    
    console.log('Booking modal created and displayed');
};

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const header = document.querySelector('.header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('.nav');
    let lastScrollTop = 0;
    let menuOverlay;



    // Create menu overlay
    function createOverlay() {
        if (!menuOverlay) {
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            document.body.appendChild(menuOverlay);
        }
    }

    createOverlay();

    // Dropdown functionality is handled by mobile-menu.js to avoid conflicts

    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
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

    // Catalog Filters
    const mobileFiltersToggle = document.querySelector('.mobile-filters-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const filtersOverlay = document.querySelector('.filters-overlay');
    const filterSections = document.querySelectorAll('.filter-section');
    const clearFilters = document.querySelector('.clear-filters');
    const sortSelect = document.querySelector('.sort-select');

    // Mobile filters toggle
    if (mobileFiltersToggle && filtersSidebar && filtersOverlay) {
        mobileFiltersToggle.addEventListener('click', function() {
            filtersSidebar.classList.toggle('active');
            filtersOverlay.classList.toggle('active');
            document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : '';
        });

        filtersOverlay.addEventListener('click', function() {
            filtersSidebar.classList.remove('active');
            filtersOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Filter sections collapse/expand
    filterSections.forEach(section => {
        const title = section.querySelector('h3');
        const options = section.querySelector('.filter-options, .rating-options, .price-range');
        const icon = document.createElement('i');
        icon.className = 'ri-arrow-down-s-line';
        title.appendChild(icon);

        title.addEventListener('click', function() {
            const isExpanded = !options.style.display || options.style.display === 'block';
            options.style.display = isExpanded ? 'none' : 'block';
            icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    });

    // Clear filters
    if (clearFilters) {
        clearFilters.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Reset checkboxes
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });

            // Reset price inputs
            document.querySelectorAll('.price-input').forEach(input => {
                input.value = '';
            });

            // Reset sort select
            if (sortSelect) {
                sortSelect.selectedIndex = 0;
            }

            // Trigger form submit if exists
            const form = document.querySelector('.filters-form');
            if (form) {
                form.submit();
            }
        });
    }

    // Price inputs validation
    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });

    // Sort select handling
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const form = this.closest('form');
            if (form) {
                form.submit();
            }
        });
    }

    // Lazy loading for performer images
    const performerImages = document.querySelectorAll('.performer-image');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        performerImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Smooth scroll to top when changing filters
    const filterInputs = document.querySelectorAll('.filter-option input, .rating-option input');
    filterInputs.forEach(input => {
        input.addEventListener('change', function() {
            const form = this.closest('form');
            if (form) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    form.submit();
                }, 500);
            }
        });
    });

    // Add animation when performer cards enter viewport
    const performerCards = document.querySelectorAll('.performer-card');
    if ('IntersectionObserver' in window) {
        const cardObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        performerCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            cardObserver.observe(card);
        });
    }

    // Profile Page Functionality
    if (typeof initializeProfile === 'function') {
        initializeProfile();
    }

    // Base Template Functionality
    let lastScroll = 0;
    let scrollTimeout;

    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                header.classList.add('hide');
            } else {
                // Scrolling up
                header.classList.remove('hide');
            }
            
            lastScroll = currentScroll;
        }, 50);
    });

    // Улучшенная мобильная функциональность
    // Закрытие мобильного меню при изменении размера окна
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Закрытие мобильного меню при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
        // Закрыть при клике вне
    document.addEventListener('click', function() {
        const headerDropdowns = document.querySelectorAll('.mobile-nav-dropdown');
        headerDropdowns.forEach(dropdown => {
            dropdown.querySelector('.mobile-nav-dropdown-menu')?.classList.remove('active');
        });
    });
    

    // Message alerts functionality
    function showNotification(message, type = 'info') {
        if (!document.body) {
            console.error('Document body not available');
            return;
        }
        
        let messagesContainer = document.querySelector('.messages');
        
        if (!messagesContainer) {
            const mainContainer = document.querySelector('.main');
            if (mainContainer) {
            const container = document.createElement('div');
            container.className = 'messages';
                mainContainer.insertAdjacentElement('afterbegin', container);
                messagesContainer = container;
            }
        }
        
        const alert = document.createElement('div');
        alert.className = `message-alert ${type}`;
        alert.innerHTML = `
            ${message}
            <button class="close-message" onclick="this.parentElement.remove()">
                <i class="ri-close-line"></i>
            </button>
        `;
        
        if (messagesContainer) {
        messagesContainer.appendChild(alert);
        } else {
            // Fallback: append to body if no messages container
            document.body.appendChild(alert);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
            alert.remove();
            }
        }, 5000);
    }

    // Make showNotification available globally
    window.showNotification = showNotification;

    // Catalog Page Functionality
    if (typeof initializeCatalog === 'function') {
        initializeCatalog();
    }

    // --- ЛОГИКА ВЫБОРА УСЛУГ В ФОРМЕ ЗАКАЗА ---
    const serviceCards = document.querySelectorAll('.service-card');
    const selectedServicesInput = document.getElementById('selectedServices');
    if (serviceCards.length && selectedServicesInput) {
        let selected = [];
        // Восстановить выбранные услуги при редактировании
        try {
            selected = JSON.parse(selectedServicesInput.value);
        } catch (e) {
            selected = [];
        }
        serviceCards.forEach(card => {
            const service = card.getAttribute('data-service');
            if (selected.includes(service)) {
                card.classList.add('selected');
            }
            card.addEventListener('click', function() {
                if (selected.includes(service)) {
                    selected = selected.filter(s => s !== service);
                    card.classList.remove('selected');
                } else {
                    selected.push(service);
                    card.classList.add('selected');
                }
                selectedServicesInput.value = JSON.stringify(selected);
            });
        });
        // При отправке формы сериализуем выбранные услуги
        const orderForm = selectedServicesInput.closest('form');
        if (orderForm) {
            orderForm.addEventListener('submit', function() {
                selectedServicesInput.value = JSON.stringify(selected);
            });
        }
    }
});

window.closeMenu = function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenu && mobileMenuToggle) {
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!mobileMenu.classList.contains('active')) {
                mobileMenu.style.display = '';
            }
        }, 300);
    }
}

// Удаляем дублирующиеся функции чата, так как они уже определены в начале файла

// Экспортируем функции в глобальную область видимости
window.openBookingModal = function(performerId) {
    console.log('openBookingModal called with performerId:', performerId);
    console.log('Function is defined:', typeof window.openBookingModal);
    console.log('Document ready state:', document.readyState);
    
    // Инициализируем переменные календаря
    if (!window.calendarCurrentDate) {
        window.calendarCurrentDate = new Date();
    }
    if (!window.calendarMonths) {
        window.calendarMonths = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
    }
    
    // Создаем модальное окно для бронирования
    const modalId = 'bookingModal';
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content booking-modal">
            <div class="modal-header">
                <h3><i class="ri-calendar-check-line"></i> Забронировать исполнителя</h3>
                <button onclick="closeModal('${modalId}')" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="bookingForm" method="POST" action="/create-order/${performerId}/">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${getCookie('csrftoken')}">
                    
                    <!-- Выбор типа бронирования -->
                    <div class="form-group">
                        <label class="form-label">
                            <i class="ri-file-list-line"></i> Тип бронирования
                        </label>
                        <div class="booking-type-selector">
                            <label class="booking-type-option">
                                <input type="radio" name="booking_type" value="new" checked>
                                <span class="booking-type-content">
                                    <i class="ri-add-circle-line"></i>
                                    <div>
                                        <strong>Новое бронирование</strong>
                                        <small>Создать новую заявку</small>
                                    </div>
                                </span>
                            </label>
                            <label class="booking-type-option">
                                <input type="radio" name="booking_type" value="existing">
                                <span class="booking-type-content">
                                    <i class="ri-link"></i>
                                    <div>
                                        <strong>Прикрепить к заявке</strong>
                                        <small>Использовать существующую заявку</small>
                                    </div>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Выбор существующей заявки (скрыто по умолчанию) -->
                    <div class="form-group" id="existingOrderGroup" style="display: none;">
                        <label for="order_id" class="form-label">
                            <i class="ri-file-list-line"></i> Выберите заявку
                        </label>
                        <select id="order_id" name="order_id" class="form-input">
                            <option value="">Загрузка заявок...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="event_date" class="form-label">
                            <i class="ri-calendar-line"></i> Дата мероприятия *
                        </label>
                        <div class="date-selection-wrapper">
                            <input type="hidden" id="event_date" name="event_date" required>
                            <button type="button" class="btn outline calendar-btn" onclick="openDatePicker()">
                                <i class="ri-calendar-line"></i> Выбрать дату
                            </button>
                        </div>
                        <div id="calendarPicker" class="calendar-picker" style="display: none;">
                            <div class="calendar-header">
                                <button type="button" class="calendar-nav-btn" onclick="prevMonth()">
                                    <i class="ri-arrow-left-s-line"></i>
                                </button>
                                <h4 id="currentMonthDisplay"></h4>
                                <button type="button" class="calendar-nav-btn" onclick="nextMonth()">
                                    <i class="ri-arrow-right-s-line"></i>
                                </button>
                            </div>
                            <div class="calendar-weekdays">
                                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                            </div>
                            <div id="calendarDays" class="calendar-days"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="tariff" class="form-label">
                            <i class="ri-price-tag-line"></i> Выберите тариф *
                        </label>
                        <select id="tariff" name="tariff" class="form-input" required>
                            <option value="">Загрузка тарифов...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="details" class="form-label">
                            <i class="ri-file-text-line"></i> Дополнительная информация
                        </label>
                        <textarea id="details" name="details" class="form-input" rows="4" placeholder="Опишите детали вашего мероприятия..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeModal('${modalId}')" class="btn outline">
                            <i class="ri-close-line"></i> Отмена
                        </button>
                        <button type="submit" class="btn accent">
                            <i class="ri-check-line"></i> Забронировать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Загружаем тарифы исполнителя
    loadPerformerTariffs(performerId);
    
    // Загружаем заявки заказчика
    loadCustomerOrders();

    // Устанавливаем минимальную дату
    const dateInput = document.getElementById('event_date');
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];

    // Сохраняем ID исполнителя для использования в календаре
    window.currentPerformerId = performerId;
    
    // Загружаем занятые даты исполнителя
    loadPerformerBusyDates(performerId);

    // Обработчик переключения типа бронирования
    const bookingTypeRadios = document.querySelectorAll('input[name="booking_type"]');
    const existingOrderGroup = document.getElementById('existingOrderGroup');
    
    bookingTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'existing') {
                existingOrderGroup.style.display = 'block';
            } else {
                existingOrderGroup.style.display = 'none';
            }
        });
    });

    // Обработчик изменения даты
    dateInput.addEventListener('change', function() {
        checkDateAvailability(performerId, this.value);
    });
    
    console.log('Booking modal created and displayed');
}

// Функция отправки бронирования
window.submitBooking = function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    fetch('/order/booking/create/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Бронирование успешно создано!', 'success');
            closeModal('bookingModal');
            // Перенаправляем на детали заказа
            if (data.order_id) {
                window.location.href = `/order/${data.order_id}/`;
            }
        } else {
            showNotification(data.error || 'Ошибка при создании бронирования', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Ошибка при создании бронирования', 'error');
    });
};

window.getCookie = function(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

window.loadPerformerTariffs = function(performerId) {
    fetch(`/api/performer/${performerId}/tariffs/`)
        .then(response => response.json())
        .then(data => {
            const tariffSelect = document.getElementById('tariff');
            if (!tariffSelect) return;
            
            tariffSelect.innerHTML = '<option value="">Выберите тариф</option>';
            
            if (data.tariffs && data.tariffs.length > 0) {
                data.tariffs.forEach(tariff => {
                    const option = document.createElement('option');
                    option.value = tariff.id;
                    option.textContent = `${tariff.name} - ${tariff.price} ₸`;
                    tariffSelect.appendChild(option);
                });
            } else {
                tariffSelect.innerHTML = '<option value="">Нет доступных тарифов</option>';
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки тарифов:', error);
            const tariffSelect = document.getElementById('tariff');
            if (tariffSelect) {
                tariffSelect.innerHTML = '<option value="">Ошибка загрузки тарифов</option>';
            }
        });
}

window.loadCustomerOrders = function() {
    fetch('/api/user/orders/')
        .then(response => response.json())
        .then(data => {
            const orderSelect = document.getElementById('order_id');
            if (!orderSelect) return;
            
            orderSelect.innerHTML = '<option value="">Выберите заявку</option>';
            
            if (data.orders && data.orders.length > 0) {
                data.orders.forEach(order => {
                    if (order.status === 'new') {  // Только новые заявки
                        const option = document.createElement('option');
                        option.value = order.id;
                        option.textContent = `${order.title} (${order.event_date})`;
                        orderSelect.appendChild(option);
                    }
                });
            } else {
                orderSelect.innerHTML = '<option value="">Нет доступных заявок</option>';
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки заявок:', error);
            const orderSelect = document.getElementById('order_id');
            if (orderSelect) {
                orderSelect.innerHTML = '<option value="">Ошибка загрузки заявок</option>';
            }
        });
}

window.loadPerformerBusyDates = function(performerId) {
    fetch(`/api/performer/${performerId}/busy-dates/`)
        .then(response => response.json())
        .then(data => {
            window.performerBusyDates = data.busy_dates || [];
            // Обновляем календарь, если он открыт
            if (window.currentCalendar && window.currentCalendar.updateCalendar) {
                window.currentCalendar.updateCalendar();
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки занятых дат:', error);
            window.performerBusyDates = [];
        });
}

window.checkDateAvailability = function(performerId, selectedDate) {
    const dateInput = document.getElementById('event_date');
    const submitButton = document.querySelector('#bookingForm button[type="submit"]');
    const dateWarning = document.getElementById('dateWarning');
    
    // Удаляем предыдущее предупреждение
    if (dateWarning) {
        dateWarning.remove();
    }
    
    if (!selectedDate) return;
    
    // Проверяем, занята ли дата
    if (window.performerBusyDates && window.performerBusyDates.includes(selectedDate)) {
        // Создаем предупреждение
        const warning = document.createElement('div');
        warning.id = 'dateWarning';
        warning.className = 'date-warning';
        warning.innerHTML = `
            <i class="ri-error-warning-line"></i>
            <span>Эта дата уже занята. Выберите другую дату.</span>
        `;
        
        if (dateInput && dateInput.parentNode) {
            dateInput.parentNode.appendChild(warning);
        }
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.style.opacity = '0.5';
        }
    } else {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    }
}

// Календарь для выбора даты
let calendarCurrentDate = new Date();
const calendarMonths = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

window.openDatePicker = function() {
    const calendarPicker = document.getElementById('calendarPicker');
    if (calendarPicker) {
        calendarPicker.style.display = 'block';
        updateCalendarDisplay();
    }
}

window.closeDatePicker = function() {
    const calendarPicker = document.getElementById('calendarPicker');
    if (calendarPicker) {
        calendarPicker.style.display = 'none';
    }
}

window.updateCalendarDisplay = function() {
    const year = window.calendarCurrentDate.getFullYear();
    const month = window.calendarCurrentDate.getMonth();
    
    // Проверяем, какой элемент существует
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const currentMonth = document.getElementById('currentMonth');
    
    if (currentMonthDisplay) {
        currentMonthDisplay.textContent = `${window.calendarMonths[month]} ${year}`;
    } else if (currentMonth) {
        currentMonth.textContent = `${window.calendarMonths[month]} ${year}`;
    }
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let firstDayIndex = firstDay.getDay() || 7;
    firstDayIndex--;
    
    // Добавляем пустые ячейки
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day-empty';
        calendarDays.appendChild(emptyCell);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell';
        
        const date = new Date(year, month, day);
        const dateString = formatDateString(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Проверяем, занята ли дата
        const isBusy = window.performerBusyDates && window.performerBusyDates.includes(dateString);
        const isPast = date < today;
        
        if (isBusy) {
            cell.classList.add('calendar-day-busy');
            cell.title = 'Дата занята';
        } else if (isPast) {
            cell.classList.add('calendar-day-past');
            cell.title = 'Прошедшая дата';
        } else {
            cell.classList.add('calendar-day-available');
            cell.onclick = () => selectDate(dateString);
        }
        
        cell.textContent = day;
        calendarDays.appendChild(cell);
    }
}

window.formatDateString = function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.selectDate = function(dateString) {
    const dateInput = document.getElementById('event_date');
    const calendarBtn = document.querySelector('.calendar-btn');
    
    dateInput.value = dateString;
    
    // Форматируем дату для отображения
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Обновляем текст кнопки
    calendarBtn.innerHTML = `<i class="ri-calendar-line"></i> ${formattedDate}`;
    calendarBtn.classList.add('has-date');
    
    closeDatePicker();
    checkDateAvailability(window.currentPerformerId, dateString);
}

window.prevMonth = function() {
    window.calendarCurrentDate.setMonth(window.calendarCurrentDate.getMonth() - 1);
    updateCalendarDisplay();
}

window.nextMonth = function() {
    window.calendarCurrentDate.setMonth(window.calendarCurrentDate.getMonth() + 1);
    updateCalendarDisplay();
}

// Profile Page Functionality
window.initializeProfile = function() {
    const editProfileBtn = document.querySelector('.profile-edit-btn');
    const editProfileModal = document.getElementById('editProfileModal');
    const portfolioModal = document.getElementById('portfolioModal');
    const profilePhotoInput = document.querySelector('input[name="profile_photo"]');
    const portfolioInput = document.querySelector('input[name="portfolio_photos"]');
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const deletePhotoForms = document.querySelectorAll('.delete-photo');

    // Edit Profile Modal Form Handler
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showNotification('Профиль успешно обновлен', 'success');
                    closeModal('editProfileModal');
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    showNotification(data.message || 'Ошибка при сохранении профиля', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification(`Ошибка при сохранении профиля: ${error.message}`, 'error');
            });
        });
    }

    // Portfolio photo click to enlarge - УДАЛЕНО, используется новый модальный просмотрщик

    // Profile photo preview
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.querySelector('.profile-photo');
                    if (preview) {
                        preview.src = e.target.result;
                    }
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Portfolio photo upload preview
    if (portfolioInput) {
        portfolioInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const previewContainer = document.querySelector('.portfolio-preview');
            
            if (previewContainer) {
                previewContainer.innerHTML = '';
                
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const previewItem = document.createElement('div');
                            previewItem.className = 'portfolio-preview-item';
                            previewItem.innerHTML = `
                                <img src="${e.target.result}" alt="Preview">
                                <button type="button" class="remove-preview">
                                    <i class="ri-close-line"></i>
                                </button>
                            `;
                            if (previewContainer) {
                            previewContainer.appendChild(previewItem);
                            }

                            // Remove preview functionality
                            previewItem.querySelector('.remove-preview').addEventListener('click', function() {
                                previewItem.remove();
                                const newFiles = Array.from(portfolioInput.files).filter(f => f !== file);
                                const dataTransfer = new DataTransfer();
                                newFiles.forEach(f => dataTransfer.items.add(f));
                                portfolioInput.files = dataTransfer.files;
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    }

    // Delete portfolio photo
    if (deletePhotoForms) {
        deletePhotoForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (confirm('Вы уверены, что хотите удалить это фото?')) {
                    const formData = new FormData(form);
                    const photoItem = form.closest('.portfolio-item');
                    
                    fetch(form.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            photoItem.remove();
                            showNotification('Фото успешно удалено', 'success');
                            
                            // Reflow the grid
                            if (portfolioGrid) {
                                const items = portfolioGrid.children;
                                Array.from(items).forEach(item => {
                                    item.style.gridRow = 'auto';
                                    item.style.gridColumn = 'auto';
                                });
                            }
                        } else {
                            showNotification('Ошибка при удалении фото', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Ошибка при удалении фото', 'error');
                    });
                }
            });
        });
    }

    // Initialize portfolio grid layout
    if (portfolioGrid) {
        const updateLayout = () => {
            const items = portfolioGrid.children;
            const isMobile = window.innerWidth <= 768;
            
            // Reset styles
            Array.from(items).forEach(item => {
                item.style.height = '';
                item.style.gridRow = 'auto';
                item.style.gridColumn = 'auto';
            });

            // Set equal heights for items
            if (!isMobile) {
                const itemWidth = items[0]?.offsetWidth || 0;
                Array.from(items).forEach(item => {
                    item.style.height = `${itemWidth}px`;
                });
            }
        };

        // Update layout on load and resize
        window.addEventListener('load', updateLayout);
        window.addEventListener('resize', updateLayout);

        // Update layout when images load
        portfolioGrid.querySelectorAll('img').forEach(img => {
            img.addEventListener('load', updateLayout);
        });
    }

    // Modal functionality
    // Initialize modals
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => openModal('editProfileModal'));
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
}

// Catalog Page Functionality
window.initializeCatalog = function() {
    const catalogGrid = document.querySelector('.catalog-grid');
    
    // Only initialize catalog functionality if we're on a page with catalog grid
    if (!catalogGrid) return;

    const filtersForm = document.querySelector('.filters-form');
    const mobileFiltersToggle = document.querySelector('.mobile-filters-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const filtersOverlay = document.querySelector('.filters-overlay');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    const sortSelect = document.querySelector('.sort-select');
    const priceInputs = document.querySelectorAll('.price-input');
    const filterSections = document.querySelectorAll('.filter-section');

    // Mobile filters toggle
    if (mobileFiltersToggle && filtersSidebar && filtersOverlay) {
        mobileFiltersToggle.addEventListener('click', function() {
            filtersSidebar.classList.toggle('active');
            filtersOverlay.classList.toggle('active');
            document.body.style.overflow = filtersSidebar.classList.contains('active') ? 'hidden' : '';
        });

        filtersOverlay.addEventListener('click', function() {
            filtersSidebar.classList.remove('active');
            filtersOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Price inputs formatting
    if (priceInputs.length) {
        function formatNumber(value) {
            return new Intl.NumberFormat('ru-RU').format(value);
        }

        function parseNumber(value) {
            return parseInt(value.replace(/[^\d]/g, ''));
        }

        priceInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
                const number = parseNumber(this.value);
                if (number) {
                    this.value = formatNumber(number);
                }
            });

            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.value = '';
                }
            });
        });
    }

    // Filter sections collapse/expand
    filterSections.forEach(section => {
        const title = section.querySelector('h3');
        const content = section.querySelector('.filter-options, .price-range, .rating-options');
        const icon = title.querySelector('i');
        
        if (title && content && icon) {
            title.addEventListener('click', function() {
                const isExpanded = content.style.maxHeight;
                
                // Collapse all other sections
                filterSections.forEach(s => {
                    const c = s.querySelector('.filter-options, .price-range, .rating-options');
                    const i = s.querySelector('h3 i');
                    if (c && c !== content) {
                        c.style.maxHeight = null;
                    }
                    if (i && i !== icon) {
                        i.style.transform = 'rotate(0deg)';
                    }
                });
                
                // Toggle current section
                if (isExpanded) {
                    content.style.maxHeight = null;
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        }
    });

    // Clear filters
    if (clearFiltersBtn && filtersForm) {
        clearFiltersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear checkboxes
            filtersForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Clear price inputs
            filtersForm.querySelectorAll('.price-input').forEach(input => {
                input.value = '';
            });
            
            // Clear sort select
            if (sortSelect) {
                sortSelect.value = sortSelect.options[0].value;
            }
            
            // Submit form
            filtersForm.submit();
        });
    }

    // Sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            if (filtersForm) {
                filtersForm.submit();
            }
        });
    }

    // Lazy loading for performer images
    if (catalogGrid) {
        const performerImages = catalogGrid.querySelectorAll('.performer-image');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        performerImages.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }

    // Infinite scroll
    let page = 1;
    let loading = false;
    const loadMoreThreshold = 300;

    window.loadMorePerformers = function() {
        if (!catalogGrid || loading) return;
        
        const lastCard = catalogGrid.lastElementChild;
        if (!lastCard) return;
        
        const lastCardOffset = lastCard.offsetTop + lastCard.clientHeight;
        const pageOffset = window.pageYOffset + window.innerHeight;
        
        if (pageOffset + loadMoreThreshold > lastCardOffset) {
            loading = true;
            
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<i class="ri-loader-4-line"></i>';
            if (catalogGrid) {
            catalogGrid.appendChild(loadingIndicator);
            }
            
            // Fetch next page
            fetch(`?page=${++page}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.text())
            .then(html => {
                // Remove loading indicator
                loadingIndicator.remove();
                
                if (html.trim()) {
                    // Append new performers
                    const temp = document.createElement('div');
                    temp.innerHTML = html;
                    
                    const newPerformers = temp.querySelectorAll('.performer-card');
                    newPerformers.forEach(performer => {
                        if (catalogGrid) {
                        catalogGrid.appendChild(performer);
                        }
                    });
                    
                    loading = false;
                }
            })
            .catch(error => {
                console.error('Error loading more performers:', error);
                loadingIndicator.remove();
                loading = false;
            });
        }
    }

    // Add scroll event listener for infinite scroll
    window.addEventListener('scroll', loadMorePerformers);
    window.addEventListener('resize', loadMorePerformers);
}

// Явно экспортируем функции чата в глобальную область видимости
console.log('Exporting chat functions to window object');
console.log('openChatModal:', typeof window.openChatModal);
console.log('loadMessages:', typeof window.loadMessages);
console.log('sendMessage:', typeof window.sendMessage);
console.log('openModal:', typeof window.openModal);
console.log('closeModal:', typeof window.closeModal);

