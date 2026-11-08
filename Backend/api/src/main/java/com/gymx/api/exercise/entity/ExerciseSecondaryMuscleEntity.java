package com.gymx.api.exercise.entity;

import com.gymx.api.exercise.enums.Muscle;
import com.gymx.api.exercise.Exercise;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "exercise_secondary_muscles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseSecondaryMuscleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Muscle muscle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;
}
