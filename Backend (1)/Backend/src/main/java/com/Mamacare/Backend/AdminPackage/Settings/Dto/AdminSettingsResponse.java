package com.Mamacare.Backend.AdminPackage.Settings.Dto;

import java.util.List;
import java.util.Map;

public record AdminSettingsResponse(
        Map<String, String> settings,
        List<String> supportedLanguages
) {
}
