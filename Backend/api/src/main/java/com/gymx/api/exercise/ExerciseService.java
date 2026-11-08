
package com.gymx.api.exercise;

import com.gymx.api.exercise.Dto.ExerciseResponseDto;
import com.gymx.api.exercise.enums.Equipment;
import com.gymx.api.exercise.enums.Muscle;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(
            ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional(readOnly = true)
    public ExerciseResponseDto getExercisesById(Long id) {

        Exercise exercise =
                exerciseRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Exercise not found with id: " + id
                                ));

        return ExerciseMapper.toDto(exercise);
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponseDto> getAllExercises() {

        return exerciseRepository.findAll()
                .stream()
                .map(ExerciseMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponseDto> searchExercises(
            Muscle muscleGroup,
            Equipment equipment,
            String search) {

        String searchTerm =
                (search == null || search.isBlank())
                        ? null
                        : search.trim();

        return exerciseRepository
                .searchExercises(muscleGroup, equipment, searchTerm)
                .stream()
                .map(ExerciseMapper::toDto)
                .toList();
    }

    @Transactional
    public ExerciseResponseDto postTheExercise(
            ExerciseResponseDto data) {

        Exercise entity =
                ExerciseMapper.toEntity(data);

        Exercise savedEntity =
                exerciseRepository.save(entity);

        return ExerciseMapper.toDto(savedEntity);
    }
}
