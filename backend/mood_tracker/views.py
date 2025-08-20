from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import csv
import datetime
from io import StringIO
from django.db import models
from functools import wraps
import uuid

from .models import User, MoodEntry, Journal, Reminder, Achievement, UserAchievement
from .forms import SignUpForm, LoginForm, MoodEntryForm, JournalForm, ReminderForm, UserProfileForm


# Helper functions
def check_authenticated(request):
    """
    Check if user is authenticated by verifying session data.
    
    Args:
        request: Django HttpRequest object containing session data.
        
    Returns:
        bool: True if user_id exists in session, False otherwise.
    """
    print('Debug - Session keys:', request.session.keys())
    return 'user_id' in request.session

# Decorator for authentication
def auth_required(view_func):
    """
    Decorator that requires user authentication for view access.
    
    Args:
        view_func: The view function to be decorated.
        
    Returns:
        function: Wrapped view function that checks authentication.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not check_authenticated(request):
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper

def get_current_user(request):
    """
    Retrieve the current authenticated user from the database.
    
    Args:
        request: Django HttpRequest object containing session data.
        
    Returns:
        User: User object if found and authenticated, None otherwise.
    """
    print('Debug - Checking current user')
    if 'user_id' in request.session:
        user_id = request.session['user_id']
        print('Debug - Found user_id in session:', user_id)
        try:
            user = User.objects.get(uid=user_id)
            print('Debug - Found user in database:', user.username)
            return user
        except User.DoesNotExist:
            print('Debug - User not found in database for uid:', user_id)
            return None
    print('Debug - No user_id in session')
    return None

# View functions
def home(request):
    """
    Display the home page for unauthenticated users.
    
    Redirects authenticated users to dashboard, otherwise shows the home page.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered home page or redirect to dashboard.
    """
    if check_authenticated(request):
        return redirect('dashboard')
    return render(request, 'mood_tracker/home.html')

def signup(request):
    """
    Handle user registration with email, username, and password.
    
    Creates a new user account and stores it in the database.
    Redirects authenticated users to dashboard.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered signup page or redirect.
    """
    if check_authenticated(request):
        return redirect('dashboard')
    
    form = SignUpForm()
    
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            username = form.cleaned_data['username']
            
            try:
                # Check if email already exists
                if User.objects.filter(email=email).exists():
                    messages.error(request, 'Email already exists. Please use a different email.')
                    return render(request, 'mood_tracker/signup.html', {'form': form})
                
                # Create user in our database
                # For now, we're storing the password as plain text
                # In a real app, you would use django.contrib.auth.hashers to hash passwords
                user = User.objects.create(
                    uid=str(uuid.uuid4()),
                    email=email,
                    username=username,
                    password=password
                )
                
                messages.success(request, 'Account created successfully! Please log in.')
                return redirect('login')
            except Exception as e:
                messages.error(request, f'Error creating account: {str(e)}')
    
    return render(request, 'mood_tracker/signup.html', {'form': form})

def login(request):
    """
    Handle user authentication and login.
    
    Validates user credentials and creates a session upon successful login.
    Redirects authenticated users to dashboard.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered login page or redirect.
    """
    if check_authenticated(request):
        return redirect('dashboard')
    
    form = LoginForm()
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            
            try:
                # Check if user exists
                user = User.objects.get(email=email)
                
                # For now, we're using plain text password comparison
                # In a real app, you would use django.contrib.auth.hashers to hash and verify passwords
                if user.password == password:
                    # Store user info in session
                    request.session['user_id'] = user.uid
                    
                    messages.success(request, 'Login successful!')
                    return redirect('dashboard')
                else:
                    messages.error(request, 'Invalid email or password. Please try again.')
            except User.DoesNotExist:
                messages.error(request, 'Invalid email or password. Please try again.')
    
    return render(request, 'mood_tracker/login.html', {'form': form})

def logout(request):
    """
    Handle user logout by clearing session data.
    
    Removes user_id from session and redirects to home page.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Redirect to home page.
    """
    if 'user_id' in request.session:
        del request.session['user_id']
    
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')
    
    messages.success(request, logout_message)
    return redirect('home')

def dashboard(request):
    """
    Display the main dashboard with mood data, statistics, and charts.
    
    Shows recent mood entries, mood trends chart, journal count,
    day streak, and weekly goal progress for authenticated users.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered dashboard page or redirect to login.
    """
    print('Debug - Session:', request.session.items())
    print('Debug - Is authenticated:', request.user.is_authenticated if hasattr(request, 'user') else 'No user attribute')
    
    if not check_authenticated(request):
        print('Debug - Not authenticated, redirecting to login')
        return redirect('login')
    
    user = get_current_user(request)
    print('Debug - Current user:', user.username if user else 'No user found')
    
    if not user:
        print('Debug - No user, redirecting to logout')
        return redirect('logout')
    
    # Get recent mood entries and ensure demo data exists
    today = timezone.now().date()
    week_ago = today - datetime.timedelta(days=7)
    
    # Initialize empty data for new users
    if not MoodEntry.objects.filter(user=user).exists():
        # You can add code here to initialize default data for new users if needed
        pass
    
    # Get recent mood entries, ordered by date and time
    recent_moods = MoodEntry.objects.filter(
        user=user
    ).order_by('-date', '-time')[:5]
    
    # Get mood data for chart (last 7 days)
    mood_data = MoodEntry.objects.filter(
        user=user,
        date__gte=week_ago,
        date__lte=today
    ).order_by('date', 'time')
    
    print('Debug - User:', user.username)
    print('Debug - Date range:', week_ago, 'to', today)
    print('Debug - Found mood entries:', mood_data.count())
    
    # Format data for Chart.js
    dates = [entry.date.strftime('%Y-%m-%d') for entry in mood_data]
    intensities = [entry.intensity for entry in mood_data]
    moods = [entry.get_mood_display() for entry in mood_data]
    
    print('Debug - Chart Data:')
    print('Dates:', dates)
    print('Intensities:', intensities)
    print('Moods:', moods)
    
    # Calculate statistics
    total_journals = Journal.objects.filter(user=user).count()
    
    # Calculate day streak (consecutive days with mood entries)
    day_streak = 0
    current_date = today
    while True:
        if MoodEntry.objects.filter(user=user, date=current_date).exists():
            day_streak += 1
            current_date -= datetime.timedelta(days=1)
        else:
            break
    
    # Calculate weekly goal (percentage of days this week with mood entries)
    days_this_week = (today.weekday() + 1)  # Monday = 0, so +1 for days passed
    mood_days_this_week = MoodEntry.objects.filter(
        user=user,
        date__gte=week_ago,
        date__lte=today
    ).values('date').distinct().count()
    weekly_goal = round((mood_days_this_week / max(days_this_week, 1)) * 100) if days_this_week > 0 else 0
    
    # Ensure we have data before creating the chart
    if not dates:
        print('Debug - No mood data found for chart')
        chart_dates = json.dumps([])
        chart_intensities = json.dumps([])
        chart_moods = json.dumps([])
    else:
        try:
            chart_dates = json.dumps(dates)
            chart_intensities = json.dumps(intensities)
            chart_moods = json.dumps(moods)
            print('Debug - JSON encoded chart data:')
            print('chart_dates:', chart_dates)
            print('chart_intensities:', chart_intensities)
            print('chart_moods:', chart_moods)
        except Exception as e:
            print('Debug - Error encoding chart data:', str(e))
            chart_dates = json.dumps([])
            chart_intensities = json.dumps([])
            chart_moods = json.dumps([])
    
    context = {
        'user': user,
        'recent_moods': recent_moods,
        'chart_dates': chart_dates,
        'chart_intensities': chart_intensities,
        'chart_moods': chart_moods,
        'total_journals': total_journals,
        'day_streak': day_streak,
        'weekly_goal': weekly_goal,
    }
    
    return render(request, 'mood_tracker/dashboard.html', context)

def add_mood(request):
    """
    Handle creation of new mood entries.
    
    Allows authenticated users to record their current mood with
    intensity level and optional notes.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered mood entry form or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    form = MoodEntryForm()
    
    if request.method == 'POST':
        form = MoodEntryForm(request.POST)
        if form.is_valid():
            mood_entry = form.save(commit=False)
            mood_entry.user = user
            mood_entry.date = timezone.now().date()
            mood_entry.time = timezone.now().time()
            mood_entry.save()
            
            messages.success(request, 'Mood recorded successfully!')
            
            # Redirect to journal entry if notes were provided
            if mood_entry.notes:
                return redirect('add_journal', mood_id=mood_entry.id)
            return redirect('dashboard')
    
    return render(request, 'mood_tracker/add_mood.html', {'form': form})

