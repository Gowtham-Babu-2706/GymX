package com.gymx.api.exercise.Dto;

import com.gymx.api.exercise.enums.Difficulty;
import com.gymx.api.exercise.enums.Equipment;
import com.gymx.api.exercise.enums.Muscle;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseResponseDto {

    private Long id;
    private String name;
    private String description;
    private Muscle primaryMuscle;
    private List<Muscle> secondaryMuscles;
    private Equipment equipment;
    private Difficulty difficulty;
    private List<String> instructions;
    private String imageUrl;
    private LocalDateTime createdAt;

}
