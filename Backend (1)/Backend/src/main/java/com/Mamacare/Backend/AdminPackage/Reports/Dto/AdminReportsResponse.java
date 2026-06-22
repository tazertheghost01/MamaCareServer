package com.Mamacare.Backend.AdminPackage.Reports.Dto;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;

import java.util.List;

public record AdminReportsResponse(
        List<AdminMetricCard> summary,
        List<AdminBreakdownItem> featureEngagement,
        List<AdminBreakdownItem> audioByLanguage,
        List<String> dataGaps
) {
}
