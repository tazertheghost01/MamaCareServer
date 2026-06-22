package com.Mamacare.Backend.AdminPackage.Notifications.Repo;

import com.Mamacare.Backend.AdminPackage.Notifications.Entity.AdminNotification;
import com.Mamacare.Backend.AdminPackage.Notifications.Enums.AdminNotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {

    long countByStatus(AdminNotificationStatus status);

    List<AdminNotification> findByStatusOrderByUpdatedAtDesc(AdminNotificationStatus status);
}
