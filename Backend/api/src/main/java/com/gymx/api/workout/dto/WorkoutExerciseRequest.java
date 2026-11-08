package com.gymx.api.workout.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WorkoutExerciseRequest {

    private Long exerciseId;
    private String exerciseName;
    private String primaryMuscle;
    private String equipment;
    private Integer displayOrder;
    private List<WorkoutSetRequest> sets;
}