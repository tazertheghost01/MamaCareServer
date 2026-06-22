package com.Mamacare.Backend.DailyGoalsPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DailyGoalsHomeResponse(
        @JsonProperty("screen_title")
        String screenTitle,

        @JsonProperty("hero_message")
        String heroMessage,

        @JsonProperty("completed_count")
        int completedCount,

        @JsonProperty("total_count")
        int totalCount,

        @JsonProperty("progress_percent")
        int progressPercent,

        List<DailyGoalResponse> goals
) {}
