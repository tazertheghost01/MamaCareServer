package com.Mamacare.Backend.PreferencesPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserPreferenceResponse(
        String language,
        String timezone,

        @JsonProperty("notifications_enabled")
        boolean notificationsEnabled,

        @JsonProperty("appointment_reminders_enabled")
        boolean appointmentRemindersEnabled,

        @JsonProperty("medication_reminders_enabled")
        boolean medicationRemindersEnabled,

        @JsonProperty("daily_goal_reminders_enabled")
        boolean dailyGoalRemindersEnabled,

        @JsonProperty("community_notifications_enabled")
        boolean communityNotificationsEnabled,

        @JsonProperty("privacy_consent_accepted")
        boolean privacyConsentAccepted
) {}
