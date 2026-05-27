package com.Mamacare.Backend.PregnancyCalculationPackage.Services;


import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.HomeSummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Services.PregnancyService;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySummaryResponse;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeService {

  private final PregnancyService pregnancyService;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public HomeSummaryResponse summary(String userEmail) {
    User user = userRepository.findByEmail(userEmail).orElseThrow();
    PregnancySummaryResponse pregnancy = pregnancyService.getMyPregnancy(userEmail);

    String greeting = greetingPrefix() + ", " + firstName(user.getFullname()) + "!";

    return new HomeSummaryResponse(
        greeting,
        new HomeSummaryResponse.PregnancyCard(
            pregnancy.week(),
            pregnancy.trimester(),
            pregnancy.daysToGo()
        ),
        new HomeSummaryResponse.AudioUpdate("PIDGIN", 75),
        List.of(),
        List.of()
    );
  }

  private String greetingPrefix() {
    int hour = LocalTime.now().getHour();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  private String firstName(String fullName) {
    if (fullName == null || fullName.isBlank()) {
      return "Mama";
    }
    String[] parts = fullName.trim().split("\\s+");
    return parts[0];
  }
}
