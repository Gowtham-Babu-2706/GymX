package com.gymx.api.measurement.dto;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BodyMeasurementRequest {
    private Integer weight;
    private Integer height;
    private Boolean isFemale = true;
    private Integer age;
    private Float bodyFat;
    private Float neckMeasurement;
    private Float chestMeasurement;
    private Float shoulderMeasurement;
    private Float waistMeasurement;
    private Float hipMeasurement;
}
