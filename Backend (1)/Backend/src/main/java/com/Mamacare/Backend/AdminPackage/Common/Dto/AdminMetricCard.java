package com.Mamacare.Backend.AdminPackage.Common.Dto;

public record AdminMetricCard(
        String key,
        String title,
        long value,
        String subtitle
) {
}
