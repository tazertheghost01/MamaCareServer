package com.Mamacare.Backend.AdminPackage.Notifications.Controller;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Notifications.Dto.AdminNotificationResponse;
import com.Mamacare.Backend.AdminPackage.Notifications.Dto.CreateAdminNotificationRequest;
import com.Mamacare.Backend.AdminPackage.Notifications.Enums.AdminNotificationStatus;
import com.Mamacare.Backend.AdminPackage.Notifications.Services.AdminNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(notificationService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<AdminNotificationResponse>> listNotifications(
            @RequestParam(required = false) AdminNotificationStatus status
    ) {
        return ResponseEntity.ok(notificationService.listNotifications(status));
    }

    @PostMapping
    public ResponseEntity<AdminNotificationResponse> createNotification(
            @Valid @RequestBody CreateAdminNotificationRequest request
    ) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @PatchMapping("/{notificationId}/sent")
    public ResponseEntity<AdminNotificationResponse> markSent(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markSent(notificationId));
    }
}
