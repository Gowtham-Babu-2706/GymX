package com.gymx.api.exercise;

import com.gymx.api.exercise.Dto.ExerciseResponseDto;
import com.gymx.api.exercise.enums.Muscle;
import com.gymx.api.exercise.entity.ExerciseInstructionEntity;
import com.gymx.api.exercise.entity.ExerciseSecondaryMuscleEntity;

import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

public final class ExerciseMapper {

    private ExerciseMapper() {
    }

    public static ExerciseResponseDto toDto(Exercise exercise) {
        List<Muscle> secondaryMuscles = exercise.getSecondaryMuscle() == null
                ? List.of()
                : exercise.getSecondaryMuscle().stream()
                .map(ExerciseSecondaryMuscleEntity::getMuscle)
                .toList();

        List<String> instructions = exercise.getInstructions() == null
                ? List.of()
                : exercise.getInstructions().stream()
                .sorted(Comparator.comparing(ExerciseInstructionEntity::getStepNumber))
                .map(ExerciseInstructionEntity::getInstruction)
                .toList();

        return ExerciseResponseDto.builder()
                .id(exercise.getId())
                .name(exercise.getName())
                .description(exercise.getDescription())
                .primaryMuscle(exercise.getPrimaryMuscle())
                .secondaryMuscles(secondaryMuscles)
                .equipment(exercise.getEquipment())
                .difficulty(exercise.getDifficulty())
                .instructions(instructions)
                .imageUrl(exercise.getImageUrl())
                .createdAt(exercise.getCreatedAt())
                .build();
    }

    public static Exercise toEntity(ExerciseResponseDto data) {
        List<Muscle> secondaryMuscles = data.getSecondaryMuscles() == null
                ? List.of()
                : data.getSecondaryMuscles();

        List<String> instructionTexts = data.getInstructions() == null
                ? List.of()
                : data.getInstructions();

        Exercise exercise = Exercise.builder()
                .id(data.getId())
                .name(data.getName())
                .description(data.getDescription())
                .primaryMuscle(data.getPrimaryMuscle())
                .equipment(data.getEquipment())
                .difficulty(data.getDifficulty())
                .imageUrl(data.getImageUrl())
                .createdAt(data.getCreatedAt())
                .build();

        List<ExerciseSecondaryMuscleEntity> secondaryMuscleEntities =
                secondaryMuscles.stream()
                        .map(muscle -> {
                            ExerciseSecondaryMuscleEntity entity =
                                    new ExerciseSecondaryMuscleEntity();
                            entity.setMuscle(muscle);
                            entity.setExercise(exercise);
                            return entity;
                        })
                        .toList();

        List<ExerciseInstructionEntity> instructionEntities =
                IntStream.range(0, instructionTexts.size())
                        .mapToObj(index -> {
                            ExerciseInstructionEntity entity =
                                    new ExerciseInstructionEntity();
                            entity.setInstruction(instructionTexts.get(index));
                            entity.setStepNumber(index + 1);
                            entity.setExercise(exercise);
                            return entity;
                        })
                        .toList();

        exercise.setSecondaryMuscle(secondaryMuscleEntities);
        exercise.setInstructions(instructionEntities);

        return exercise;
    }
}