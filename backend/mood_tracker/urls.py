from django.urls import path, re_path
from . import views

urlpatterns = [
    # Token verification and FCM URLs
    path('verify-token/', views.verify_token, name='verify_token'),
    path('save-fcm-token/', views.save_fcm_token, name='save_fcm_token'),
    path('firebase-messaging-sw.js', views.firebase_messaging_sw, name='firebase_messaging_sw'),
    # Authentication URLs
    path('', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    
    # Dashboard and mood tracking URLs
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add-mood/', views.add_mood, name='add_mood'),
    path('add-journal/', views.add_journal, name='add_journal'),
    path('add-journal/<uuid:mood_id>/', views.add_journal, name='add_journal'),
    path('journal/<uuid:journal_id>/', views.view_journal, name='view_journal'),
    path('journals/', views.journal_list, name='journal_list'),
    path('mood-history/', views.mood_history, name='mood_history'),
    
    # Reminder URLs
    path('reminders/', views.manage_reminders, name='manage_reminders'),
    path('reminders/delete/<uuid:reminder_id>/', views.delete_reminder, name='delete_reminder'),
    
    # Export URLs
    path('export/', views.export_data, name='export_data'),
    
    # Profile URL
    path('profile/', views.profile, name='profile'),
    
    # Achievements URL
    path('achievements/', views.achievements, name='achievements'),
    
    # Vite client URL
    re_path(r'^@vite/client', views.vite_client, name='vite_client'),
]