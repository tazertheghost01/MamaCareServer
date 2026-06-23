package com.Mamacare.Backend.AdminPackage.Settings.Services;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.Settings.Dto.AdminSettingsResponse;
import com.Mamacare.Backend.AdminPackage.Settings.Dto.UpdateAdminSettingsRequest;
import com.Mamacare.Backend.AdminPackage.Settings.Entity.AdminSetting;
import com.Mamacare.Backend.AdminPackage.Settings.Repo.AdminSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    private static final Map<String, String> DEFAULTS = Map.ofEntries(
            Map.entry("platform.name", "MamaCare"),
            Map.entry("platform.admin_email", "admin@mamacare.com"),
            Map.entry("platform.timezone", "Africa/Lagos"),
            Map.entry("platform.date_format", "MMM dd, yyyy"),
            Map.entry("notifications.new_user_registration", "true"),
            Map.entry("notifications.appointment_booked", "true"),
            Map.entry("notifications.reminder_alerts", "true"),
            Map.entry("notifications.community_reports", "true"),
            Map.entry("notifications.system_alerts", "true"),
            Map.entry("notifications.weekly_summary", "false"),
            Map.entry("language.default", "English"),
            Map.entry("language.english", "true"),
            Map.entry("language.yoruba", "true"),
            Map.entry("language.hausa", "true"),
            Map.entry("language.igbo", "true"),
            Map.entry("language.pidgin", "false"),
            Map.entry("security.two_factor_authentication", "false"),
            Map.entry("security.login_alerts", "true"),
            Map.entry("security.session_timeout_minutes", "30"),
            Map.entry("platform.maintenance_mode", "false"),
            Map.entry("platform.allow_user_registration", "true"),
            Map.entry("platform.email_verification_required", "true"),
            Map.entry("backup.frequency", "daily"),
            Map.entry("backup.status", "Completed"),
            Map.entry("backup.last_backup", "n/a")
    );

    private final AdminSettingRepository settingRepository;

    @Transactional(readOnly = true)
    public AdminSettingsResponse getSettings() {
        Map<String, String> values = new LinkedHashMap<>(DEFAULTS);
        settingRepository.findAll().forEach(setting -> values.put(setting.getKey(), setting.getValue()));
        return new AdminSettingsResponse(values, supportedLanguages());
    }

    @Transactional
    public AdminSettingsResponse updateSettings(UpdateAdminSettingsRequest request) {
        request.settings().forEach((key, value) -> {
            if (!DEFAULTS.containsKey(key)) {
                throw new IllegalArgumentException("Unsupported setting key: " + key);
            }
            String safeValue = value == null ? "" : value.trim();
            AdminSetting setting = settingRepository.findByKey(key)
                    .orElseGet(() -> AdminSetting.builder().key(key).build());
            setting.setValue(safeValue);
            settingRepository.save(setting);
        });
        return getSettings();
    }

    private List<String> supportedLanguages() {
        return Arrays.stream(AdminAudioLanguage.values()).map(Enum::name).toList();
    }
}
