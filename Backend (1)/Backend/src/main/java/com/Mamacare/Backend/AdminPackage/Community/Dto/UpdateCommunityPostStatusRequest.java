package com.Mamacare.Backend.AdminPackage.Community.Dto;

import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCommunityPostStatusRequest(
        @NotNull CommunityDiscussionStatus status
) {
}
