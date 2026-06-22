package com.Mamacare.Backend.AppointmentPackage.Dtos;

import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentReminderOffset;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class UpdateAppointmentRequest {

    @JsonProperty("appointment_type")
    private AppointmentType appointmentType;

    @JsonProperty("appointment_date")
    private LocalDate appointmentDate;

    @JsonProperty("appointment_time")
    private LocalTime appointmentTime;

    private String timezone;

    @JsonProperty("location_name")
    @Size(max = 180, message = "Location must not exceed 180 characters.")
    private String locationName;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters.")
    private String notes;

    @JsonProperty("reminder_enabled")
    private Boolean reminderEnabled;

    @JsonProperty("reminder_offsets")
    private List<AppointmentReminderOffset> reminderOffsets;
}
