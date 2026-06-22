package com.Mamacare.Backend.AdminPackage.Settings.Controller;

import com.Mamacare.Backend.AdminPackage.Settings.Dto.AdminSettingsResponse;
import com.Mamacare.Backend.AdminPackage.Settings.Dto.UpdateAdminSettingsRequest;
import com.Mamacare.Backend.AdminPackage.Settings.Services.AdminSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final AdminSettingsService settingsService;

    @GetMapping
    public ResponseEntity<AdminSettingsResponse> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PatchMapping
    public ResponseEntity<AdminSettingsResponse> updateSettings(
            @Valid @RequestBody UpdateAdminSettingsRequest request
    ) {
        return ResponseEntity.ok(settingsService.updateSettings(request));
    }
}
