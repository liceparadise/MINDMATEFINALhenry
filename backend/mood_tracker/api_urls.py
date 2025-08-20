from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', api_views.UserViewSet, basename='user')
router.register(r'moods', api_views.MoodEntryViewSet, basename='mood')
router.register(r'journals', api_views.JournalViewSet, basename='journal')
router.register(r'reminders', api_views.ReminderViewSet, basename='reminder')
router.register(r'achievements', api_views.AchievementViewSet, basename='achievement')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]