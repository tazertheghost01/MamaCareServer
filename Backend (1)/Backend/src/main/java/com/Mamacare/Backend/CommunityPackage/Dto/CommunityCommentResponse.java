package com.Mamacare.Backend.CommunityPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record CommunityCommentResponse(
    Long id,
    String body,

    @JsonProperty("author_name")
    String authorName,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("time_ago")
    String timeAgo
) {}
