package com.Mamacare.Backend.AdminPackage.Notifications.Dto;

import com.Mamacare.Backend.AdminPackage.Notifications.Enums.AdminNotificationStatus;
import com.Mamacare.Backend.AdminPackage.Notifications.Enums.AdminNotificationType;

import java.time.Instant;

public record AdminNotificationResponse(
        Long id,
        String title,
        String body,
        AdminNotificationType type,
        String audience,
        AdminNotificationStatus status,
        Instant scheduledAt,
        Instant sentAt,
        Instant createdAt,
        Instant updatedAt
) {
}
