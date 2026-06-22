package com.Mamacare.Backend.FitnessAppFeature.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateWalkGoalSettingRequest {

    @JsonProperty("daily_goal_minutes")
    @Min(value = 1, message = "Daily goal minutes must be at least 1.")
    @Max(value = 180, message = "Daily goal minutes must not exceed 180.")
    private Integer dailyGoalMinutes;

    private String timezone;
}
