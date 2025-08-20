// MindMate - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss alerts
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // Firebase Authentication Setup
    function setupFirebaseAuth() {
        // Check if Firebase is loaded
        if (typeof firebase !== 'undefined') {
            // Listen for auth state changes
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in
                    console.log('User is signed in:', user.uid);
                    // You can update UI elements here if needed
                    
                    // Get the ID token
                    user.getIdToken().then(function(idToken) {
                        // Send the token to your backend via HTTPS
                        // This is where you would typically validate the token on your server
                        sendTokenToBackend(idToken);
                    }).catch(function(error) {
                        console.error('Error getting ID token:', error);
                    });
                } else {
                    // User is signed out
                    console.log('User is signed out');
                    // Update UI for signed out state if needed
                }
            });
        }
    }
    
    // Function to send token to backend
    function sendTokenToBackend(idToken) {
        // Send the token to your Django backend
        fetch('/verify-token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ token: idToken })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Token verification response:', data);
            if (data.success) {
                // Token verified successfully
                // You might want to redirect or update UI here
            }
        })
        .catch(error => {
            console.error('Error verifying token:', error);
        });
    }
    
    // Helper function to get CSRF token from cookies
    function getCookie(name) {
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
    
    // Try to setup Firebase Auth if it's available
    try {
        setupFirebaseAuth();
    } catch (e) {
        console.log('Firebase not initialized yet or not available');
    }
    
    // Handle mood selection in add_mood.html
    const moodOptions = document.querySelectorAll('.mood-option');
    if (moodOptions.length > 0) {
        const moodSelect = document.getElementById('id_mood');
        
        moodOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                moodOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Set the value in the hidden select
                const mood = this.getAttribute('data-mood');
                moodSelect.value = mood;
            });
        });
        
        // Set initial selection if form has a value
        if (moodSelect && moodSelect.value) {
            const selectedOption = document.querySelector(`.mood-option[data-mood="${moodSelect.value}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
    }
    
    // Handle journal prompt selection in add_journal.html
    const promptCards = document.querySelectorAll('.prompt-card');
    if (promptCards.length > 0) {
        const contentField = document.getElementById('id_content');
        
        promptCards.forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('.card-title').textContent;
                const prompt = this.querySelector('.card-text').textContent;
                
                // Set the title if it's empty
                const titleField = document.getElementById('id_title');
                if (titleField && !titleField.value) {
                    titleField.value = title;
                }
                
                // Add the prompt to the content field
                if (contentField) {
                    if (contentField.value) {
                        contentField.value += '\n\n' + prompt + '\n';
                    } else {
                        contentField.value = prompt + '\n';
                    }
                    
                    // Focus on the content field
                    contentField.focus();
                    contentField.setSelectionRange(contentField.value.length, contentField.value.length);
                }
            });
        });
    }
    
    // Handle reminder toggle in reminders.html
    const reminderToggles = document.querySelectorAll('.form-check-input[data-reminder-id]');
    if (reminderToggles.length > 0) {
        reminderToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const reminderId = this.getAttribute('data-reminder-id');
                const isActive = this.checked;
                
                fetch(`/reminders/toggle/${reminderId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ is_active: isActive })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        // Revert the toggle if there was an error
                        this.checked = !isActive;
                        alert('Failed to update reminder status');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.checked = !isActive;
                    alert('An error occurred while updating the reminder');
                });
            });
        });
    }
    
    // Setup Firebase Notifications (if available)
    function setupFirebaseMessaging() {
        if (typeof firebase !== 'undefined' && firebase.messaging) {
            const messaging = firebase.messaging();
            
            // Request permission for notifications
            messaging.requestPermission()
            .then(function() {
                console.log('Notification permission granted.');
                return messaging.getToken();
            })
            .then(function(token) {
                console.log('FCM Token:', token);
                // Send this token to your server to associate with the user
                sendFCMTokenToServer(token);
            })
            .catch(function(err) {
                console.log('Unable to get permission for notifications.', err);
            });
            
            // Handle incoming messages
            messaging.onMessage(function(payload) {
                console.log('Message received:', payload);
                // You can display a custom notification here
                showCustomNotification(payload);
            });
        }
    }
    
    // Function to send FCM token to server
    function sendFCMTokenToServer(token) {
        fetch('/save-fcm-token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            console.log('FCM token saved:', data);
        })
        .catch(error => {
            console.error('Error saving FCM token:', error);
        });
    }
    
    // Function to show custom notification
    function showCustomNotification(payload) {
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/static/images/logo.png'
        };
        
        if ('Notification' in window) {
            const notification = new Notification(notificationTitle, notificationOptions);
            notification.onclick = function(event) {
                event.preventDefault();
                window.open(payload.notification.click_action, '_blank');
                notification.close();
            };
        }
    }
    
    // Try to setup Firebase Messaging if it's available
    try {
        setupFirebaseMessaging();
    } catch (e) {
        console.log('Firebase Messaging not initialized yet or not available');
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add fade-in animation to elements with .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    observer.unobserve(entry.target);
                }
            });
        });
        
        fadeElements.forEach(element => {
            element.style.opacity = 0;
            element.style.transition = 'opacity 0.5s ease-in-out';
            observer.observe(element);
        });
    }
});