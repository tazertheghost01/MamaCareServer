package com.Mamacare.Backend.MedicationRemiderPackage.DTOs;

import com.Mamacare.Backend.MedicationRemiderPackage.Enums.MedicationIntakeStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class MedicationIntakeHistoryResponse {

    private Long id;

    @JsonProperty("medication_id")
    private Long medicationId;

    @JsonProperty("medicine_name")
    private String medicineName;

    @JsonProperty("intake_date")
    private LocalDate intakeDate;

    private MedicationIntakeStatus status;

    @JsonProperty("recorded_at")
    private OffsetDateTime recordedAt;
}
