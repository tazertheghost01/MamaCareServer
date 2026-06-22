package com.Mamacare.Backend.AdminPackage.Dashboard.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminRecentActivity;
import com.Mamacare.Backend.AdminPackage.Dashboard.Dto.AdminDashboardResponse;
import com.Mamacare.Backend.AppointmentPackage.Repo.AppointmentRepo;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityDiscussionRepository;
import com.Mamacare.Backend.MedicationRemiderPackage.Enums.MedicationReminderStatus;
import com.Mamacare.Backend.MedicationRemiderPackage.Repo.MedicationReminderRepo;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyProfileRepository;
import com.Mamacare.Backend.SupportPackage.Repo.SupportTicketRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;
    private final AppointmentRepo appointmentRepository;
    private final MedicationReminderRepo medicationReminderRepository;
    private final CommunityDiscussionRepository discussionRepository;
    private final SupportTicketRepo supportTicketRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        List<AdminMetricCard> metrics = List.of(
                new AdminMetricCard("total_users", "Total Users", userRepository.count(), "Registered accounts"),
                new AdminMetricCard("active_pregnancies", "Active Pregnancies", pregnancyProfileRepository.count(), "Pregnancy profiles"),
                new AdminMetricCard("appointments", "Appointments", appointmentRepository.count(), "All appointments"),
                new AdminMetricCard("reminders_sent", "Reminders Sent", medicationReminderRepository.countByStatus(MedicationReminderStatus.SENT), "Medication reminders"),
                new AdminMetricCard("community_posts", "Community Posts", discussionRepository.count(), "All discussions"),
                new AdminMetricCard("support_requests", "Support Requests", supportTicketRepository.count(), "All tickets")
        );

        return new AdminDashboardResponse("Dashboard", metrics, recentActivities());
    }

    private List<AdminRecentActivity> recentActivities() {
        List<AdminRecentActivity> activities = new ArrayList<>();

        userRepository.findTop5ByOrderByIdDesc().forEach(user ->
                activities.add(new AdminRecentActivity(
                        "USER",
                        "New user registered",
                        safe(user.getFullname(), user.getEmail()),
                        null
                ))
        );

        appointmentRepository.findTop20ByOrderByScheduledStartAtDesc().stream().limit(5).forEach(appointment ->
                activities.add(new AdminRecentActivity(
                        "APPOINTMENT",
                        "Appointment recorded",
                        safe(appointment.getLocationName(), appointment.getAppointmentType().name()),
                        appointment.getScheduledStartAt().toInstant()
                ))
        );

        discussionRepository.findTop20ByOrderByCreatedAtDesc().stream().limit(5).forEach(discussion ->
                activities.add(new AdminRecentActivity(
                        "COMMUNITY",
                        "Community discussion",
                        discussion.getTitle(),
                        discussion.getCreatedAt()
                ))
        );

        supportTicketRepository.findTop20ByOrderByCreatedAtDesc().stream().limit(5).forEach(ticket ->
                activities.add(new AdminRecentActivity(
                        "SUPPORT",
                        "Support request",
                        ticket.getSubject(),
                        ticket.getCreatedAt()
                ))
        );

        return activities.stream()
                .sorted(Comparator.comparing(AdminRecentActivity::occurredAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .toList();
    }

    private String safe(String primary, String fallback) {
        return primary == null || primary.isBlank() ? fallback : primary;
    }
}
