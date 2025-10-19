from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class CustomUser(AbstractUser):
    # Make age optional by default; change null/blank if you want it required.
    age = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(130)],
        help_text="Age in years (0-130)."
    )

    weight = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        help_text="Weight in kilograms (approx)."
    )

    height = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(300)],
        help_text="Height in centimeters (approx)."
    )

    def __str__(self):
        return self.username

class Exercise(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)  # e.g., 'strength', 'cardio'
    default_unit = models.CharField(max_length=20, default='reps')  # 'reps', 'seconds', 'meters', etc.

    def __str__(self):
        return self.name

class Workout(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workouts')
    date = models.DateTimeField()   # time workout started
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Workout {self.id} — {self.user} @ {self.date.date()}"

class WorkoutExercise(models.Model):
    """An exercise instance within a workout (one row per exercise in a workout)."""
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT, related_name='workout_entries')
    order = models.PositiveIntegerField(default=0)  # ordering within the workout
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} in workout {self.workout_id}"

class ExerciseSet(models.Model):
    """Individual set for a given WorkoutExercise."""
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name='sets')
    set_number = models.PositiveIntegerField(validators=[MinValueValidator(1)])  # 1,2,3...
    reps = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    weight = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0)])  # kg or lbs, app-level unit
    duration_seconds = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(0)])  # for timed sets
    rest_seconds = models.PositiveIntegerField(null=True, blank=True)  # rest after this set
    completed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('workout_exercise', 'set_number')
        ordering = ['set_number']

    def __str__(self):
        return f"Set {self.set_number} for WE {self.workout_exercise_id}"
