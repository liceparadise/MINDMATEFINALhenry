# MindMate - Mental Health Tracking Application

MindMate is a comprehensive mental health tracking application that helps users monitor their mood, maintain a personal journal, and gain insights into their emotional well-being through analytics and visualizations.

## Project Structure

```
mindmate/
├── backend/                 # Django REST API backend
│   ├── mindmate/           # Django project settings
│   ├── mood_tracker/       # Main application
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # API serializers
│   │   ├── api_views.py    # API viewsets
│   │   ├── api_urls.py     # API URL routing
│   │   └── views.py        # Web views
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.js      # Vite configuration
│   └── index.html          # HTML template
└── README.md               # This file
```

## Features

### Backend (Django REST API)
- **User Authentication**: Registration, login, and profile management
- **Mood Tracking**: Record daily mood levels with optional notes
- **Journal Entries**: Write and manage personal journal entries
- **Analytics**: Mood statistics and history tracking
- **Data Export**: Export mood data as CSV
- **RESTful API**: Complete API for frontend integration

### Frontend (React)
- **Modern UI**: Clean, responsive design with Bootstrap
- **Dashboard**: Overview of recent activities and statistics
- **Mood Tracking**: Interactive mood selection interface
- **Analytics**: Charts and visualizations using Chart.js
- **Journal Management**: Create, view, and search journal entries
- **Profile Management**: User profile and settings
- **Protected Routes**: Authentication-based navigation

## Technology Stack

### Backend
- **Django 5.2.3**: Web framework
- **Django REST Framework**: API development
- **SQLite**: Database (development)
- **Django CORS Headers**: Cross-origin resource sharing
- **Python 3.12**: Programming language

### Frontend
- **React 18**: JavaScript library
- **Vite**: Build tool and development server
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **Chart.js**: Data visualization
- **Bootstrap 5**: CSS framework
- **Font Awesome**: Icons

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   python manage.py migrate
   ```

4. Create a superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

   The backend API will be available at `http://127.0.0.1:8000/`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173/`

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/change-password/` - Change password

### Users
- `GET /api/users/` - List users
- `GET /api/users/{id}/` - Get user details
- `PATCH /api/users/{id}/` - Update user profile

### Mood Entries
- `GET /api/mood-entries/` - List mood entries
- `POST /api/mood-entries/` - Create mood entry
- `GET /api/mood-entries/{id}/` - Get mood entry details
- `GET /api/mood-entries/recent/` - Get recent mood entries
- `GET /api/mood-entries/history/` - Get mood history
- `GET /api/mood-entries/stats/` - Get mood statistics
- `GET /api/mood-entries/export/` - Export mood data as CSV

### Journals
- `GET /api/journals/` - List journal entries
- `POST /api/journals/` - Create journal entry
- `GET /api/journals/{id}/` - Get journal details
- `PUT /api/journals/{id}/` - Update journal entry
- `DELETE /api/journals/{id}/` - Delete journal entry

### Reminders
- `GET /api/reminders/` - List reminders
- `POST /api/reminders/` - Create reminder
- `GET /api/reminders/{id}/` - Get reminder details
- `PUT /api/reminders/{id}/` - Update reminder
- `DELETE /api/reminders/{id}/` - Delete reminder

## Development Notes

### Database Models
- **User**: Extended Django user model with additional fields
- **MoodEntry**: Daily mood tracking with levels 1-5
- **Journal**: Personal journal entries with optional mood association
- **Reminder**: User reminders for mood tracking

### Authentication
- Token-based authentication using Django REST Framework
- Protected routes require valid authentication token

### CORS Configuration
- Backend configured to accept requests from frontend development server
- CORS headers properly set for cross-origin requests

## Current Status

✅ **Backend Complete**: Django REST API with all endpoints functional  
✅ **Frontend Structure**: React application with all components created  
✅ **Database**: Models and migrations set up  

## Future Enhancements

- **Advanced Analytics**: Machine learning insights
- **Social Features**: Share progress with friends/therapists
- **Notifications**: Push notifications for mood tracking reminders
- **Data Backup**: Cloud backup and sync
- **Themes**: Dark mode and custom themes
- **Export Options**: PDF reports and data export
