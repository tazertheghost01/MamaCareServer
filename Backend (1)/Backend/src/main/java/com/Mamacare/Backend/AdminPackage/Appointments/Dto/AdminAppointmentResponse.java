package com.Mamacare.Backend.AdminPackage.Appointments.Dto;

import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentStatus;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentType;

import java.time.OffsetDateTime;

public record AdminAppointmentResponse(
        Long id,
        Integer userId,
        String userName,
        AppointmentType appointmentType,
        String hospitalOrClinic,
        OffsetDateTime scheduledStartAt,
        AppointmentStatus status,
        boolean reminderEnabled,
        String notes
) {
}
