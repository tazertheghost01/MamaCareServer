package com.Mamacare.Backend.AdminPackage.AudioLibrary.Dto;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioStatus;

import java.time.Instant;

public record AdminAudioAssetResponse(
        Long id,
        String title,
        AdminAudioCategory category,
        AdminAudioLanguage language,
        AdminAudioStatus status,
        String originalFilename,
        String contentType,
        long fileSizeBytes,
        Integer durationSeconds,
        String publicUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
