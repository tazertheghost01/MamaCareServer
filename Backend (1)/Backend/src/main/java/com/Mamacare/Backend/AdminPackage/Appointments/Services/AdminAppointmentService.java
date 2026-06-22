package com.Mamacare.Backend.AdminPackage.Appointments.Services;

import com.Mamacare.Backend.AdminPackage.Appointments.Dto.AdminAppointmentResponse;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AppointmentPackage.Entity.Appointment;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentStatus;
import com.Mamacare.Backend.AppointmentPackage.Repo.AppointmentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAppointmentService {

    private final AppointmentRepo appointmentRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        return List.of(
                new AdminMetricCard("total_appointments", "Total Appointments", appointmentRepository.count(), "All appointments"),
                new AdminMetricCard("upcoming", "Upcoming", appointmentRepository.countByStatus(AppointmentStatus.SCHEDULED), "Scheduled appointments"),
                new AdminMetricCard("completed", "Completed", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED), "Completed visits"),
                new AdminMetricCard("missed", "Missed", appointmentRepository.countByStatus(AppointmentStatus.MISSED), "Missed visits")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminAppointmentResponse> listAppointments(AppointmentStatus status) {
        return appointmentRepository.findAll()
                .stream()
                .filter(appointment -> status == null || appointment.getStatus() == status)
                .map(this::toResponse)
                .toList();
    }

    private AdminAppointmentResponse toResponse(Appointment appointment) {
        return new AdminAppointmentResponse(
                appointment.getId(),
                appointment.getUser().getId(),
                appointment.getUser().getFullname(),
                appointment.getAppointmentType(),
                appointment.getLocationName(),
                appointment.getScheduledStartAt(),
                appointment.getStatus(),
                appointment.isReminderEnabled(),
                appointment.getNotes()
        );
    }
}
