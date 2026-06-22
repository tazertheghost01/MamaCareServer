package com.Mamacare.Backend.AdminPackage.Settings.Dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record UpdateAdminSettingsRequest(
        @NotNull Map<String, String> settings
) {
}
