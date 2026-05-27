package com.Mamacare.Backend.PregnancyCalculationPackage.Dto;


import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

import com.Mamacare.Backend.PregnancyCalculationPackage.Enum.PregnancyDateSource;

public record PregnancySetupRequest(
    @NotNull PregnancyDateSource source,
    LocalDate dueDate,
    LocalDate lastMenstrualPeriod
) {

  @AssertTrue(message = "Use dueDate only for DUE_DATE, or lastMenstrualPeriod only for LMP")
  public boolean isValidDateCombination() {
    if (source == null) {
      return true;
    }
    return switch (source) {
      case DUE_DATE -> dueDate != null && lastMenstrualPeriod == null;
      case LMP -> lastMenstrualPeriod != null && dueDate == null;
    };
  }
}


