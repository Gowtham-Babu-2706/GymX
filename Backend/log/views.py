from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Exercise, Workout
from .serializers import ExerciseSerializer, WorkoutSerializer
from .serializers import UserSerializer 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


User = get_user_model()


class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class WorkoutViewSet(viewsets.ModelViewSet):
    # fallback queryset (get_queryset will return the real set)
    queryset = Workout.objects.none()
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # anonymous users get empty queryset
        if user.is_anonymous:
            return Workout.objects.none()
        # staff see all, normal users only their workouts
        if user.is_staff:
            return Workout.objects.all()
        return Workout.objects.filter(user=user)

    def perform_create(self, serializer):
        """
        Ensure the workout is saved under the requesting user.
        If an admin is creating on behalf of someone else you can allow it
        by passing 'user' in request.data and checking permissions explicitly.
        """
        serializer.save(user=self.request.user)


class UserWorkoutList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        target_user = get_object_or_404(User, pk=user_id)

        # only staff or the requested user may view this list
        if not (request.user.is_staff or request.user == target_user):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        qs = Workout.objects.filter(user=target_user).order_by('-date')
        serializer = WorkoutSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)




class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        # request.user is available because of IsAuthenticated permission
        serializer = self.serializer_class(request.user)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()

    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