def add_journal(request, mood_id=None):
    """
    Handle creation of new journal entries.
    
    Allows authenticated users to write journal entries, optionally
    linked to a specific mood entry.
    
    Args:
        request: Django HttpRequest object.
        mood_id: Optional UUID of associated mood entry.
        
    Returns:
        HttpResponse: Rendered journal entry form or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    mood_entry = None
    if mood_id:
        mood_entry = get_object_or_404(MoodEntry, id=mood_id, user=user)
    
    form = JournalForm()
    
    if request.method == 'POST':
        form = JournalForm(request.POST)
        if form.is_valid():
            journal = form.save(commit=False)
            journal.user = user
            if mood_entry:
                journal.mood_entry = mood_entry
            journal.save()
            
            messages.success(request, 'Journal entry saved successfully!')
            return redirect('dashboard')
    
    context = {
        'form': form,
        'mood_entry': mood_entry,
    }
    
    return render(request, 'mood_tracker/add_journal.html', context)

def view_journal(request, journal_id):
    """
    Display a specific journal entry for the authenticated user.
    
    Args:
        request: Django HttpRequest object.
        journal_id: UUID of the journal entry to display.
        
    Returns:
        HttpResponse: Rendered journal detail page or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    journal = get_object_or_404(Journal, id=journal_id, user=user)
    
    return render(request, 'mood_tracker/view_journal.html', {'journal': journal})

