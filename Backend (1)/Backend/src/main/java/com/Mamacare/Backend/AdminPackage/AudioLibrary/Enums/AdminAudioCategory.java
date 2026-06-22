package com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums;

import java.util.Locale;

public enum AdminAudioCategory {
    ONBOARDING,
    HEALTH_TIPS,
    BABY_GROWTH,
    WALK_EXERCISE,
    MEDICATION,
    APPOINTMENT,
    COMMUNITY,
    GENERAL;

    public String folderName() {
        return name().toLowerCase(Locale.ENGLISH);
    }
}
