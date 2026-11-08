package com.gymx.api.measurement.dto;


import lombok.Builder;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BodyMeasurementResponse {
    private Float bmi;
    private Float bmr;
    private Float tdee;
    private Float waistHipRatio;
    private Float waistHeightRatio;
}
