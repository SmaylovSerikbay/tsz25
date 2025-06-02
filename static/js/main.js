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

    // Mobile menu toggle
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = nav.classList.contains('active');
            
            // First, set display to flex if opening
            if (!isOpen) {
                nav.style.display = 'flex';
                // Force a reflow
                nav.offsetHeight;
            }
            
            // Then toggle active classes
            nav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            // Toggle body scroll
            body.style.overflow = isOpen ? '' : 'hidden';
            
            // Update icon
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'ri-menu-line' : 'ri-close-line';
            }
        });

        // Close menu when clicking overlay
        menuOverlay.addEventListener('click', function() {
            closeMenu();
        });

        // Close menu when clicking a link
        nav.addEventListener('click', function(e) {
            if (e.target.matches('a[href]')) {
                closeMenu();
            }
        });
    }

    function closeMenu() {
        nav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.style.overflow = '';
        
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-menu-line';
        }
        
        // Wait for transition to complete before hiding
        setTimeout(() => {
            if (!nav.classList.contains('active')) {
                nav.style.display = '';
            }
        }, 300);
    }

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

    // Order Form Functionality
    initializeOrderForm();

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

    // Mobile menu functionality
    const headerMobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.nav');
    let headerMenuOverlay;

    function createHeaderOverlay() {
        if (!headerMenuOverlay) {
            headerMenuOverlay = document.createElement('div');
            headerMenuOverlay.className = 'menu-overlay';
            document.body.appendChild(headerMenuOverlay);

            headerMenuOverlay.addEventListener('click', closeHeaderMenu);
        }
    }

    function toggleHeaderMenu() {
        const isOpen = headerNav.classList.contains('active');
        
        if (isOpen) {
            closeHeaderMenu();
        } else {
            openHeaderMenu();
        }
    }

    function openHeaderMenu() {
        headerNav.classList.add('active');
        headerMobileMenuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        createHeaderOverlay();
        headerMenuOverlay.classList.add('active');
    }

    function closeHeaderMenu() {
        headerNav.classList.remove('active');
        headerMobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
        if (headerMenuOverlay) {
            headerMenuOverlay.classList.remove('active');
        }
    }

    if (headerMobileMenuToggle) {
        headerMobileMenuToggle.addEventListener('click', toggleHeaderMenu);
    }

    // Dropdown menu functionality
    const headerDropdowns = document.querySelectorAll('.nav-dropdown');

    headerDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns
                headerDropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.querySelector('.nav-dropdown-menu')?.classList.remove('active');
                    }
                });
                
                menu.classList.toggle('active');
            });
        }
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

    // Mobile Menu
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileDropdowns = document.querySelectorAll('.mobile-nav-dropdown');

    // Mobile menu toggle
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a[href]');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // Mobile dropdowns
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

    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            body.style.overflow = '';
        }
    });
});

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

    // Portfolio photo upload
    if (portfolioInput) {
        portfolioInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const previewContainer = document.querySelector('.portfolio-preview');
            
            if (previewContainer) {
                previewContainer.innerHTML = '';
                
                files.forEach(file => {
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
                            const newFiles = Array.from(portfolioInput.files).filter((f, i) => {
                                return f !== file;
                            });
                            
                            // Create new FileList
                            const dataTransfer = new DataTransfer();
                            newFiles.forEach(file => dataTransfer.items.add(file));
                            portfolioInput.files = dataTransfer.files;
                        });
                    }
                    reader.readAsDataURL(file);
                });
            }
        });
    }

    // Delete portfolio photo with confirmation
    deletePhotoForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (confirm('Вы уверены, что хотите удалить это фото?')) {
                const formData = new FormData(form);
                
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
                        form.closest('.portfolio-item').remove();
                        showNotification('Фото успешно удалено', 'success');
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

    // Portfolio grid masonry layout
    if (portfolioGrid) {
        const masonryLayout = () => {
            const items = portfolioGrid.children;
            let columns = window.innerWidth <= 768 ? 2 : 3;
            if (window.innerWidth <= 480) columns = 1;

            const columnHeights = Array(columns).fill(0);
            const columnItems = Array.from({ length: columns }, () => []);

            Array.from(items).forEach((item, index) => {
                const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
                columnItems[shortestColumn].push(item);
                columnHeights[shortestColumn] += item.offsetHeight + 20; // 20px gap
            });

            let currentLeft = 0;
            columnItems.forEach(column => {
                let currentTop = 0;
                column.forEach(item => {
                    item.style.position = 'absolute';
                    item.style.left = currentLeft + 'px';
                    item.style.top = currentTop + 'px';
                    currentTop += item.offsetHeight + 20;
                });
                currentLeft += column[0]?.offsetWidth + 20 || 0;
            });

            portfolioGrid.style.height = Math.max(...columnHeights) + 'px';
        };

        // Initialize masonry layout
        window.addEventListener('load', masonryLayout);
        window.addEventListener('resize', masonryLayout);

        // Reinitialize when images are loaded
        const images = portfolioGrid.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', masonryLayout);
        });
    }

    // Modal functionality
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Close on overlay click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });

            // Close on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal(modal);
                }
            });
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Initialize modals
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => openModal(editProfileModal));
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
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

