package com.Mamacare.Backend.AdminPackage.AudioLibrary.Dto;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;

public record PublicAudioAssetResponse(
        Long id,
        String title,
        AdminAudioCategory category,
        AdminAudioLanguage language,
        Integer durationSeconds,
        String audioUrl
) {
}
