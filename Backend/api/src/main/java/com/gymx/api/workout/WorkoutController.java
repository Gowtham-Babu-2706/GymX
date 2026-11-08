package com.gymx.api.workout;

import com.gymx.api.workout.dto.CreateWorkoutRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

//POST /api/workouts — Create a workout
//GET /api/workouts — Get all my workouts
//GET /api/workouts/{id} — Get a specific workout
//PUT /api/workouts/{id} — Update a workout
//DELETE /api/workouts/{id} — Delete a workout

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<Workout> createWorkout(
            @RequestBody CreateWorkoutRequest body,
            Principal principal) {

        return ResponseEntity.ok(
                workoutService.createWorkout(body, principal.getName())
        );
    }

    @GetMapping
    public ResponseEntity<List<Workout>> getAllWorkouts(
            Principal principal) {

        return ResponseEntity.ok(
                workoutService.getAllWorkouts(principal.getName())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(
            @PathVariable Long id,
            Principal principal) {

        return ResponseEntity.ok(
                workoutService.getWorkoutById(id, principal.getName())
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(
            @PathVariable Long id,
            @RequestBody CreateWorkoutRequest body,
            Principal principal) {

        return ResponseEntity.ok(
                workoutService.updateWorkout(
                        id, body, principal.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable Long id,
            Principal principal) {

        workoutService.deleteWorkout(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
