package com.Mamacare.Backend.AdminPackage.Reminders.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Reminders.Dto.AdminReminderResponse;
import com.Mamacare.Backend.AppointmentPackage.Entity.AppointmentReminder;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentReminderStatus;
import com.Mamacare.Backend.AppointmentPackage.Repo.AppointmentReminderRepo;
import com.Mamacare.Backend.MedicationRemiderPackage.Entity.MedicationReminder;
import com.Mamacare.Backend.MedicationRemiderPackage.Enums.MedicationReminderStatus;
import com.Mamacare.Backend.MedicationRemiderPackage.Repo.MedicationReminderRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminReminderService {

    private final MedicationReminderRepo medicationReminderRepository;
    private final AppointmentReminderRepo appointmentReminderRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        long medicationSent = medicationReminderRepository.countByStatus(MedicationReminderStatus.SENT);
        long appointmentSent = appointmentReminderRepository.countByStatus(AppointmentReminderStatus.SENT);
        long medicationPending = medicationReminderRepository.countByStatus(MedicationReminderStatus.PENDING);
        long appointmentPending = appointmentReminderRepository.countByStatus(AppointmentReminderStatus.PENDING);
        long medicationFailed = medicationReminderRepository.countByStatus(MedicationReminderStatus.FAILED);
        long appointmentFailed = appointmentReminderRepository.countByStatus(AppointmentReminderStatus.FAILED);

        return List.of(
                new AdminMetricCard("total_sent", "Total Sent", medicationSent + appointmentSent, "Medication and appointment reminders"),
                new AdminMetricCard("pending", "Pending", medicationPending + appointmentPending, "Waiting to send"),
                new AdminMetricCard("failed", "Failed", medicationFailed + appointmentFailed, "Needs attention"),
                new AdminMetricCard("reminder_types", "Reminder Types", 2, "Medication and appointment")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminReminderResponse> listReminders(String type) {
        Stream<AdminReminderResponse> medications = medicationReminderRepository.findAll()
                .stream()
                .map(this::toMedicationResponse);
        Stream<AdminReminderResponse> appointments = appointmentReminderRepository.findAll()
                .stream()
                .map(this::toAppointmentResponse);

        Stream<AdminReminderResponse> stream = switch (type == null ? "" : type.trim().toUpperCase()) {
            case "MEDICATION" -> medications;
            case "APPOINTMENT" -> appointments;
            default -> Stream.concat(medications, appointments);
        };

        return stream
                .sorted(Comparator.comparing(AdminReminderResponse::scheduledTime).reversed())
                .toList();
    }

    private AdminReminderResponse toMedicationResponse(MedicationReminder reminder) {
        return new AdminReminderResponse(
                "Medication",
                reminder.getId(),
                reminder.getMedication().getMedicineName() + " reminder",
                safe(reminder.getMedication().getUser().getFullname(), "User"),
                reminder.getRemindAt(),
                reminder.getStatus().name(),
                reminder.getStatus() == MedicationReminderStatus.SENT ? reminder.getRemindAt() : null
        );
    }

    private AdminReminderResponse toAppointmentResponse(AppointmentReminder reminder) {
        return new AdminReminderResponse(
                "Appointment",
                reminder.getId(),
                reminder.getAppointment().getAppointmentType().name() + " appointment",
                safe(reminder.getAppointment().getUser().getFullname(), "User"),
                reminder.getRemindAt(),
                reminder.getStatus().name(),
                reminder.getStatus() == AppointmentReminderStatus.SENT ? reminder.getRemindAt() : null
        );
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
