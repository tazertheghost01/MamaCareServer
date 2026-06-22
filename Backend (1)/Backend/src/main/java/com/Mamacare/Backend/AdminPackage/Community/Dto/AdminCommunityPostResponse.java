package com.Mamacare.Backend.AdminPackage.Community.Dto;

import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;

import java.time.Instant;

public record AdminCommunityPostResponse(
        Long id,
        Integer authorId,
        String authorName,
        String title,
        String preview,
        String groupName,
        long reactions,
        long comments,
        CommunityDiscussionStatus status,
        Instant createdAt
) {
}
