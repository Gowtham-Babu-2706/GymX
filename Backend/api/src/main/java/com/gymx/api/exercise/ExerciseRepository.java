package com.gymx.api.exercise;

import com.gymx.api.exercise.enums.Equipment;
import com.gymx.api.exercise.enums.Muscle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise,Long> {
    @Query("""
        SELECT e FROM Exercise e
        WHERE (:muscleGroup IS NULL OR e.primaryMuscle = :muscleGroup)
          AND (:equipment IS NULL OR e.equipment = :equipment)
          AND (:search IS NULL OR
               LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    List<Exercise> searchExercises(
            @Param("muscleGroup") Muscle muscleGroup,
            @Param("equipment") Equipment equipment,
            @Param("search") String search
    );
}
