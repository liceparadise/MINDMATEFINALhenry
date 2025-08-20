from django.db import models
from django.utils import timezone
import uuid

# Create your models here.
class User(models.Model):
    """
    User model representing registered users in the MindMate application.
    
    This model stores user authentication and profile information,
    including Firebase UID, email, username, and optional profile picture.
    """
    uid = models.CharField(max_length=128, primary_key=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128, null=True)  # Store hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    fcm_token = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    
    def __str__(self):
        """
        Return string representation of the user.
        
        Returns:
            str: The username of the user.
        """
        return self.username

class MoodEntry(models.Model):
    """
    Model representing a user's mood entry.
    
    Stores information about a user's mood at a specific date and time,
    including mood type, intensity level, and optional notes.
    """
    MOOD_CHOICES = [
        ('very_happy', 'Very Happy'),
        ('happy', 'Happy'),
        ('excited', 'Excited'),
        ('calm', 'Calm'),
        ('content', 'Content'),
        ('neutral', 'Neutral'),
        ('tired', 'Tired'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('anxious', 'Anxious'),
        ('stressed', 'Stressed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_entries')
    date = models.DateField(default=timezone.now)
    time = models.TimeField(default=timezone.now)
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    intensity = models.IntegerField(default=5)  # Scale of 1-10
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-date', '-time']
        verbose_name_plural = 'Mood Entries'
    
    def __str__(self):
        """
        Return string representation of the mood entry.
        
        Returns:
            str: A formatted string showing the user and date of the mood entry.
        """
        return f"{self.user.username}'s mood on {self.date}"

class Journal(models.Model):
    """
    Model representing a user's journal entry.
    
    Stores journal content that can be optionally linked to a mood entry,
    allowing users to write detailed reflections about their emotional state.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journals')
    mood_entry = models.OneToOneField(MoodEntry, on_delete=models.CASCADE, related_name='journal', null=True, blank=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        """
        Return string representation of the journal entry.
        
        Returns:
            str: A formatted string showing the user and creation date of the journal.
        """
        return f"{self.user.username}'s journal on {self.created_at.date()}"

class Reminder(models.Model):
    """
    Model representing a user's mood tracking reminder.
    
    Stores reminder settings including time and days of the week
    when the user wants to be reminded to track their mood.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    time = models.TimeField()
    days = models.CharField(max_length=100)  # Stored as comma-separated values (e.g., "0,1,3" for Monday, Tuesday, Thursday)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        """
        Return string representation of the reminder.
        
        Returns:
            str: A formatted string showing the user and time of the reminder.
        """
        return f"{self.user.username}'s reminder at {self.time}"

class Achievement(models.Model):
    """
    Model representing an achievement that users can unlock.
    
    Defines various types of achievements based on user activity,
    such as mood tracking streaks, journal entries, and consistency milestones.
    """
    ACHIEVEMENT_TYPES = [
        ('mood_streak', 'Mood Streak'),
        ('journal_count', 'Journal Count'),
        ('mood_count', 'Mood Count'),
        ('consistency', 'Consistency'),
        ('milestone', 'Milestone'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='fas fa-trophy')  # FontAwesome icon class
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    requirement_value = models.IntegerField()  # The target value to unlock
    points = models.IntegerField(default=10)  # Points awarded for this achievement
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['achievement_type', 'requirement_value']
    
    def __str__(self):
        """
        Return string representation of the achievement.
        
        Returns:
            str: The name of the achievement.
        """
        return self.name

class UserAchievement(models.Model):
    """
    Model representing a user's unlocked achievement.
    
    Links users to achievements they have earned, storing the timestamp
    when the achievement was unlocked.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']
    
    def __str__(self):
        """
        Return string representation of the user achievement.
        
        Returns:
            str: A formatted string showing the user and achievement name.
        """
        return f"{self.user.username} - {self.achievement.name}"
