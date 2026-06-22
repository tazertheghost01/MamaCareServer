package com.Mamacare.Backend.LearnPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record LearnHomeResponse(
        @JsonProperty("screen_title")
        String screenTitle,

        @JsonProperty("hero_message")
        String heroMessage,

        @JsonProperty("tips_of_the_day")
        List<LearnCardResponse> tipsOfTheDay,

        @JsonProperty("weekly_highlights")
        List<LearnCardResponse> weeklyHighlights,

        List<LearnCardResponse> nutrition
) {}
