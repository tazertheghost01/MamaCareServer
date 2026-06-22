package com.Mamacare.Backend.AdminPackage.Dashboard.Dto;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminRecentActivity;

import java.util.List;

public record AdminDashboardResponse(
        String title,
        List<AdminMetricCard> metrics,
        List<AdminRecentActivity> recentActivities
) {
}
