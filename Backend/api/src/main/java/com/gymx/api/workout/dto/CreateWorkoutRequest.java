package com.gymx.api.workout.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CreateWorkoutRequest {

    private String title;
    private LocalDate workoutDate;
    private String notes;
    private List<WorkoutExerciseRequest> exercises;
}