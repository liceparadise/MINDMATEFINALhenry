from django.apps import AppConfig


class MoodTrackerConfig(AppConfig):
    """
    Django app configuration for the MoodTracker application.
    
    This configuration class defines settings for the mood_tracker Django app,
    including the default auto field type for model primary keys.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mood_tracker'
