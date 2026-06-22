package com.Mamacare.Backend.AdminPackage.Pregnancies.Dto;

import com.Mamacare.Backend.PregnancyCalculationPackage.Enum.PregnancyDateSource;

import java.time.LocalDate;

public record AdminPregnancyResponse(
        Long id,
        Integer userId,
        String userName,
        String userEmail,
        Integer gestationalWeek,
        String trimester,
        LocalDate dueDate,
        LocalDate lastMenstrualPeriod,
        PregnancyDateSource source,
        String status
) {
}
