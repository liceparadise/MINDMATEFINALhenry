// Firebase Cloud Messaging Service Worker

// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Firebase configuration
firebase.initializeApp({
    apiKey: "AIzaSyDNWcYGGJ9VlXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "mindmate-app.firebaseapp.com",
    projectId: "mindmate-app",
    storageBucket: "mindmate-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef",
    measurementId: "G-XXXXXXXXXX"
});

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/static/images/logo.svg'
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});