package com.Mamacare.Backend.CommunityPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCommunityQuestionRequest(
    @NotNull(message = "group_id is required")
    @JsonProperty("group_id")
    Long groupId,

    @NotBlank(message = "title is required")
    @Size(max = 180, message = "title must be 180 characters or less")
    String title,

    @Size(max = 3000, message = "body must be 3000 characters or less")
    String body
) {}
