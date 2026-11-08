package com.gymx.api.measurement;

import com.gymx.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "body_measurement")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class BodyMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Base values: kg and cm
    @Column(nullable = false)
    private Integer weight;

    @Column(nullable = false)
    private Integer height;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isFemale = true;

    private Integer age;
    private Float bodyFat;

    // Circumference values in cm
    private Float neckMeasurement;
    private Float chestMeasurement;
    private Float shoulderMeasurement;
    private Float waistMeasurement;
    private Float hipMeasurement;


    // Calculated values
    private Float bmi;
    private Float bmr;
    private Float tdee;

    private Float waistHipRatio;
    private Float waistHeightRatio;

    private Float activityMultiplier;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;



    @Builder.Default
    private LocalDateTime measuredAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    private void calculateValues()
    {
        if(weight != null && weight > 0 && height != null && height > 0)
        {
            float heightInMeters = (float) height /100;
            bmi = (float)(weight/(heightInMeters * heightInMeters));
        }


        if (weight != null && height != null && age != null && isFemale != null) {
            float baseBmr = (float)((10 * weight) + (6.25f * height) - (5 * age));

            bmr = isFemale
                    ? baseBmr - 161
                    : baseBmr + 5;
        }


        if (bmr != null && activityMultiplier != null) {
            tdee = bmr * activityMultiplier;
        }


        if(waistMeasurement != null && hipMeasurement != null && hipMeasurement > 0)
        {
            waistHipRatio = waistMeasurement/hipMeasurement;
        }

        if(waistMeasurement != null && height != null && height > 0)
        {
            waistHeightRatio = waistMeasurement/height;
        }
    }
}