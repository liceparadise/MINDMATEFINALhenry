from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import models
from django.http import HttpResponse
import datetime
import json
import csv

from .models import User, MoodEntry, Journal, Reminder, Achievement, UserAchievement
from .serializers import (
    UserSerializer, MoodEntrySerializer, JournalSerializer, 
    ReminderSerializer, MoodStatsSerializer, MoodHistorySerializer
)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for user information.
    
    Provides read-only access to user data for authenticated users.
    Users can only access their own information.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset to return only the current user's data.
        
        Returns:
            QuerySet: User objects filtered by current session user_id.
        """
        # Users can only see their own data
        return User.objects.filter(uid=self.request.session.get('user_id'))
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current authenticated user's information.
        
        Args:
            request: Django REST framework Request object.
            
        Returns:
            Response: Serialized user data or error message.
        """
        try:
            user = User.objects.get(uid=request.session.get('user_id'))
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class MoodEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for mood entries.
    
    Provides full CRUD operations for mood entries, with additional
    actions for statistics, history, and data export.
    """
    serializer_class = MoodEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset to return only the current user's mood entries.
        
        Returns:
            QuerySet: MoodEntry objects ordered by date and time (newest first).
        """
        user = User.objects.get(uid=self.request.session.get('user_id'))
        return MoodEntry.objects.filter(user=user).order_by('-date', '-time')
    
    def perform_create(self, serializer):
        """
        Set the user field when creating a new mood entry.
        
        Args:
            serializer: MoodEntrySerializer instance with validated data.
        """
        user = User.objects.get(uid=self.request.session.get('user_id'))
        serializer.save(user=user)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for achievements.
    
    Provides read-only access to achievements with user progress tracking
    and unlock status information.
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Get all active achievements.
        
        Returns:
            QuerySet: Active Achievement objects.
        """
        return Achievement.objects.filter(is_active=True)
    
    @action(detail=False, methods=['get'])
    def user_achievements(self, request):
        """
        Get all achievements with user's unlock status and progress.
        
        Calculates current progress toward each achievement and returns
        comprehensive achievement data including unlock status.
        
        Args:
            request: Django REST framework Request object.
            
        Returns:
            Response: Achievement data with progress and unlock information.
        """
        try:
            user = User.objects.get(uid=request.session.get('user_id'))
            
            # Get all achievements
            all_achievements = Achievement.objects.filter(is_active=True)
            
            # Get user's unlocked achievements
            user_achievements = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
            
            # Calculate user's current progress for each achievement type
            user_stats = {
                'mood_count': MoodEntry.objects.filter(user=user).count(),
                'journal_count': Journal.objects.filter(user=user).count(),
                'mood_streak': self.calculate_mood_streak(user),
                'consistency': self.calculate_consistency(user),
            }
            
            # Prepare achievement data with unlock status and progress
            achievement_data = []
            for achievement in all_achievements:
                is_unlocked = achievement.id in user_achievements
                current_progress = user_stats.get(achievement.achievement_type, 0)
                progress_percentage = min(100, (current_progress / achievement.requirement_value) * 100) if achievement.requirement_value > 0 else 0
                
                unlocked_at = None
                if is_unlocked:
                    user_achievement = UserAchievement.objects.filter(user=user, achievement=achievement).first()
                    unlocked_at = user_achievement.unlocked_at if user_achievement else None
                
                achievement_data.append({
                    'achievement': {
                        'id': str(achievement.id),
                        'name': achievement.name,
                        'description': achievement.description,
                        'icon': achievement.icon,
                        'achievement_type': achievement.achievement_type,
                        'requirement_value': achievement.requirement_value,
                        'points': achievement.points,
                    },
                    'is_unlocked': is_unlocked,
                    'current_progress': current_progress,
                    'progress_percentage': progress_percentage,
                    'unlocked_at': unlocked_at
                })
            
            response_data = {
                'achievement_data': achievement_data,
                'total_achievements': len(all_achievements),
                'unlocked_count': len(user_achievements),
            }
            
            return Response(response_data)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def calculate_mood_streak(self, user):
        """
        Calculate the current consecutive day streak of mood entries.
        
        Args:
            user: User object to calculate streak for.
            
        Returns:
            int: Number of consecutive days with mood entries.
        """
        mood_entries = MoodEntry.objects.filter(user=user).order_by('-date')
        if not mood_entries:
            return 0
        
        streak = 0
        current_date = timezone.now().date()
        
        for entry in mood_entries:
            if entry.date == current_date:
                streak += 1
                current_date -= datetime.timedelta(days=1)
            else:
                break
        
        return streak
    
    def calculate_consistency(self, user):
        """
        Calculate user's mood tracking consistency over the last 30 days.
        
        Args:
            user: User object to calculate consistency for.
            
        Returns:
            int: Number of unique days with mood entries in the last 30 days.
        """
        thirty_days_ago = timezone.now().date() - datetime.timedelta(days=30)
        mood_dates = MoodEntry.objects.filter(
            user=user, 
            date__gte=thirty_days_ago
        ).values_list('date', flat=True).distinct()
        
        return len(mood_dates)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent mood entries from the last 7 days.
        
        Args:
            request: Django REST framework Request object.
            
        Returns:
            Response: Serialized recent mood entries (up to 10 entries).
        """
        user = User.objects.get(uid=request.session.get('user_id'))
        week_ago = timezone.now().date() - datetime.timedelta(days=7)
        
        recent_moods = MoodEntry.objects.filter(
            user=user,
            date__gte=week_ago
        ).order_by('-date', '-time')[:10]
        
        serializer = self.get_serializer(recent_moods, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Get mood history with formatted data for charts and visualization.
        
        Supports date range filtering via query parameters and returns
        data formatted for line charts and mood distribution charts.
        
        Args:
            request: Django REST framework Request object with optional
                    start_date and end_date query parameters.
            
        Returns:
            Response: Mood history data formatted for charts.
        """
        user = User.objects.get(uid=request.session.get('user_id'))
        
        # Get date range from request or default to last 30 days
        end_date = timezone.now().date()
        start_date = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            start_date = end_date - datetime.timedelta(days=30)
        
        if end_date_param:
            end_date = datetime.datetime.strptime(end_date_param, '%Y-%m-%d').date()
        
        # Get mood entries for the date range
        mood_entries = MoodEntry.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date', 'time')
        
        # Format data for charts
        dates = [entry.date.strftime('%Y-%m-%d') for entry in mood_entries]
        intensities = [entry.intensity for entry in mood_entries]
        moods = [entry.get_mood_display() for entry in mood_entries]
        
        # Calculate mood distribution
        mood_counts = mood_entries.values('mood').annotate(
            count=models.Count('mood')
        ).order_by('mood')
        
        mood_labels = []
        mood_count_values = []
        
        for mood_count in mood_counts:
            mood_key = mood_count['mood']
            mood_display = dict(MoodEntry.MOOD_CHOICES).get(mood_key, mood_key)
            mood_labels.append(mood_display)
            mood_count_values.append(mood_count['count'])
        
        data = {
            'dates': dates,
            'intensities': intensities,
            'moods': moods,
            'mood_labels': mood_labels,
            'mood_counts': mood_count_values,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d')
        }
        
        serializer = MoodHistorySerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get comprehensive mood statistics for a date range.
        
        Calculates mood distribution, average intensity, and total entries
        for the specified or default date range.
        
        Args:
            request: Django REST framework Request object with optional
                    start_date query parameter.
            
        Returns:
            Response: Mood statistics including distribution and averages.
        """
        user = User.objects.get(uid=request.session.get('user_id'))
        
        # Get date range
        end_date = timezone.now().date()
        start_date = request.query_params.get('start_date')
        if start_date:
            start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
        else:
            start_date = end_date - datetime.timedelta(days=30)
        
        mood_entries = MoodEntry.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        # Calculate statistics
        mood_distribution = {}
        for choice in MoodEntry.MOOD_CHOICES:
            count = mood_entries.filter(mood=choice[0]).count()
            mood_distribution[choice[1]] = count
        
        avg_intensity = mood_entries.aggregate(
            avg=models.Avg('intensity')
        )['avg'] or 0
        
        data = {
            'mood_distribution': mood_distribution,
            'average_intensity': round(avg_intensity, 2),
            'total_entries': mood_entries.count(),
            'date_range': {
                'start': start_date.strftime('%Y-%m-%d'),
                'end': end_date.strftime('%Y-%m-%d')
            }
        }
        
        serializer = MoodStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export all user's mood data as a CSV file.
        
        Creates a downloadable CSV file containing all mood entries
        with date, time, mood, intensity, and notes.
        
        Args:
            request: Django REST framework Request object.
            
        Returns:
            HttpResponse: CSV file download response.
        """
        user = User.objects.get(uid=request.session.get('user_id'))
        mood_entries = MoodEntry.objects.filter(user=user).order_by('date', 'time')
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="mood_data_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Time', 'Mood', 'Intensity', 'Notes'])
        
        for entry in mood_entries:
            writer.writerow([
                entry.date,
                entry.time,
                entry.get_mood_display(),
                entry.intensity,
                entry.notes or ''
            ])
        
        return response


class JournalViewSet(viewsets.ModelViewSet):
    """
    API endpoint for journal entries.
    
    Provides full CRUD operations for journal entries with
    data export functionality.
    """
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset to return only the current user's journal entries.
        
        Returns:
            QuerySet: Journal objects ordered by creation date (newest first).
        """
        user = User.objects.get(uid=self.request.session.get('user_id'))
        return Journal.objects.filter(user=user).order_by('-created_at')
    
    def perform_create(self, serializer):
        """
        Set the user field when creating a new journal entry.
        
        Args:
            serializer: JournalSerializer instance with validated data.
        """
        user = User.objects.get(uid=self.request.session.get('user_id'))
        serializer.save(user=user)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export all user's journal data as a CSV file.
        
        Creates a downloadable CSV file containing all journal entries
        with date, title, and content.
        
        Args:
            request: Django REST framework Request object.
            
        Returns:
            HttpResponse: CSV file download response.
        """
        user = User.objects.get(uid=request.session.get('user_id'))
        journals = Journal.objects.filter(user=user).order_by('created_at')
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="journal_data_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Title', 'Content'])
        
        for journal in journals:
            writer.writerow([
                journal.created_at.date(),
                journal.title or '',
                journal.content
            ])
        
        return response


class ReminderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reminders.
    
    Provides full CRUD operations for mood tracking reminders,
    allowing users to manage their notification preferences.
    """
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset to return only the current user's reminders.
        
        Returns:
            QuerySet: Reminder objects ordered by time.
        """
        user = User.objects.get(uid=self.request.session.get('user_id'))
        return Reminder.objects.filter(user=user).order_by('time')
    
    def perform_create(self, serializer):
        """
        Set the user field when creating a new reminder.
        
        Args:
            serializer: ReminderSerializer instance with validated data.
        """
        user = User.objects.get(uid=self.request.session.get('user_id'))
        serializer.save(user=user)