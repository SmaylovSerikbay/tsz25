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
        if (!menuOverlay) {
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            document.body.appendChild(menuOverlay);
        }
    }

    createOverlay();

    // Dropdown Functionality
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.nav-dropdown-menu');
                        const otherToggle = otherDropdown.querySelector('.nav-dropdown-toggle');
                        if (otherMenu) otherMenu.classList.remove('active');
                        if (otherToggle) otherToggle.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                toggle.classList.toggle('active');
                menu.classList.toggle('active');
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(dropdown => {
                const menu = dropdown.querySelector('.nav-dropdown-menu');
                const toggle = dropdown.querySelector('.nav-dropdown-toggle');
                if (menu) menu.classList.remove('active');
                if (toggle) toggle.classList.remove('active');
            });
        }
    });

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
            dropdowns.forEach(dropdown => {
                const menu = dropdown.querySelector('.nav-dropdown-menu');
                if (menu) {
                    menu.classList.remove('active');
                }
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
    initializeProfile();

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

    // --- ЧИСТАЯ ЛОГИКА МОБИЛЬНОГО МЕНЮ ---
    const mobileMenu = document.querySelector('.mobile-menu');
    // Корректно выбираем только мобильные дропдауны внутри мобильного меню
    const mobileDropdowns = mobileMenu ? mobileMenu.querySelectorAll('.mobile-nav-dropdown') : [];

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = mobileMenu.classList.contains('active');
            if (!isOpen) {
                mobileMenu.style.display = 'block';
                mobileMenu.classList.add('active');
                mobileMenuToggle.classList.add('active');
                body.style.overflow = 'hidden';
            } else {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.style.overflow = '';
                // Сбросить display только после завершения анимации (300мс)
                setTimeout(() => {
                    if (!mobileMenu.classList.contains('active')) {
                        mobileMenu.style.display = '';
                    }
                }, 300);
            }
        });
        // Закрытие по клику вне меню
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') &&
                !e.target.closest('.mobile-menu-content') &&
                !e.target.closest('.mobile-menu-toggle')) {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.style.overflow = '';
                setTimeout(() => {
                    if (!mobileMenu.classList.contains('active')) {
                        mobileMenu.style.display = '';
                    }
                }, 300);
            }
        });
    }
    // Удаляем overlay для мобильного меню, если был создан
    var _menuOverlay = document.querySelector('.menu-overlay');
    if (_menuOverlay) _menuOverlay.remove();

    // Mobile dropdowns (только внутри мобильного меню)
    mobileDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.mobile-nav-dropdown-toggle');
        const menu = dropdown.querySelector('.mobile-nav-dropdown-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                mobileDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.mobile-nav-dropdown-menu');
                        const otherToggle = otherDropdown.querySelector('.mobile-nav-dropdown-toggle');
                        if (otherMenu) otherMenu.classList.remove('active');
                        if (otherToggle) otherToggle.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                toggle.classList.toggle('active');
                menu.classList.toggle('active');
            });
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const headerDropdowns = document.querySelectorAll('.mobile-nav-dropdown');
    
        headerDropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.mobile-nav-dropdown-toggle');
            const menu = dropdown.querySelector('.mobile-nav-dropdown-menu');
    
            if (toggle && menu) {
                toggle.addEventListener('click', function(e) {
                    e.stopPropagation();
    
                    // Закрыть другие
                    headerDropdowns.forEach(d => {
                        if (d !== dropdown) {
                            d.querySelector('.mobile-nav-dropdown-menu')?.classList.remove('active');
                        }
                    });
    
                    menu.classList.toggle('active');
                });
            }
        });
    
        // Закрыть при клике вне
        document.addEventListener('click', function() {
            headerDropdowns.forEach(dropdown => {
                dropdown.querySelector('.mobile-nav-dropdown-menu')?.classList.remove('active');
            });
        });
    });
    

    // Message alerts functionality
    function showNotification(message, type = 'info') {
        const messagesContainer = document.querySelector('.messages');
        
        if (!messagesContainer) {
            const container = document.createElement('div');
            container.className = 'messages';
            document.querySelector('.main').insertAdjacentElement('afterbegin', container);
        }
        
        const alert = document.createElement('div');
        alert.className = `message-alert ${type}`;
        alert.innerHTML = `
            ${message}
            <button class="close-message" onclick="this.parentElement.remove()">
                <i class="ri-close-line"></i>
            </button>
        `;
        
        messagesContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Make showNotification available globally
    window.showNotification = showNotification;

    // Catalog Page Functionality
    initializeCatalog();

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

function closeMenu() {
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

// Универсальные функции для модальных окон
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Закрытие модалки по клику вне содержимого
window.addEventListener('click', function(event) {
  if (event.target.classList && event.target.classList.contains('modal')) {
    closeModal(event.target.id);
  }
});

// Глобальные функции для кнопок в dashboard-performer.html
function openEditProfileModal() {
  openModal('editProfileModal');
}
function openSubscriptionModal() {
  openModal('subscriptionModal');
}
function openFilterModal() {
  openModal('filterModal');
}
function openResponseModal() {
  openModal('responseModal');
}

function loadMessages(orderId, performerId = null) {
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
    });
}

// Обновляю openChatModal, чтобы подгружать сообщения при открытии
function openChatModal(orderId, performerId = null) {
  openModal('chatModal');
  const chatModal = document.getElementById('chatModal');
  chatModal.setAttribute('data-order-id', orderId);
  chatModal.setAttribute('data-performer-id', performerId || '');
  loadMessages(orderId, performerId);
}

function sendMessage(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input.form-input');
  const message = input.value.trim();
  if (!message) return;

  const chatModal = document.getElementById('chatModal');
  const orderId = chatModal.getAttribute('data-order-id');
  const performerId = chatModal.getAttribute('data-performer-id');
  const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

  const payload = { message };
  if (performerId) {
    payload.performer_id = performerId;
  }

  fetch(`/chat/${orderId}/send/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      input.value = '';
      if (typeof loadMessages === 'function') {
        loadMessages(orderId, performerId);
      }
    }
  });
}

// Profile Page Functionality
function initializeProfile() {
    const editProfileBtn = document.querySelector('.profile-edit-btn');
    const editProfileModal = document.getElementById('editProfileModal');
    const portfolioModal = document.getElementById('portfolioModal');
    const profilePhotoInput = document.querySelector('input[name="profile_photo"]');
    const portfolioInput = document.querySelector('input[name="portfolio_photos"]');
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const deletePhotoForms = document.querySelectorAll('.delete-photo');

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
                            previewContainer.appendChild(previewItem);

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

    // Form validation and submission
    const editProfileForm = document.querySelector('#editProfileModal form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    showNotification(data.message || 'Ошибка при сохранении профиля', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Ошибка при сохранении профиля', 'error');
            });
        });
    }
}

// Catalog Page Functionality
function initializeCatalog() {
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

    function loadMorePerformers() {
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
            catalogGrid.appendChild(loadingIndicator);
            
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
                        catalogGrid.appendChild(performer);
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