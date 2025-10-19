from django.db import transaction
from rest_framework import serializers
from .models import Exercise, Workout, WorkoutExercise, ExerciseSet
from django.contrib.auth import get_user_model


User = get_user_model()

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'category', 'default_unit']


class ExerciseSetSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)  # allow id when updating

    class Meta:
        model = ExerciseSet
        fields = ['id', 'set_number', 'reps', 'weight', 'duration_seconds', 'rest_seconds', 'completed']


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    # Accept exercise id for writes; return nested exercise object for reads
    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), write_only=True)
    exercise_detail = ExerciseSerializer(source='exercise', read_only=True)
    sets = ExerciseSetSerializer(many=True)

    id = serializers.IntegerField(required=False)  # allow id for updates

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'exercise', 'exercise_detail', 'order', 'notes', 'sets']

    def validate(self, attrs):
        # Example: ensure order is non-negative (customize to your rules)
        order = attrs.get('order')
        if order is not None and order < 0:
            raise serializers.ValidationError("order must be >= 0")
        return attrs


class WorkoutSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    exercises = WorkoutExerciseSerializer(many=True)

    class Meta:
        model = Workout
        fields = ['id', 'user', 'date', 'notes', 'exercises', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        request = self.context.get('request')
        if request is None or not hasattr(request, 'user'):
            raise serializers.ValidationError("Request with authenticated user is required.")
        user = request.user

        with transaction.atomic():
            workout = Workout.objects.create(user=user, **validated_data)

            for we_data in exercises_data:
                sets_data = we_data.pop('sets', [])
                # pop exercise id (PrimaryKeyRelatedField provided it as instance already)
                exercise = we_data.pop('exercise')
                we = WorkoutExercise.objects.create(workout=workout, exercise=exercise, **we_data)
                for s in sets_data:
                    ExerciseSet.objects.create(workout_exercise=we, **s)

        return workout

    def update(self, instance, validated_data):
        """
        Simple strategy: remove existing nested WorkoutExercise + ExerciseSet
        and recreate from incoming payload. This is straightforward and safe
        for many cases. If you need partial updates of nested objects,
        implement a reconciliation/diff algorithm instead.
        """
        exercises_data = validated_data.pop('exercises', None)
        with transaction.atomic():
            # update top-level fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if exercises_data is not None:
                # delete existing nested items (and cascade exercise sets if cascade is configured)
                # If you need to preserve some nested objects, implement a more advanced diff.
                WorkoutExercise.objects.filter(workout=instance).delete()

                for we_data in exercises_data:
                    sets_data = we_data.pop('sets', [])
                    exercise = we_data.pop('exercise')
                    we = WorkoutExercise.objects.create(workout=instance, exercise=exercise, **we_data)
                    for s in sets_data:
                        ExerciseSet.objects.create(workout_exercise=we, **s)

        return instance
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")
        read_only_fields = ("id", "date_joined")

