from django import forms
from .models import MoodEntry, Journal, Reminder, User

class SignUpForm(forms.Form):
    """
    Form for user registration.
    
    Handles user signup with username, email, password, and password confirmation.
    Includes validation to ensure passwords match.
    """
    username = forms.CharField(max_length=100, required=True, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}))
    password = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'}))
    confirm_password = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm Password'}))
    
    def clean(self):
        """
        Validate that password and confirm_password fields match.
        
        Returns:
            dict: Cleaned form data.
            
        Raises:
            ValidationError: If passwords do not match.
        """
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match")
        
        return cleaned_data

class LoginForm(forms.Form):
    """
    Form for user authentication.
    
    Handles user login with email and password fields.
    """
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}))
    password = forms.CharField(required=True, widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'}))

class MoodEntryForm(forms.ModelForm):
    """
    Form for creating and editing mood entries.
    
    Allows users to select their mood, set intensity level (1-10),
    and add optional notes about their current state.
    """
    class Meta:
        model = MoodEntry
        fields = ['mood', 'intensity', 'notes']
        widgets = {
            'mood': forms.Select(attrs={'class': 'form-control'}),
            'intensity': forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 10, 'type': 'range'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Optional notes about your mood...'}),
        }

class JournalForm(forms.ModelForm):
    """
    Form for creating and editing journal entries.
    
    Allows users to write journal entries with optional titles
    and detailed content about their thoughts and feelings.
    """
    class Meta:
        model = Journal
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Journal Title (Optional)'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 5, 'placeholder': 'What made you feel this way today?'}),
        }

class ReminderForm(forms.ModelForm):
    """
    Form for creating and editing mood tracking reminders.
    
    Allows users to set up recurring reminders with specific times
    and days of the week for mood tracking notifications.
    """
    DAYS_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    days = forms.MultipleChoiceField(
        choices=DAYS_CHOICES,
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'}),
        required=True
    )
    
    class Meta:
        model = Reminder
        fields = ['time', 'days', 'is_active']
        widgets = {
            'time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
    
    def clean_days(self):
        """
        Convert selected days list to comma-separated string.
        
        Returns:
            str: Comma-separated string of selected day numbers.
        """
        days = self.cleaned_data.get('days')
        return ','.join(days)
    
    def __init__(self, *args, **kwargs):
        """
        Initialize the form and set initial days if editing existing reminder.
        
        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        """
        super().__init__(*args, **kwargs)
        if self.instance.pk and self.instance.days:
            self.initial['days'] = self.instance.days.split(',')

class UserProfileForm(forms.ModelForm):
    """
    Form for updating user profile information.
    
    Allows users to update their username, email, and profile picture
    with validation for image file size and type.
    """
    class Meta:
        model = User
        fields = ['username', 'email', 'profile_picture']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'profile_picture': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
        }
    
    def clean_profile_picture(self):
        """
        Validate uploaded profile picture for size and file type.
        
        Returns:
            File: The validated profile picture file.
            
        Raises:
            ValidationError: If file is too large or not an image.
        """
        profile_picture = self.cleaned_data.get('profile_picture')
        if profile_picture:
            if profile_picture.size > 5 * 1024 * 1024:  # 5MB limit
                raise forms.ValidationError('Image file too large ( > 5MB )')
            if not profile_picture.content_type.startswith('image/'):
                raise forms.ValidationError('File is not an image')
        return profile_picture