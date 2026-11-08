
package com.gymx.api.workout;

import com.gymx.api.workout.dto.CreateWorkoutRequest;
import com.gymx.api.user.UserRepository;
import com.gymx.api.user.User;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    public WorkoutService(
            WorkoutRepository workoutRepository,
            UserRepository userRepository) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
    }

    // CREATE WORKOUT
    @Transactional
    public Workout createWorkout(
            CreateWorkoutRequest body,
            String email) {

        User user = getUserByEmail(email);

        Workout workout = new Workout();
        workout.setTitle(body.getTitle() != null && !body.getTitle().isBlank() ? body.getTitle() : "Workout Session");
        workout.setWorkoutDate(body.getWorkoutDate() != null ? body.getWorkoutDate() : java.time.LocalDate.now());
        workout.setNotes(body.getNotes());
        workout.setUser(user);

        List<WorkoutExercise> exercises =
                buildExercises(body, workout);

        workout.setWorkoutExerciseList(exercises);

        return workoutRepository.save(workout);
    }

    // GET ALL MY WORKOUTS
    @Transactional(readOnly = true)
    public List<Workout> getAllWorkouts(String email) {

        User user = getUserByEmail(email);

        return workoutRepository.findAllByUserOrderByWorkoutDateDescIdDesc(user);
    }

    // GET ONE WORKOUT
    @Transactional(readOnly = true)
    public Workout getWorkoutById(
            Long id,
            String email) {

        User user = getUserByEmail(email);

        return workoutRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Workout not found"));
    }

    // UPDATE WORKOUT
    @Transactional
    public Workout updateWorkout(
            Long id,
            CreateWorkoutRequest body,
            String email) {

        User user = getUserByEmail(email);

        Workout workout =
                workoutRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Workout not found"));

        if (body.getTitle() != null && !body.getTitle().isBlank()) {
            workout.setTitle(body.getTitle());
        }
        if (body.getWorkoutDate() != null) {
            workout.setWorkoutDate(body.getWorkoutDate());
        }
        workout.setNotes(body.getNotes());

        List<WorkoutExercise> updatedExercises =
                buildExercises(body, workout);

        if (workout.getWorkoutExerciseList() == null) {
            workout.setWorkoutExerciseList(
                    new ArrayList<>(updatedExercises));
        } else {
            workout.getWorkoutExerciseList().clear();
            workout.getWorkoutExerciseList()
                    .addAll(updatedExercises);
        }

        return workoutRepository.save(workout);
    }

    // DELETE WORKOUT
    @Transactional
    public void deleteWorkout(Long id, String email) {

        User user = getUserByEmail(email);

        Workout workout =
                workoutRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Workout not found"));

        workoutRepository.delete(workout);
    }

    // FIND USER
    private User getUserByEmail(String email) {

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"));
    }

    // CONVERT EXERCISE DTOs AND SET DTOs INTO ENTITIES
    private List<WorkoutExercise> buildExercises(
            CreateWorkoutRequest body,
            Workout workout) {

        if (body.getExercises() == null) {
            return new ArrayList<>();
        }

        List<WorkoutExercise> exercises =
                new ArrayList<>();

        for (var exerciseRequest : body.getExercises()) {

            WorkoutExercise exercise =
                    new WorkoutExercise();

            exercise.setExerciseId(exerciseRequest.getExerciseId());
            exercise.setExerciseName(exerciseRequest.getExerciseName());
            exercise.setPrimaryMuscle(exerciseRequest.getPrimaryMuscle());
            exercise.setEquipment(exerciseRequest.getEquipment());

            exercise.setDisplayOrder(
                    exerciseRequest.getDisplayOrder() != null ? exerciseRequest.getDisplayOrder() : 0);

            exercise.setWorkout(workout);

            List<WorkoutSet> sets =
                    new ArrayList<>();

            if (exerciseRequest.getSets() != null) {

                for (var setRequest : exerciseRequest.getSets()) {

                    WorkoutSet set =
                            new WorkoutSet();

                    set.setSetNumber(setRequest.getSetNumber() != null ? setRequest.getSetNumber() : sets.size() + 1);
                    set.setReps(setRequest.getReps() != null ? setRequest.getReps() : 0);
                    set.setWeightKg(setRequest.getWeightKg() != null ? setRequest.getWeightKg() : 0.0);

                    set.setIsCompleted(
                            Boolean.TRUE.equals(
                                    setRequest.getIsCompleted()));

                    set.setWorkoutExercise(exercise);

                    sets.add(set);
                }
            }

            exercise.setWorkoutSetList(sets);
            exercises.add(exercise);
        }

        return exercises;
    }
}
