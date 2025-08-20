from django.core.management.base import BaseCommand
from django.utils import timezone
from mood_tracker.models import User, MoodEntry
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Initialize demo data for MindMate'

    def handle(self, *args, **kwargs):
        # Create or update demo user
        user, created = User.objects.update_or_create(
            uid='demo-user',
            defaults={
                'email': 'demo@mindmate.com',
                'username': 'Demo User'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('Created demo user'))

        # Generate mood entries for today and the last 7 days
        now = timezone.now()
        # Ensure we're using current year
        current_year = now.year
        today = now.replace(year=current_year).date()
        moods = ['happy', 'calm', 'neutral', 'tired', 'anxious']
        
        # Delete existing mood entries for demo user
        MoodEntry.objects.filter(user=user).delete()

        # Create new mood entries with realistic timestamps
        for i in range(8):  # Include today
            date = today - timedelta(days=i)
            # Create 2-4 entries per day at different times
            num_entries = random.randint(2, 4)
            for j in range(num_entries):
                # Create entries at different times throughout the day
                if i == 0:  # Today's entries
                    max_hour = now.hour
                    hour = random.randint(8, max(8, max_hour))
                else:
                    hour = random.randint(8, 20)  # Between 8 AM and 8 PM
                minute = random.randint(0, 59)
                # Create timestamp with current year
                entry_datetime = now.replace(
                    year=current_year,
                    month=date.month,
                    day=date.day,
                    hour=hour,
                    minute=minute
                )
                entry_time = entry_datetime.time()
                
                # Generate more meaningful notes
                mood = random.choice(moods)
                notes = {
                    'happy': [
                        'Had a productive day!',
                        'Feeling accomplished and energetic',
                        'Great progress on my projects',
                        'Enjoyed time with friends'
                    ],
                    'calm': [
                        'Meditation session was helpful',
                        'Peaceful day with good balance',
                        'Feeling centered and relaxed',
                        'Nice quiet time to reflect'
                    ],
                    'neutral': [
                        'Average day, nothing special',
                        'Going through the routine',
                        'Steady and stable mood',
                        'Just taking it day by day'
                    ],
                    'tired': [
                        'Need to improve sleep schedule',
                        'Long day of work and study',
                        'Could use some rest',
                        'Feeling drained but managing'
                    ],
                    'anxious': [
                        'Upcoming deadlines on my mind',
                        'Feeling a bit overwhelmed',
                        'Need to practice some breathing exercises',
                        'Working on managing stress'
                    ]
                }
                
                MoodEntry.objects.create(
                    user=user,
                    date=date,
                    time=entry_time,
                    mood=mood,
                    intensity=random.randint(3, 8),  # More realistic range
                    notes=random.choice(notes[mood])
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully created demo mood entries')
        )