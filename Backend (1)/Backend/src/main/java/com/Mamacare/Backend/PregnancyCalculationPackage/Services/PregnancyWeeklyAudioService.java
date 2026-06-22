package com.Mamacare.Backend.PregnancyCalculationPackage.Services;

import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyWeeklyAudio;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyWeeklyAudioTranslation;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyWeeklyAudioRepo;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyWeeklyAudioTranslationRepo;
import com.Mamacare.Backend.PreferencesPackage.Repo.UserPreferenceRepo;
import com.Mamacare.Backend.PreferencesPackage.Entity.UserPreference;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PregnancyWeeklyAudioService {

    private final PregnancyWeeklyAudioRepo weeklyAudioRepo;
    private final PregnancyWeeklyAudioTranslationRepo translationRepo;
    private final UserPreferenceRepo preferenceRepository;

    @Transactional(readOnly = true)
    public String getWeeklyAudioUrl(int weekNumber, String langParam, Authentication authentication) {
        String language = resolveLanguage(langParam, authentication);

        Optional<PregnancyWeeklyAudio> weeklyAudioOpt = weeklyAudioRepo.findByWeekNumber(weekNumber);
        if (weeklyAudioOpt.isEmpty()) {
            return "/audio/weekly/week-" + weekNumber + "-" + language.toLowerCase() + ".mp3";
        }
        PregnancyWeeklyAudio weeklyAudio = weeklyAudioOpt.get();

        Optional<PregnancyWeeklyAudioTranslation> transOpt = weeklyAudio.getTranslations().stream()
                .filter(t -> t.getLanguage().equalsIgnoreCase(language))
                .findFirst();

        if (transOpt.isEmpty() && !language.equalsIgnoreCase("ENGLISH")) {
            transOpt = weeklyAudio.getTranslations().stream()
                    .filter(t -> t.getLanguage().equalsIgnoreCase("ENGLISH"))
                    .findFirst();
        }

        if (transOpt.isEmpty() && !weeklyAudio.getTranslations().isEmpty()) {
            transOpt = Optional.of(weeklyAudio.getTranslations().get(0));
        }

        if (transOpt.isPresent()) {
            return transOpt.get().getAudioUrl();
        }

        return "/audio/weekly/week-" + weekNumber + "-" + language.toLowerCase() + ".mp3";
    }

    private String resolveLanguage(String langParam, Authentication authentication) {
        if (langParam != null && !langParam.isBlank()) {
            String norm = langParam.trim().toUpperCase();
            if (java.util.List.of("ENGLISH", "HAUSA", "IGBO", "YORUBA", "PIDGIN").contains(norm)) {
                return norm;
            }
        }
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return preferenceRepository.findByUserId(user.getId())
                    .map(UserPreference::getLanguage)
                    .orElse("ENGLISH");
        }
        return "ENGLISH";
    }
}
