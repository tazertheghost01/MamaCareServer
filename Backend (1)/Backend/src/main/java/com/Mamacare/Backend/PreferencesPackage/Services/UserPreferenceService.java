package com.Mamacare.Backend.PreferencesPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.PreferencesPackage.Dto.UpdateUserPreferenceRequest;
import com.Mamacare.Backend.PreferencesPackage.Dto.UserPreferenceResponse;
import com.Mamacare.Backend.PreferencesPackage.Entity.UserPreference;
import com.Mamacare.Backend.PreferencesPackage.Repo.UserPreferenceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("ENGLISH", "YORUBA", "PIDGIN", "HAUSA");

    private final UserPreferenceRepo preferenceRepository;

    @Transactional(readOnly = true)
    public UserPreferenceResponse getPreferences(Authentication authentication) {
        UserPreference preference = getOrBuildDefault(getCurrentUser(authentication));
        return toResponse(preference);
    }

    @Transactional
    public UserPreferenceResponse updatePreferences(
            UpdateUserPreferenceRequest request,
            Authentication authentication
    ) {
        UserPreference preference = getOrCreate(getCurrentUser(authentication));

        if (request.language() != null) {
            preference.setLanguage(normalizeLanguage(request.language()));
        }
        if (request.timezone() != null) {
            preference.setTimezone(normalizeTimezone(request.timezone()));
        }
        if (request.notificationsEnabled() != null) {
            preference.setNotificationsEnabled(request.notificationsEnabled());
        }
        if (request.appointmentRemindersEnabled() != null) {
            preference.setAppointmentRemindersEnabled(request.appointmentRemindersEnabled());
        }
        if (request.medicationRemindersEnabled() != null) {
            preference.setMedicationRemindersEnabled(request.medicationRemindersEnabled());
        }
        if (request.dailyGoalRemindersEnabled() != null) {
            preference.setDailyGoalRemindersEnabled(request.dailyGoalRemindersEnabled());
        }
        if (request.communityNotificationsEnabled() != null) {
            preference.setCommunityNotificationsEnabled(request.communityNotificationsEnabled());
        }
        if (request.privacyConsentAccepted() != null) {
            preference.setPrivacyConsentAccepted(request.privacyConsentAccepted());
        }

        return toResponse(preferenceRepository.save(preference));
    }

    private UserPreference getOrCreate(User user) {
        return preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> preferenceRepository.save(UserPreference.builder().user(user).build()));
    }

    private UserPreference getOrBuildDefault(User user) {
        return preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> UserPreference.builder().user(user).build());
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
        return user;
    }

    private String normalizeLanguage(String language) {
        String normalized = language.trim().toUpperCase(Locale.ENGLISH);
        if (!SUPPORTED_LANGUAGES.contains(normalized)) {
            throw new IllegalArgumentException("Unsupported language. Use ENGLISH, YORUBA, PIDGIN, or HAUSA.");
        }
        return normalized;
    }

    private String normalizeTimezone(String timezone) {
        String normalized = timezone == null || timezone.isBlank() ? "Africa/Lagos" : timezone.trim();
        ZoneId.of(normalized);
        return normalized;
    }

    private UserPreferenceResponse toResponse(UserPreference preference) {
        return new UserPreferenceResponse(
                preference.getLanguage(),
                preference.getTimezone(),
                preference.isNotificationsEnabled(),
                preference.isAppointmentRemindersEnabled(),
                preference.isMedicationRemindersEnabled(),
                preference.isDailyGoalRemindersEnabled(),
                preference.isCommunityNotificationsEnabled(),
                preference.isPrivacyConsentAccepted()
        );
    }
}
