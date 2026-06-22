package com.Mamacare.Backend.DailyGoalsPackage.Dto;

import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateDailyGoalRequest(
        @NotBlank(message = "title is required")
        @Size(max = 120, message = "title must be 120 characters or less")
        String title,

        @Size(max = 500, message = "description must be 500 characters or less")
        String description,

        DailyGoalCategory category,

        @JsonProperty("goal_date")
        LocalDate goalDate
) {}
