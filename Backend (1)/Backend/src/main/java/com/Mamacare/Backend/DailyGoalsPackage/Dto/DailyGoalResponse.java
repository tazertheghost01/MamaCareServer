package com.Mamacare.Backend.DailyGoalsPackage.Dto;

import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.time.LocalDate;

public record DailyGoalResponse(
        Long id,
        String title,
        String description,
        DailyGoalCategory category,

        @JsonProperty("goal_date")
        LocalDate goalDate,

        boolean completed,

        @JsonProperty("completed_at")
        Instant completedAt
) {}
