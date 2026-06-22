package com.Mamacare.Backend.AdminPackage.Common.Dto;

import java.time.Instant;

public record AdminRecentActivity(
        String type,
        String title,
        String description,
        Instant occurredAt
) {
}
