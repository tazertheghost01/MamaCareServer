package com.Mamacare.Backend.AdminPackage.Reminders.Controller;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Reminders.Dto.AdminReminderResponse;
import com.Mamacare.Backend.AdminPackage.Reminders.Services.AdminReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reminders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReminderController {

    private final AdminReminderService reminderService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(reminderService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<AdminReminderResponse>> listReminders(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(reminderService.listReminders(type));
    }
}
