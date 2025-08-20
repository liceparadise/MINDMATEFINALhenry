from django.core.management.base import BaseCommand
from mood_tracker.models import Achievement

class Command(BaseCommand):
    """
    Django management command to create sample achievements for the MindMate app.
    
    This command creates predefined achievements across different categories:
    - Mood Streak Achievements: For consecutive days of mood tracking
    - Journal Count Achievements: For writing journal entries
    - Mood Count Achievements: For recording mood entries
    - Consistency Achievements: For tracking moods on different days in a month
    - Milestone Achievements: For completing specific app features
    
    Usage:
        python manage.py create_achievements
    """
    help = 'Create sample achievements for the MindMate app'
    
    def handle(self, *args, **options):
        """
        Handle the command execution to create achievements.
        
        Creates predefined achievements in the database, avoiding duplicates
        by using get_or_create. Provides feedback on creation status.
        
        Args:
            *args: Variable length argument list (unused)
            **options: Arbitrary keyword arguments (unused)
        
        Returns:
            None
        """
        achievements_data = [
            # Mood Streak Achievements
            {
                'name': 'First Steps',
                'description': 'Track your mood for 3 consecutive days',
                'icon': 'fas fa-seedling',
                'achievement_type': 'mood_streak',
                'requirement_value': 3,
                'points': 10
            },
            {
                'name': 'Week Warrior',
                'description': 'Maintain a 7-day mood tracking streak',
                'icon': 'fas fa-fire',
                'achievement_type': 'mood_streak',
                'requirement_value': 7,
                'points': 25
            },
            {
                'name': 'Consistency Champion',
                'description': 'Track your mood for 30 consecutive days',
                'icon': 'fas fa-crown',
                'achievement_type': 'mood_streak',
                'requirement_value': 30,
                'points': 100
            },
            {
                'name': 'Streak Master',
                'description': 'Achieve a 100-day mood tracking streak',
                'icon': 'fas fa-trophy',
                'achievement_type': 'mood_streak',
                'requirement_value': 100,
                'points': 500
            },
            
            # Journal Count Achievements
            {
                'name': 'First Thoughts',
                'description': 'Write your first journal entry',
                'icon': 'fas fa-pen',
                'achievement_type': 'journal_count',
                'requirement_value': 1,
                'points': 5
            },
            {
                'name': 'Thoughtful Writer',
                'description': 'Write 10 journal entries',
                'icon': 'fas fa-book-open',
                'achievement_type': 'journal_count',
                'requirement_value': 10,
                'points': 30
            },
            {
                'name': 'Journal Enthusiast',
                'description': 'Write 50 journal entries',
                'icon': 'fas fa-feather-alt',
                'achievement_type': 'journal_count',
                'requirement_value': 50,
                'points': 150
            },
            {
                'name': 'Master Storyteller',
                'description': 'Write 100 journal entries',
                'icon': 'fas fa-scroll',
                'achievement_type': 'journal_count',
                'requirement_value': 100,
                'points': 300
            },
            
            # Mood Count Achievements
            {
                'name': 'Mood Explorer',
                'description': 'Record your first mood entry',
                'icon': 'fas fa-heart',
                'achievement_type': 'mood_count',
                'requirement_value': 1,
                'points': 5
            },
            {
                'name': 'Emotion Tracker',
                'description': 'Record 25 mood entries',
                'icon': 'fas fa-chart-line',
                'achievement_type': 'mood_count',
                'requirement_value': 25,
                'points': 50
            },
            {
                'name': 'Mood Master',
                'description': 'Record 100 mood entries',
                'icon': 'fas fa-brain',
                'achievement_type': 'mood_count',
                'requirement_value': 100,
                'points': 200
            },
            {
                'name': 'Wellness Guru',
                'description': 'Record 500 mood entries',
                'icon': 'fas fa-gem',
                'achievement_type': 'mood_count',
                'requirement_value': 500,
                'points': 1000
            },
            
            # Consistency Achievements
            {
                'name': 'Getting Started',
                'description': 'Track your mood on 5 different days in a month',
                'icon': 'fas fa-calendar-plus',
                'achievement_type': 'consistency',
                'requirement_value': 5,
                'points': 15
            },
            {
                'name': 'Regular Tracker',
                'description': 'Track your mood on 15 different days in a month',
                'icon': 'fas fa-calendar-check',
                'achievement_type': 'consistency',
                'requirement_value': 15,
                'points': 50
            },
            {
                'name': 'Daily Devotee',
                'description': 'Track your mood on 25 different days in a month',
                'icon': 'fas fa-calendar-alt',
                'achievement_type': 'consistency',
                'requirement_value': 25,
                'points': 100
            },
            {
                'name': 'Perfect Month',
                'description': 'Track your mood every day for a full month',
                'icon': 'fas fa-medal',
                'achievement_type': 'consistency',
                'requirement_value': 30,
                'points': 200
            },
            
            # Milestone Achievements
            {
                'name': 'Welcome Aboard',
                'description': 'Complete your profile setup',
                'icon': 'fas fa-user-check',
                'achievement_type': 'milestone',
                'requirement_value': 1,
                'points': 10
            },
            {
                'name': 'Well-Rounded',
                'description': 'Use all main features: mood tracking, journaling, and reminders',
                'icon': 'fas fa-star',
                'achievement_type': 'milestone',
                'requirement_value': 3,
                'points': 75
            }
        ]
        
        created_count = 0
        for achievement_data in achievements_data:
            achievement, created = Achievement.objects.get_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Achievement already exists: {achievement.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} new achievements!')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total achievements in database: {Achievement.objects.count()}')
        )