def journal_list(request):
    """
    Display a list of all journal entries for the authenticated user.
    
    Shows journal entries ordered by creation date (newest first).
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered journal list page or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    journals = Journal.objects.filter(user=user).order_by('-created_at')
    
    return render(request, 'mood_tracker/journal_list.html', {'journals': journals})

def mood_history(request):
    """
    Display mood history with charts and trend analysis.
    
    Shows mood entries over a specified date range with line charts
    for trends and doughnut charts for mood distribution.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered mood history page with charts or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    # Get date range from request or default to last 30 days
    end_date = timezone.now().date()
    start_date = request.GET.get('start_date')
    end_date_param = request.GET.get('end_date')
    
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
    
    # Format data for Chart.js line chart
    dates = [entry.date.strftime('%Y-%m-%d') for entry in mood_entries]
    intensities = [entry.intensity for entry in mood_entries]
    moods = [entry.get_mood_display() for entry in mood_entries]  # This ensures we get the display value
    
    # Calculate mood distribution for doughnut chart
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
    
    context = {
        'mood_entries': mood_entries,
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d'),
        'chart_dates': json.dumps(dates),
        'chart_intensities': json.dumps(intensities),
        'chart_moods': json.dumps(moods),  # Pass the display values to template
        'mood_labels': json.dumps(mood_labels),
        'mood_counts': json.dumps(mood_count_values),
    }

    return render(request, 'mood_tracker/mood_history.html', context)

def manage_reminders(request):
    """
    Handle creation and management of mood tracking reminders.
    
    Allows users to set up recurring reminders for mood tracking
    at specific times and days of the week.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered reminders management page or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    reminders = Reminder.objects.filter(user=user)
    form = ReminderForm()
    
    if request.method == 'POST':
        form = ReminderForm(request.POST)
        if form.is_valid():
            reminder = form.save(commit=False)
            reminder.user = user
            reminder.save()
            
            messages.success(request, 'Reminder added successfully!')
            return redirect('manage_reminders')
    
    context = {
        'reminders': reminders,
        'form': form,
    }
    
    return render(request, 'mood_tracker/manage_reminders.html', context)

def delete_reminder(request, reminder_id):
    """
    Delete a specific reminder for the authenticated user.
    
    Args:
        request: Django HttpRequest object.
        reminder_id: UUID of the reminder to delete.
        
    Returns:
        HttpResponse: Redirect to reminders management page.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    reminder = get_object_or_404(Reminder, id=reminder_id, user=user)
    reminder.delete()
    
    messages.success(request, 'Reminder deleted successfully!')
    return redirect('manage_reminders')

