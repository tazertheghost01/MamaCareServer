package com.Mamacare.Backend.FitnessAppFeature.Dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalkGoalSettingResponse {

    @JsonProperty("daily_goal_minutes")
    private int dailyGoalMinutes;

    private String timezone;
}
