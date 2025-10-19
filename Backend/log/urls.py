# urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
# Assume CurrentUserView is imported along with others in .views
from .views import ExerciseViewSet, WorkoutViewSet, UserWorkoutList, CurrentUserView ,register_user# <-- Add CurrentUserView

router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet, basename='exercise')
router.register(r'workouts', WorkoutViewSet, basename='workout')

urlpatterns = [
    # Custom endpoint: Get workouts of a specific user
    path('users/<int:user_id>/workouts/', UserWorkoutList.as_view(), name='user-workout-list'),
    
    # NEW ENDPOINT: Get details of the current authenticated user
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('register/', register_user, name='register'),
]

# Include router-generated URLs
urlpatterns += router.urls