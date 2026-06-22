package com.Mamacare.Backend.AdminPackage.Notifications.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Notifications.Dto.AdminNotificationResponse;
import com.Mamacare.Backend.AdminPackage.Notifications.Dto.CreateAdminNotificationRequest;
import com.Mamacare.Backend.AdminPackage.Notifications.Entity.AdminNotification;
import com.Mamacare.Backend.AdminPackage.Notifications.Enums.AdminNotificationStatus;
import com.Mamacare.Backend.AdminPackage.Notifications.Repo.AdminNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final AdminNotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        return List.of(
                new AdminMetricCard("total_sent", "Total Sent", notificationRepository.countByStatus(AdminNotificationStatus.SENT), "Admin notifications"),
                new AdminMetricCard("scheduled", "Scheduled", notificationRepository.countByStatus(AdminNotificationStatus.SCHEDULED), "Future sends"),
                new AdminMetricCard("pending", "Drafts", notificationRepository.countByStatus(AdminNotificationStatus.DRAFT), "Not yet scheduled"),
                new AdminMetricCard("failed", "Failed", notificationRepository.countByStatus(AdminNotificationStatus.FAILED), "Needs retry")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminNotificationResponse> listNotifications(AdminNotificationStatus status) {
        List<AdminNotification> notifications = status == null
                ? notificationRepository.findAll()
                : notificationRepository.findByStatusOrderByUpdatedAtDesc(status);
        return notifications.stream().map(this::toResponse).toList();
    }

    @Transactional
    public AdminNotificationResponse createNotification(CreateAdminNotificationRequest request) {
        AdminNotificationStatus status = request.scheduledAt() == null
                ? AdminNotificationStatus.DRAFT
                : AdminNotificationStatus.SCHEDULED;

        AdminNotification notification = AdminNotification.builder()
                .title(request.title().trim())
                .body(request.body().trim())
                .type(request.type())
                .audience(request.audience().trim())
                .status(status)
                .scheduledAt(request.scheduledAt())
                .build();

        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public AdminNotificationResponse markSent(Long notificationId) {
        AdminNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));
        notification.setStatus(AdminNotificationStatus.SENT);
        notification.setSentAt(Instant.now());
        return toResponse(notificationRepository.save(notification));
    }

    private AdminNotificationResponse toResponse(AdminNotification notification) {
        return new AdminNotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getBody(),
                notification.getType(),
                notification.getAudience(),
                notification.getStatus(),
                notification.getScheduledAt(),
                notification.getSentAt(),
                notification.getCreatedAt(),
                notification.getUpdatedAt()
        );
    }
}
