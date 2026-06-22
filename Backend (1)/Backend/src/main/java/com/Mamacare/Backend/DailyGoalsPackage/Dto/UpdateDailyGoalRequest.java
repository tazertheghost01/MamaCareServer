package com.Mamacare.Backend.DailyGoalsPackage.Dto;

import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import jakarta.validation.constraints.Size;

public record UpdateDailyGoalRequest(
        @Size(max = 120, message = "title must be 120 characters or less")
        String title,

        @Size(max = 500, message = "description must be 500 characters or less")
        String description,

        DailyGoalCategory category
) {}