// Order Form Functionality
function initializeOrderForm() {
    const orderForm = document.querySelector('.order-form');
    const serviceCards = document.querySelectorAll('.service-card');
    const budgetInputs = document.querySelectorAll('.budget-range input');
    const dateInput = document.querySelector('input[type="date"]');
    const timeInput = document.querySelector('input[type="time"]');
    const submitBtn = document.querySelector('.btn.accent[type="submit"]');
    const progressSteps = document.querySelectorAll('.progress-step');

    // Service card selection
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const input = this.querySelector('input[type="radio"]');
            if (input) {
                // Deselect all cards
                serviceCards.forEach(c => c.classList.remove('selected'));
                // Select clicked card
                this.classList.add('selected');
                input.checked = true;
                
                // Trigger validation
                validateForm();
            }
        });
    });

    // Budget range validation and formatting
    if (budgetInputs.length === 2) {
        const [minInput, maxInput] = budgetInputs;

        function formatNumber(value) {
            return new Intl.NumberFormat('ru-RU').format(value);
        }

        function parseNumber(value) {
            return parseInt(value.replace(/[^\d]/g, ''));
        }

        function updateBudgetInputs() {
            let min = parseNumber(minInput.value) || 0;
            let max = parseNumber(maxInput.value) || 0;

            if (max && min > max) {
                [min, max] = [max, min];
            }

            minInput.value = min ? formatNumber(min) : '';
            maxInput.value = max ? formatNumber(max) : '';
        }

        budgetInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
                updateBudgetInputs();
                validateForm();
            });

            input.addEventListener('blur', updateBudgetInputs);
        });
    }

    // Date and time validation
    if (dateInput) {
        // Set minimum date to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;

        dateInput.addEventListener('change', validateForm);
    }

    if (timeInput) {
        timeInput.addEventListener('change', validateForm);
    }

    // Form validation
    function validateForm() {
        let isValid = true;
        const errors = new Map();

        // Required fields validation
        orderForm.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                errors.set(field, 'Это поле обязательно для заполнения');
            }
        });

        // Service selection validation
        const selectedService = orderForm.querySelector('input[name="service"]:checked');
        if (!selectedService) {
            isValid = false;
            errors.set(document.querySelector('.services-grid'), 'Выберите услугу');
        }

        // Budget validation
        if (budgetInputs.length === 2) {
            const [minInput, maxInput] = budgetInputs;
            const min = parseNumber(minInput.value);
            const max = parseNumber(maxInput.value);

            if (min && max && min > max) {
                isValid = false;
                errors.set(maxInput, 'Максимальный бюджет должен быть больше минимального');
            }
        }

        // Date validation
        if (dateInput && dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                isValid = false;
                errors.set(dateInput, 'Дата не может быть в прошлом');
            }
        }

        // Display errors
        orderForm.querySelectorAll('.error-message').forEach(msg => msg.remove());
        orderForm.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });

        errors.forEach((message, element) => {
            element.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="ri-error-warning-line"></i>${message}`;
            element.parentNode.appendChild(errorDiv);
        });

        // Update submit button state
        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.7';
        }

        return isValid;
    }

    // Form submission
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (validateForm()) {
                const formData = new FormData(this);
                
                // Show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Отправка...';

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
                        showNotification('Заявка успешно отправлена', 'success');
                        setTimeout(() => {
                            window.location.href = data.redirect_url;
                        }, 1500);
                    } else {
                        showNotification(data.message || 'Ошибка при отправке заявки', 'error');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Отправить заявку';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Ошибка при отправке заявки', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Отправить заявку';
                });
            }
        });

        // Initial validation
        validateForm();
    }

    // Progress steps animation
    function updateProgressSteps() {
        const validSections = Array.from(document.querySelectorAll('.form-section')).map(section => {
            const inputs = section.querySelectorAll('input, select, textarea');
            return Array.from(inputs).every(input => input.value.trim());
        });

        progressSteps.forEach((step, index) => {
            if (validSections[index]) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        });
    }

    if (progressSteps.length) {
        orderForm.addEventListener('input', updateProgressSteps);
        updateProgressSteps();
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