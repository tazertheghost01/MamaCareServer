package com.Mamacare.Backend.PregnancyCalculationPackage.Dto;

import java.time.LocalDate;

import com.Mamacare.Backend.PregnancyCalculationPackage.Enum.PregnancyDateSource;

public record PregnancySummaryResponse(
    LocalDate dueDate,
    LocalDate lastMenstrualPeriod,
    PregnancyDateSource source,
    int week,
    String trimester,
    long daysToGo
) {}