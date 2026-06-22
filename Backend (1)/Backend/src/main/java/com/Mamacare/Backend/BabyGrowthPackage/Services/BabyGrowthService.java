package com.Mamacare.Backend.BabyGrowthPackage.Services;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Services.PublicAudioLibraryService;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.BabyGrowthPackage.Dto.BabyGrowthResponse;
import com.Mamacare.Backend.BabyGrowthPackage.Dto.BabyGrowthWeekContent;
import com.Mamacare.Backend.PreferencesPackage.Repo.UserPreferenceRepo;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Services.PregnancyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class BabyGrowthService {

  private static final String DEFAULT_AUDIO_LANGUAGE = "YORUBA";
  private static final int AUDIO_DURATION_SECONDS = 75;
  private static final String DISCLAIMER =
      "Baby growth values are educational estimates. Your scan and clinician are the source of truth.";

  private final PregnancyService pregnancyService;
  private final BabyGrowthContentCatalog contentCatalog;
  private final UserPreferenceRepo preferenceRepository;
  private final PublicAudioLibraryService publicAudioLibraryService;

  @Autowired
  public BabyGrowthService(
      PregnancyService pregnancyService,
      BabyGrowthContentCatalog contentCatalog,
      UserPreferenceRepo preferenceRepository,
      PublicAudioLibraryService publicAudioLibraryService
  ) {
    this.pregnancyService = pregnancyService;
    this.contentCatalog = contentCatalog;
    this.preferenceRepository = preferenceRepository;
    this.publicAudioLibraryService = publicAudioLibraryService;
  }

  public BabyGrowthService(PregnancyService pregnancyService, BabyGrowthContentCatalog contentCatalog) {
    this.pregnancyService = pregnancyService;
    this.contentCatalog = contentCatalog;
    this.preferenceRepository = null;
    this.publicAudioLibraryService = null;
  }

  @Transactional(readOnly = true)
  public BabyGrowthResponse getToday(String userEmail) {
    return buildToday(userEmail, DEFAULT_AUDIO_LANGUAGE);
  }

  @Transactional(readOnly = true)
  public BabyGrowthResponse getToday(Authentication authentication) {
    User user = currentUser(authentication);
    String language = preferenceRepository == null ? "ENGLISH" : preferenceRepository.findByUserId(user.getId())
        .map(preference -> preference.getLanguage())
        .orElse("ENGLISH");
    return buildToday(user.getEmail(), language);
  }

  private BabyGrowthResponse buildToday(String userEmail, String language) {
    PregnancySummaryResponse pregnancy = pregnancyService.getMyPregnancy(userEmail);
    BabyGrowthWeekContent content = contentCatalog.getForWeek(pregnancy.week());
    String normalizedLanguage = normalizeLanguage(language);
    String fallbackUrl = audioUrlForWeekAndLanguage(pregnancy.week(), normalizedLanguage);
    String audioUrl = publicAudioLibraryService == null
        ? fallbackUrl
        : publicAudioLibraryService.audioUrlFor(AdminAudioCategory.BABY_GROWTH, normalizedLanguage, fallbackUrl);

    return new BabyGrowthResponse(
        "Baby Growth",
        "Your baby is growing beautifully!",
        new BabyGrowthResponse.AudioUpdate(
            normalizedLanguage,
            "Listen in " + titleCase(normalizedLanguage),
            AUDIO_DURATION_SECONDS,
            audioUrl
        ),
        new BabyGrowthResponse.PregnancyStatus(
            "You are " + pregnancy.week() + " weeks pregnant",
            formatTrimester(pregnancy.trimester()),
            "Week " + pregnancy.week(),
            pregnancy.week(),
            pregnancy.daysToGo()
        ),
        new BabyGrowthResponse.GrowthThisWeek(
            content.lengthLabel(),
            content.weightLabel(),
            content.heartbeatLabel()
        ),
        content.happenings()
            .stream()
            .map(BabyGrowthResponse.WeeklyHappening::new)
            .toList(),
        DISCLAIMER
    );
  }

  private User currentUser(Authentication authentication) {
    if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
      throw new IllegalArgumentException("Authenticated user is required.");
    }
    return user;
  }

  private String audioUrlForWeekAndLanguage(int week, String language) {
    String safeLanguage = language.toLowerCase(Locale.ENGLISH);
    return "/audio/baby-growth/" + safeLanguage + "/week-" + week + ".mp3";
  }

  private String normalizeLanguage(String language) {
    return language == null || language.isBlank() ? "ENGLISH" : language.trim().toUpperCase(Locale.ENGLISH);
  }

  private String titleCase(String language) {
    String lower = language.toLowerCase(Locale.ENGLISH);
    return lower.substring(0, 1).toUpperCase(Locale.ENGLISH) + lower.substring(1);
  }

  private String formatTrimester(String trimester) {
    if (trimester == null || trimester.isBlank()) {
      return "";
    }

    String normalized = trimester.trim().toLowerCase(Locale.ENGLISH);

    if (normalized.startsWith("1st")) {
      return "1st Trimester";
    }
    if (normalized.startsWith("2nd")) {
      return "2nd Trimester";
    }
    if (normalized.startsWith("3rd")) {
      return "3rd Trimester";
    }

    return trimester.trim();
  }
}
