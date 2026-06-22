package com.Mamacare.Backend.AdminPackage.Notifications.Dto;

import com.Mamacare.Backend.AdminPackage.Notifications.Enums.AdminNotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateAdminNotificationRequest(
        @NotBlank String title,
        @NotBlank String body,
        @NotNull AdminNotificationType type,
        @NotBlank String audience,
        Instant scheduledAt
) {
}
