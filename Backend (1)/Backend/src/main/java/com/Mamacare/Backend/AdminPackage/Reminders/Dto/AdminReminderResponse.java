package com.Mamacare.Backend.AdminPackage.Reminders.Dto;

import java.time.OffsetDateTime;

public record AdminReminderResponse(
        String type,
        Long sourceId,
        String title,
        String audience,
        OffsetDateTime scheduledTime,
        String status,
        OffsetDateTime sentOn
) {
}
