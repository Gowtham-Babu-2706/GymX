package com.gymx.api.measurement;

import com.gymx.api.user.UserRepository;
import com.gymx.api.user.User;
import com.gymx.api.measurement.dto.BodyMeasurementRequest;
import com.gymx.api.measurement.dto.BodyMeasurementResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BodyMeasurementService {

    private final BodyMeasurementRepository bodyMeasurementRepository;
    private final UserRepository userRepository;

    public BodyMeasurementService(BodyMeasurementRepository bodyMeasurementRepository, UserRepository userRepository) {
        this.bodyMeasurementRepository = bodyMeasurementRepository;
        this.userRepository = userRepository;
    }
    @Transactional
    public BodyMeasurementResponse calculate(BodyMeasurementRequest body, String email)
    {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // The database model permits one current measurement per user, so update it
        // instead of attempting a second insert with the same user_id.
        BodyMeasurement entity = bodyMeasurementRepository.findByUser(user)
                .orElseGet(BodyMeasurement::new);
        entity.setHeight(body.getHeight());
        entity.setWeight(body.getWeight());
        entity.setIsFemale(body.getIsFemale() != null ? body.getIsFemale() : Boolean.TRUE);
        entity.setAge(body.getAge());
        entity.setBodyFat(body.getBodyFat());
        entity.setNeckMeasurement(body.getNeckMeasurement());
        entity.setChestMeasurement(body.getChestMeasurement());
        entity.setHipMeasurement(body.getHipMeasurement());
        entity.setShoulderMeasurement(body.getShoulderMeasurement());
        entity.setWaistMeasurement(body.getWaistMeasurement());
        entity.setUser(user);

        BodyMeasurementResponse reply = new BodyMeasurementResponse();

        entity= bodyMeasurementRepository.save(entity);

        reply.setBmi(entity.getBmi());
        reply.setBmr(entity.getBmr());
        reply.setTdee(entity.getTdee());
        reply.setWaistHeightRatio(entity.getWaistHeightRatio());
        reply.setWaistHipRatio(entity.getWaistHipRatio());

        return reply;
    }


    @Transactional(readOnly = true)
    public BodyMeasurement getMeasurement(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return bodyMeasurementRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Measurement not found"));
    }
}