def export_data(request):
    """
    Export user's mood and journal data in CSV format.
    
    Allows users to download their data for backup or analysis purposes.
    Supports exporting mood entries or journal entries separately.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: CSV file download or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    export_type = request.GET.get('type', 'csv')
    data_type = request.GET.get('data', 'mood')
    
    if data_type == 'mood':
        # Export mood data
        mood_entries = MoodEntry.objects.filter(user=user).order_by('date', 'time')
        
        if export_type == 'csv':
            # Create CSV file
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
    
    elif data_type == 'journal':
        # Export journal data
        journals = Journal.objects.filter(user=user).order_by('created_at')
        
        if export_type == 'csv':
            # Create CSV file
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
    
    # If we get here, something went wrong
    messages.error(request, 'Invalid export parameters')
    return redirect('dashboard')

def profile(request):
    """
    Display and handle updates to user profile information.
    
    Shows user statistics, recent activities, and allows profile updates
    including profile picture upload.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered profile page or redirect.
    """
    if not check_authenticated(request):
        return redirect('login')
    
    user = get_current_user(request)
    if not user:
        return redirect('logout')
    
    # Handle profile update
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = UserProfileForm(instance=user)
    
    # Get statistics
    total_entries = MoodEntry.objects.filter(user=user).count()
    total_journals = Journal.objects.filter(user=user).count()
    
    # Get most common mood
    mood_counts = MoodEntry.objects.filter(user=user).values('mood').annotate(
        count=models.Count('mood')
    ).order_by('-count')
    
    most_common_mood = None
    if mood_counts:
        most_common_mood_key = mood_counts[0]['mood']
        most_common_mood = dict(MoodEntry.MOOD_CHOICES).get(most_common_mood_key)
    
    # Get recent activities (mood entries and journals)
    recent_moods = MoodEntry.objects.filter(user=user).order_by('-date', '-time')[:5]
    recent_journals = Journal.objects.filter(user=user).order_by('-created_at')[:5]
    
    # Combine and sort activities by creation date
    recent_activities = []
    for mood in recent_moods:
        mood_datetime = timezone.datetime.combine(mood.date, mood.time)
        mood_datetime = timezone.make_aware(mood_datetime) if timezone.is_naive(mood_datetime) else mood_datetime
        recent_activities.append({
            'type': 'mood',
            'date': mood_datetime,
            'content': f'Mood: {dict(MoodEntry.MOOD_CHOICES).get(mood.mood)}',
            'intensity': mood.intensity
        })
    
    for journal in recent_journals:
        journal_datetime = timezone.make_aware(journal.created_at) if timezone.is_naive(journal.created_at) else journal.created_at
        recent_activities.append({
            'type': 'journal',
            'date': journal_datetime,
            'content': journal.title or 'Untitled Journal Entry',
            'text': journal.content[:100] + '...' if len(journal.content) > 100 else journal.content
        })
    
    # Sort combined activities by date
    recent_activities.sort(key=lambda x: x['date'], reverse=True)
    
    context = {
        'user': user,
        'form': form,
        'total_entries': total_entries,
        'total_journals': total_journals,
        'most_common_mood': most_common_mood,
        'recent_activities': recent_activities[:10]  # Show 10 most recent activities
    }
    
    return render(request, 'mood_tracker/profile.html', context)

@csrf_exempt
@require_POST
def verify_token(request):
    """
    Verify Firebase ID token and create user session.
    
    Validates the provided Firebase ID token and stores user
    information in the session for authentication.
    
    Args:
        request: Django HttpRequest object with JSON body containing token.
        
    Returns:
        JsonResponse: Success/failure status with error details.
    """
    try:
        data = json.loads(request.body)
        id_token = data.get('token')
        
        if not id_token:
            return JsonResponse({'success': False, 'error': 'No token provided'}, status=400)
        
        # Verify the token with Firebase
        decoded_token = auth.get_account_info(id_token)
        user_id = decoded_token['users'][0]['localId']
        
        # Store token in session
        request.session['id_token'] = id_token
        request.session['user_id'] = user_id
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@require_POST
@auth_required
def save_fcm_token(request):
    """
    Save Firebase Cloud Messaging token for push notifications.
    
    Stores the FCM token in the user's profile to enable
    push notifications for mood tracking reminders.
    
    Args:
        request: Django HttpRequest object with JSON body containing token.
        
    Returns:
        JsonResponse: Success/failure status with error details.
    """
    try:
        data = json.loads(request.body)
        token = data.get('token')
        
        if not token:
            return JsonResponse({'success': False, 'error': 'No token provided'}, status=400)
        
        user = get_current_user(request)
        if not user:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        
        # Save the FCM token to the user's record
        user.fcm_token = token
        user.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

def firebase_messaging_sw(request):
    """
    Serve the Firebase Cloud Messaging service worker file.
    
    Returns the service worker JavaScript file required for
    Firebase Cloud Messaging functionality.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        FileResponse: Service worker JavaScript file or 404 error.
    """
    import os
    from django.http import FileResponse
    
    file_path = os.path.join(settings.BASE_DIR, 'firebase-messaging-sw.js')
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), content_type='application/javascript')
    else:
        return HttpResponse('Service worker not found', status=404)

@auth_required
def achievements(request):
    """
    Display all achievements with user's unlock status and progress.
    
    Shows all available achievements, which ones the user has unlocked,
    current progress toward unlocking achievements, and requirements.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Rendered achievements page with progress data.
    """
    user = get_current_user(request)
    if not user:
        return redirect('login')
    
    # Get all achievements
    all_achievements = Achievement.objects.filter(is_active=True)
    
    # Get user's unlocked achievements
    user_achievements = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
    
    # Calculate user's current progress for each achievement type
    user_stats = {
        'mood_count': MoodEntry.objects.filter(user=user).count(),
        'journal_count': Journal.objects.filter(user=user).count(),
        'mood_streak': calculate_mood_streak(user),
        'consistency': calculate_consistency(user),
    }
    
    # Prepare achievement data with unlock status and progress
    achievement_data = []
    for achievement in all_achievements:
        is_unlocked = achievement.id in user_achievements
        current_progress = user_stats.get(achievement.achievement_type, 0)
        progress_percentage = min(100, (current_progress / achievement.requirement_value) * 100) if achievement.requirement_value > 0 else 0
        
        achievement_data.append({
            'achievement': achievement,
            'is_unlocked': is_unlocked,
            'current_progress': current_progress,
            'progress_percentage': progress_percentage,
            'unlocked_at': UserAchievement.objects.filter(user=user, achievement=achievement).first().unlocked_at if is_unlocked else None
        })
    
    context = {
        'achievement_data': achievement_data,
        'user': user,
        'total_achievements': len(all_achievements),
        'unlocked_count': len(user_achievements),
    }
    
    return render(request, 'mood_tracker/achievements.html', context)

def calculate_mood_streak(user):
    """
    Calculate the current consecutive day streak of mood entries.
    
    Counts how many consecutive days (starting from today) the user
    has recorded at least one mood entry.
    
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

def calculate_consistency(user):
    """
    Calculate user's mood tracking consistency over the last 30 days.
    
    Counts the number of unique days in the last 30 days where
    the user recorded at least one mood entry.
    
    Args:
        user: User object to calculate consistency for.
        
    Returns:
        int: Number of days with mood entries in the last 30 days.
    """
    thirty_days_ago = timezone.now().date() - datetime.timedelta(days=30)
    mood_dates = MoodEntry.objects.filter(
        user=user, 
        date__gte=thirty_days_ago
    ).values_list('date', flat=True).distinct()
    
    return len(mood_dates)

def vite_client(request):
    """
    Handle Vite client requests to prevent 404 errors during development.
    
    Returns an empty JavaScript response for Vite's hot module replacement
    client requests when using Vite for frontend development.
    
    Args:
        request: Django HttpRequest object.
        
    Returns:
        HttpResponse: Empty JavaScript response.
    """
    return HttpResponse('', content_type='application/javascript')
