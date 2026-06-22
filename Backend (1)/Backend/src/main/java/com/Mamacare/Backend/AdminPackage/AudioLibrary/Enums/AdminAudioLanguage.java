package com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums;

import java.util.Locale;

public enum AdminAudioLanguage {
    ENGLISH,
    YORUBA,
    PIDGIN,
    HAUSA;

    public static AdminAudioLanguage from(String value) {
        if (value == null || value.isBlank()) {
            return ENGLISH;
        }
        return AdminAudioLanguage.valueOf(value.trim().toUpperCase(Locale.ENGLISH));
    }

    public String folderName() {
        return name().toLowerCase(Locale.ENGLISH);
    }
}
