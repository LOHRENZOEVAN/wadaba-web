/**
 * WADABA - Water Data Bank
 * Main JavaScript File with Integrated Map Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle - IMPROVED VERSION
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            navLinks.classList.toggle('active');
            
            // Change icon based on menu state
            if (navLinks.classList.contains('active')) {
                mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Prevent menu from closing when clicking inside it
        navLinks.addEventListener('click', function(e) {
            // Only stop propagation if clicking on the menu itself, not links
            if (e.target === navLinks) {
                e.stopPropagation();
            }
        });
        
        // Close mobile menu when clicking on nav links that go to other pages
        const navLinkItems = navLinks.querySelectorAll('a:not([href^="#"])');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or it's a tab link
            if (href === '#' || this.closest('.involvement-tabs') || this.closest('.projects-filters')) {
                return;
            }
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu after clicking a link
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Partners slider (basic automatic scroll)
    const partnersSlider = document.querySelector('.partners-slider');
    
    if (partnersSlider && partnersSlider.children.length > 5) {
        let isScrolling = false;
        let scrollInterval;
        
        function startScroll() {
            if (!isScrolling) {
                isScrolling = true;
                scrollInterval = setInterval(() => {
                    partnersSlider.scrollLeft += 1;
                    
                    // Reset scroll when reaching the end
                    if (partnersSlider.scrollLeft >= (partnersSlider.scrollWidth - partnersSlider.clientWidth)) {
                        partnersSlider.scrollLeft = 0;
                    }
                }, 20);
            }
        }
        
        function stopScroll() {
            isScrolling = false;
            clearInterval(scrollInterval);
        }
        
        startScroll();
        
        partnersSlider.addEventListener('mouseenter', stopScroll);
        partnersSlider.addEventListener('mouseleave', startScroll);
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Please enter your email address', 'error');
                return;
            }
            
            // Simulate form submission success
            emailInput.value = '';
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            
            // In a real application, you would use fetch or XMLHttpRequest to submit the form data to your backend
        });
    }
    
    // Tab functionality for the Get Involved page
    initTabs('.involvement-tabs', '.tab-content');
    
    // Filter functionality for the Projects page
    initFilters('.projects-filters', '.project-card');
    
    // Initialize WADABA Interactive Map (NEW FUNCTIONALITY)
    initializeWADABAMap();
    
    // Map markers hover effect (ENHANCED VERSION)
    const markers = document.querySelectorAll('.marker');
    const regionCards = document.querySelectorAll('.region-card');
    
    if (markers.length && regionCards.length) {
        markers.forEach(marker => {
            marker.addEventListener('mouseenter', function() {
                const region = this.getAttribute('data-region');
                highlightRegion(region);
            });
            
            marker.addEventListener('mouseleave', function() {
                resetRegions();
            });
        });
    }
    
    // Initialize any sliders on the page
    initSliders();
    
    // Check if we're on the Contact page
    if (document.querySelector('.contact-form')) {
        initContactForm();
    }
    
    // WADABA Interactive Map Initialization Function (NEW)
    function initializeWADABAMap() {
        // Check if map container exists
        const mapContainer = document.getElementById('wadaba-map');
        if (!mapContainer) {
            console.log('WADABA map container not found - skipping map initialization');
            return;
        }
        
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.log('Leaflet library not loaded - map functionality disabled');
            return;
        }
        
        try {
            // Initialize the map centered on Central Africa
            const map = L.map('wadaba-map').setView([0, 15], 4);
            
            // Add OpenStreetMap tiles (free alternative to Google Maps)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);
            
            // Custom WADABA marker icon
            const wadabaIcon = L.divIcon({
                className: 'wadaba-marker',
                html: '<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });
            
            // WADABA project locations
            const locations = [
                {
                    id: 'cameroon',
                    name: 'Cameroon - Fako Division',
                    coords: [4.1556, 9.2315], // Approximate coordinates for Fako Division
                    description: 'Focus on low-income neighborhoods and schools',
                    stats: {
                        stations: 15,
                        samples: 120,
                        scientists: 45
                    }
                },
                {
                    id: 'drc',
                    name: 'DR Congo - Likassi',
                    coords: [-4.4419, 15.2663], // Approximate coordinates for Likassi area
                    description: 'Urban-rural water equity assessment',
                    stats: {
                        stations: 8,
                        samples: 85,
                        scientists: 32
                    }
                }
            ];
            
            const mapMarkers = [];
            
            // Add markers for each location
            locations.forEach(location => {
                const popupContent = `
                    <div class="wadaba-popup">
                        <h3>${location.name}</h3>
                        <p><strong>Focus:</strong> ${location.description}</p>
                        <div class="popup-stats">
                            <span class="popup-stat">${location.stats.stations} monitoring stations</span>
                            <span class="popup-stat">${location.stats.samples} water samples</span>
                            <span class="popup-stat">${location.stats.scientists} citizen scientists</span>
                        </div>
                    </div>
                `;
                
                const marker = L.marker(location.coords, { icon: wadabaIcon })
                    .addTo(map)
                    .bindPopup(popupContent);
                    
                mapMarkers.push({ marker, location });
            });
            
            // Map control functionality
            const mapButtons = document.querySelectorAll('.map-btn');
            
            if (mapButtons.length) {
                mapButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        // Remove active class from all buttons
                        mapButtons.forEach(btn => btn.classList.remove('active'));
                        // Add active class to clicked button
                        this.classList.add('active');
                        
                        const region = this.getAttribute('data-region');
                        
                        if (region === 'all') {
                            // Show all markers and fit bounds
                            const group = new L.featureGroup(mapMarkers.map(m => m.marker));
                            map.fitBounds(group.getBounds().pad(0.1));
                        } else {
                            // Focus on specific region
                            const targetLocation = locations.find(loc => loc.id === region);
                            if (targetLocation) {
                                map.setView(targetLocation.coords, 8);
                                // Open popup for the focused region
                                const targetMarker = mapMarkers.find(m => m.location.id === region);
                                if (targetMarker) {
                                    targetMarker.marker.openPopup();
                                }
                            }
                        }
                        
                        // Highlight corresponding region card
                        highlightRegionCard(region);
                    });
                });
            }
            
            // Region card highlighting for interactive map
            function highlightRegionCard(region) {
                const cards = document.querySelectorAll('.region-card');
                cards.forEach(card => {
                    card.classList.remove('highlighted');
                    if (region === 'all' || card.getAttribute('data-region') === region) {
                        card.classList.add('highlighted');
                    }
                });
            }
            
            // Add click handlers to region cards
            const interactiveRegionCards = document.querySelectorAll('.region-card[data-region]');
            interactiveRegionCards.forEach(card => {
                card.addEventListener('click', function() {
                    const region = this.getAttribute('data-region');
                    if (region && region !== 'coming-soon') {
                        // Trigger map button click
                        const mapBtn = document.querySelector(`.map-btn[data-region="${region}"]`);
                        if (mapBtn) {
                            mapBtn.click();
                        }
                    }
                });
            });
            
            // Make region cards clickable (add cursor pointer)
            const style = document.createElement('style');
            style.textContent = `
                .region-card[data-region]:not([data-region="coming-soon"]) {
                    cursor: pointer;
                }
                .region-card.highlighted {
                    border-left-color: #ff9800;
                    transform: translateY(-3px);
                }
            `;
            document.head.appendChild(style);
            
            console.log('WADABA interactive map initialized successfully');
            
        } catch (error) {
            console.error('Error initializing WADABA map:', error);
        }
    }
    
    // Example function for testimonial slider (if implementation is needed)
    function initSliders() {
        // Handle testimonial slider
        const testimonialSlider = document.querySelector('.testimonial-slider');
        
        if (testimonialSlider) {
            const testimonials = testimonialSlider.querySelectorAll('.testimonial');
            let currentIndex = 0;
            
            function showTestimonial(index) {
                testimonials.forEach((testimonial, i) => {
                    testimonial.style.opacity = i === index ? '1' : '0';
                    testimonial.style.transform = i === index ? 'translateX(0)' : 'translateX(50px)';
                    testimonial.style.pointerEvents = i === index ? 'auto' : 'none';
                });
            }
            
            function nextTestimonial() {
                currentIndex = (currentIndex + 1) % testimonials.length;
                showTestimonial(currentIndex);
            }
            
            function prevTestimonial() {
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                showTestimonial(currentIndex);
            }
            
            // Set up testimonial navigation
            const nextButton = testimonialSlider.querySelector('.next-btn');
            const prevButton = testimonialSlider.querySelector('.prev-btn');
            
            if (nextButton && prevButton) {
                nextButton.addEventListener('click', nextTestimonial);
                prevButton.addEventListener('click', prevTestimonial);
            }
            
            // Auto-rotate testimonials
            setInterval(nextTestimonial, 5000);
            
            // Initialize first testimonial
            showTestimonial(0);
        }
    }
    
    function highlightRegion(region) {
        regionCards.forEach(card => {
            const cardRegion = card.querySelector('h3').textContent.toLowerCase();
            
            if (cardRegion.includes(region)) {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                card.style.transition = 'all 0.3s ease';
            }
        });
    }
    
    function resetRegions() {
        regionCards.forEach(card => {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
    }
    
    function initTabs(tabSelector, contentSelector) {
        const tabButtons = document.querySelectorAll(`${tabSelector} .tab-btn`);
        const tabContents = document.querySelectorAll(contentSelector);
        
        if (tabButtons.length && tabContents.length) {
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Hide all tab contents
                    tabContents.forEach(content => {
                        content.style.display = 'none';
                    });
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Show the corresponding tab content
                    const targetId = this.getAttribute('data-target');
                    const targetContent = document.getElementById(targetId);
                    
                    if (targetContent) {
                        targetContent.style.display = 'block';
                    }
                });
            });
            
            // Show the first tab by default
            if (tabButtons.length > 0 && tabContents.length > 0) {
                tabButtons[0].click();
            }
        }
    }
    
    function initFilters(filterSelector, itemSelector) {
        const filterButtons = document.querySelectorAll(`${filterSelector} .filter-btn`);
        const items = document.querySelectorAll(itemSelector);
        
        if (filterButtons.length && items.length) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Show/hide items based on filter
                    const filter = this.getAttribute('data-filter');
                    
                    items.forEach(item => {
                        if (filter === 'all') {
                            item.style.display = 'block';
                        } else {
                            const category = item.getAttribute('data-category');
                            if (category === filter) {
                                item.style.display = 'block';
                            } else {
                                item.style.display = 'none';
                            }
                        }
                    });
                });
            });
            
            // Show all items by default
            if (filterButtons.length > 0) {
                filterButtons[0].click();
            }
        }
    }
    
    function initContactForm() {
        const contactForm = document.querySelector('.contact-form form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Basic form validation
                const nameInput = this.querySelector('input[name="name"]');
                const emailInput = this.querySelector('input[name="email"]');
                const messageInput = this.querySelector('textarea[name="message"]');
                
                if (!nameInput.value.trim()) {
                    showNotification('Please enter your name', 'error');
                    nameInput.focus();
                    return;
                }
                
                if (!emailInput.value.trim()) {
                    showNotification('Please enter your email address', 'error');
                    emailInput.focus();
                    return;
                }
                
                if (!messageInput.value.trim()) {
                    showNotification('Please enter your message', 'error');
                    messageInput.focus();
                    return;
                }
                
                // Simulate form submission success
                contactForm.reset();
                showNotification('Your message has been sent. We will get back to you soon!', 'success');
                
                // In a real application, you would use fetch or XMLHttpRequest to submit the form data to your backend
            });
        }
    }
    
    function showNotification(message, type) {
        // Check if a notification container already exists
        let notificationContainer = document.querySelector('.notification-container');
        
        // If not, create one
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
            
            // Add styles to the notification container
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
        }
        
        // Create the notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles to the notification
        notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#E53935';
        notification.style.color = 'white';
        notification.style.padding = '12px 24px';
        notification.style.marginTop = '10px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        notification.style.fontWeight = '500';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.style.transition = 'all 0.3s ease';
        
        // Add the notification to the container
        notificationContainer.appendChild(notification);
        
        // Trigger the animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove the notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            // Remove from the DOM after the transition completes
            setTimeout(() => {
                notification.remove();
                
                // Remove the container if there are no more notifications
                if (notificationContainer.children.length === 0) {
                    notificationContainer.remove();
                }
            }, 300);
        }, 5000);
    }
    
    // Check for dark mode preference and apply theme if needed
    function checkDarkMode() {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (prefersDarkMode && !savedTheme)) {
            document.body.classList.add('dark-theme');
        }
    }
    
    // Initialize dark mode check
    checkDarkMode();
    
    // Handle form submissions to prevent page reload
    document.querySelectorAll('form').forEach(form => {
        if (!form.classList.contains('newsletter-form') && !form.closest('.contact-form')) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Form submission successful!', 'success');
                form.reset();
            });
        }
    });
    
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.feature-card, .involvement-card, .news-card, .region-card, .partner');
    
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Set initial state for animations
    if (animatedElements.length) {
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        // Check positions on load
        checkScroll();
        
        // Check positions on scroll
        window.addEventListener('scroll', checkScroll);
    }
    
    // Add classes to links matching current page
    const currentPage = window.location.pathname.split('/').pop();
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Handle region map interactions (ENHANCED - works with both static and interactive maps)
    const staticMap = document.querySelector('.regions-map img');
    
    if (staticMap) {
        // Add hover effect for static map regions
        staticMap.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate relative position (percentage)
            const relX = x / rect.width;
            const relY = y / rect.height;
            
            // Check which region was hovered (approximate)
            if (relY > 0.3 && relY < 0.5 && relX > 0.1 && relX < 0.3) {
                highlightRegion('cameroon');
            } else if (relY > 0.5 && relY < 0.7 && relX > 0.3 && relX < 0.4) {
                highlightRegion('drc');
            } else {
                resetRegions();
            }
        });
        
        staticMap.addEventListener('mouseleave', resetRegions);
    }
    
    // Handle project or news item search
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        const items = document.querySelectorAll('.project-card, .news-card');
        
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            items.forEach(item => {
                const title = item.querySelector('h3').textContent.toLowerCase();
                const description = item.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(query) || description.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Add debugging to check if mobile menu toggle is working
    console.log('Mobile menu elements:', {
        toggle: mobileMenuToggle,
        navLinks: navLinks
    });
    
    // Add a class to the body when the page is fully loaded
    document.body.classList.add('page-loaded');
    
    console.log('WADABA JavaScript initialized successfully');
});