package com.Mamacare.Backend.PreferencesPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateUserPreferenceRequest(
        String language,
        String timezone,

        @JsonProperty("notifications_enabled")
        Boolean notificationsEnabled,

        @JsonProperty("appointment_reminders_enabled")
        Boolean appointmentRemindersEnabled,

        @JsonProperty("medication_reminders_enabled")
        Boolean medicationRemindersEnabled,

        @JsonProperty("daily_goal_reminders_enabled")
        Boolean dailyGoalRemindersEnabled,

        @JsonProperty("community_notifications_enabled")
        Boolean communityNotificationsEnabled,

        @JsonProperty("privacy_consent_accepted")
        Boolean privacyConsentAccepted
) {}
