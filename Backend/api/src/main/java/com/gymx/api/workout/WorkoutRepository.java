package com.gymx.api.workout;

import com.gymx.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout,Long> {
    Optional<Workout> findByIdAndUser(
            Long id, User user);

    List<Workout> findAllByUser(User user);

    List<Workout> findAllByUserOrderByWorkoutDateDescIdDesc(User user);
}
