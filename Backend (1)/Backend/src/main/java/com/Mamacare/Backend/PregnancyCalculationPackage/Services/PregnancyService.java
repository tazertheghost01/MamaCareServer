package com.Mamacare.Backend.PregnancyCalculationPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySetupRequest;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyProfile;
import com.Mamacare.Backend.PregnancyCalculationPackage.Enum.PregnancyDateSource;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyProfileRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PregnancyService {

  private static final int GESTATION_DAYS = 280;
  private static final int MIN_WEEK = 1;
  private static final int MAX_WEEK = 42;

  private final PregnancyProfileRepository profileRepository;
  private final UserRepository userRepository;

  @Transactional
  public PregnancySummaryResponse setup(PregnancySetupRequest request, String userEmail) {
    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    LocalDate dueDate;
    LocalDate lmp;

    if (request.source() == PregnancyDateSource.DUE_DATE) {
      dueDate = request.dueDate();
      lmp = dueDate.minusDays(GESTATION_DAYS);
    } else {
      lmp = request.lastMenstrualPeriod();
      dueDate = lmp.plusDays(GESTATION_DAYS);
    }

    validateTimeline(lmp, dueDate);

    PregnancyProfile profile = profileRepository.findByUser(user)
        .orElse(PregnancyProfile.builder().user(user).build());

    profile.setSource(request.source());
    profile.setDueDate(dueDate);
    profile.setLastMenstrualPeriod(lmp);

    PregnancyProfile saved = profileRepository.save(profile);
    return toSummary(saved);
  }

  @Transactional(readOnly = true)
  public PregnancySummaryResponse getMyPregnancy(String userEmail) {
    User user = userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    PregnancyProfile profile = profileRepository.findByUser(user)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Pregnancy profile not found. Call POST /api/v1/pregnancy/setup first."
        ));

    return toSummary(profile);
  }

  private void validateTimeline(LocalDate lmp, LocalDate dueDate) {
    LocalDate today = LocalDate.now();

    if (lmp.isAfter(today)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "lastMenstrualPeriod cannot be in the future");
    }

    if (dueDate.isBefore(today.minusDays(14))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dueDate is too far in the past");
    }
  }

  private PregnancySummaryResponse toSummary(PregnancyProfile profile) {
    LocalDate today = LocalDate.now();

    long daysSinceLmp = ChronoUnit.DAYS.between(profile.getLastMenstrualPeriod(), today);
    int calculatedWeek = (int) (daysSinceLmp / 7) + 1;
    int week = Math.max(MIN_WEEK, Math.min(calculatedWeek, MAX_WEEK));

    String trimester = week <= 13 ? "1st trimester" : (week <= 27 ? "2nd trimester" : "3rd trimester");

    long daysToGo = ChronoUnit.DAYS.between(today, profile.getDueDate());
    if (daysToGo < 0) {
      daysToGo = 0;
    }

    return new PregnancySummaryResponse(
        profile.getDueDate(),
        profile.getLastMenstrualPeriod(),
        profile.getSource(),
        week,
        trimester,
        daysToGo
    );
  }
}