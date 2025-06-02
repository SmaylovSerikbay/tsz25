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