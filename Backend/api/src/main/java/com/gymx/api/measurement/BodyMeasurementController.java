package com.gymx.api.measurement;

import com.gymx.api.measurement.dto.BodyMeasurementRequest;
import com.gymx.api.measurement.dto.BodyMeasurementResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("api/body")
public class BodyMeasurementController {

    private final BodyMeasurementService bodyMeasurementService;

    public BodyMeasurementController(BodyMeasurementService bodyMeasurementService) {
        this.bodyMeasurementService = bodyMeasurementService;

    }

    @PostMapping("/calculate")
    public ResponseEntity<BodyMeasurementResponse> calculate(@RequestBody BodyMeasurementRequest body, Principal principal)
    {
        String email = principal.getName();
        return ResponseEntity.ok(bodyMeasurementService.calculate(body,email));
    }

    @GetMapping
    public ResponseEntity<BodyMeasurement> getData(Principal principal)
    {
        String email = principal.getName();
        return ResponseEntity.ok(bodyMeasurementService.getMeasurement(email));
    }

}
