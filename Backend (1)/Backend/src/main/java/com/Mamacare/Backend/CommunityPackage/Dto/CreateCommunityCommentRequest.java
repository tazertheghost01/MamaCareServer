package com.Mamacare.Backend.CommunityPackage.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommunityCommentRequest(
    @NotBlank(message = "body is required")
    @Size(max = 2000, message = "body must be 2000 characters or less")
    String body
) {}
