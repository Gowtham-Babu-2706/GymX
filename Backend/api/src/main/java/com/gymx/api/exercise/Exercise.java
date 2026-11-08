package com.gymx.api.exercise;

import com.gymx.api.exercise.enums.Difficulty;
import com.gymx.api.exercise.enums.Equipment;
import com.gymx.api.exercise.enums.Muscle;
import com.gymx.api.exercise.entity.ExerciseInstructionEntity;
import com.gymx.api.exercise.entity.ExerciseSecondaryMuscleEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


//id	Long	1
//name	String	`Bench Press
//description	String	Press the bar from chest level
//primaryMuscle	Enum	CHEST
//secondaryMuscles	List of enums	TRICEPS, SHOULDERS
//equipment	Enum	BARBELL
//difficulty	Enum	INTERMEDIATE
//instructions	List of strings	Step-by-step guidance
// imageUrl	String, nullable	Exercise demonstration image
//createdAt	Timestamp	Creation time


@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private Muscle primaryMuscle;

    @OneToMany(mappedBy = "exercise",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<ExerciseSecondaryMuscleEntity> secondaryMuscle = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @OneToMany(mappedBy = "exercise",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<ExerciseInstructionEntity> instructions = new ArrayList<>();

    private String imageUrl;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate()
    {
        createdAt=LocalDateTime.now();
    }
}
