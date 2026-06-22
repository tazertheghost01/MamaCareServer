package com.Mamacare.Backend.MedicationRemiderPackage.DTOs;

import com.Mamacare.Backend.MedicationRemiderPackage.Enums.MedicationFrequency;
import com.Mamacare.Backend.MedicationRemiderPackage.Enums.MedicationReminderOffset;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class UpdateMedicationRequest {

    @JsonProperty("medicine_name")
    @Size(max = 120, message = "Medicine name must not exceed 120 characters.")
    private String medicineName;

    @Size(max = 80, message = "Dose must not exceed 80 characters.")
    private String dose;

    private MedicationFrequency frequency;

    @JsonProperty("medication_time")
    private LocalTime medicationTime;

    @JsonProperty("start_date")
    private LocalDate startDate;

    private String timezone;

    @JsonProperty("reminder_enabled")
    private Boolean reminderEnabled;

    @JsonProperty("reminder_offset")
    private MedicationReminderOffset reminderOffset;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters.")
    private String notes;
}
