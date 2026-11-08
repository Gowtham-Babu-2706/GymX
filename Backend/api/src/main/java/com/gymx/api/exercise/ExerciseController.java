
package com.gymx.api.exercise;

import com.gymx.api.exercise.Dto.ExerciseResponseDto;
import com.gymx.api.exercise.enums.Equipment;
import com.gymx.api.exercise.enums.Muscle;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(
            ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExercisesById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                exerciseService.getExercisesById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAllExercises() {
        return ResponseEntity.ok(
                exerciseService.getAllExercises());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExerciseResponseDto>> searchExercises(
            @RequestParam(required = false) Muscle muscleGroup,
            @RequestParam(required = false) Equipment equipment,
            @RequestParam(required = false) String search) {

        return ResponseEntity.ok(
                exerciseService.searchExercises(
                        muscleGroup, equipment, search));
    }

    @PostMapping
    public ResponseEntity<?> postTheExercise(
            @RequestBody ExerciseResponseDto data) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(exerciseService.postTheExercise(data));
    }
}
