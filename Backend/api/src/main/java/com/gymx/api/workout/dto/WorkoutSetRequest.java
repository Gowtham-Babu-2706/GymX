package com.gymx.api.workout.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutSetRequest {

    private Integer setNumber;
    private Integer reps;
    private Double weightKg;
    private Boolean isCompleted;
}