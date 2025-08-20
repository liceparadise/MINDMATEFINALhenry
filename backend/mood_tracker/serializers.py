from rest_framework import serializers
from .models import User, MoodEntry, Journal, Reminder


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    
    Provides serialization for user data with read-only fields
    for system-generated values like uid and timestamps.
    """
    date_joined = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = User
        fields = ['uid', 'email', 'username', 'created_at', 'date_joined']
        read_only_fields = ['uid', 'created_at', 'date_joined']


class MoodEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for MoodEntry model.
    
    Includes mood display name for better readability and
    automatically sets the user from the request context.
    """
    mood_display = serializers.CharField(source='get_mood_display', read_only=True)
    
    class Meta:
        model = MoodEntry
        fields = ['id', 'user', 'mood', 'mood_display', 'intensity', 'notes', 'date', 'time', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        """
        Create a new mood entry with the current user.
        
        Args:
            validated_data: Dictionary of validated field data.
            
        Returns:
            MoodEntry: The created mood entry instance.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class JournalSerializer(serializers.ModelSerializer):
    """
    Serializer for Journal model.
    
    Includes nested mood entry data for complete journal information
    and automatically sets the user from the request context.
    """
    mood_entry_data = MoodEntrySerializer(source='mood_entry', read_only=True)
    
    class Meta:
        model = Journal
        fields = ['id', 'user', 'title', 'content', 'mood_entry', 'mood_entry_data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """
        Create a new journal entry with the current user.
        
        Args:
            validated_data: Dictionary of validated field data.
            
        Returns:
            Journal: The created journal entry instance.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReminderSerializer(serializers.ModelSerializer):
    """
    Serializer for Reminder model.
    
    Handles mood tracking reminder data and automatically
    sets the user from the request context.
    """
    class Meta:
        model = Reminder
        fields = ['id', 'user', 'title', 'message', 'time', 'days_of_week', 'is_active', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        """
        Create a new reminder with the current user.
        
        Args:
            validated_data: Dictionary of validated field data.
            
        Returns:
            Reminder: The created reminder instance.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class MoodStatsSerializer(serializers.Serializer):
    """
    Serializer for mood statistics data.
    
    Handles statistical data including mood distribution,
    average intensity, and date range information.
    """
    mood_distribution = serializers.DictField()
    average_intensity = serializers.FloatField()
    total_entries = serializers.IntegerField()
    date_range = serializers.DictField()


class MoodHistorySerializer(serializers.Serializer):
    """
    Serializer for mood history chart data.
    
    Handles data formatted for visualization including dates,
    intensities, mood labels, and counts for chart rendering.
    """
    dates = serializers.ListField(child=serializers.CharField())
    intensities = serializers.ListField(child=serializers.IntegerField())
    moods = serializers.ListField(child=serializers.CharField())
    mood_labels = serializers.ListField(child=serializers.CharField())
    mood_counts = serializers.ListField(child=serializers.IntegerField())