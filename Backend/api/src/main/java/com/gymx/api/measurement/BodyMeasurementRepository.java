package com.gymx.api.measurement;

import com.gymx.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement,Long> {
    Optional<BodyMeasurement> findByUser(User user);
}
