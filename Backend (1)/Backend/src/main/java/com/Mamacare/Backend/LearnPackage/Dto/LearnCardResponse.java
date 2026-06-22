package com.Mamacare.Backend.LearnPackage.Dto;

import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import com.fasterxml.jackson.annotation.JsonProperty;

public record LearnCardResponse(
        String id,
        String title,
        String body,
        LearnCategory category,

        @JsonProperty("duration_seconds")
        int durationSeconds,

        String language,

        @JsonProperty("audio_url")
        String audioUrl
) {}
