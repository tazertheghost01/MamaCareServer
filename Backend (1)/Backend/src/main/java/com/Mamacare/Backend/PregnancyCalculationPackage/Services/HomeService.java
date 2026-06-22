package com.Mamacare.Backend.PregnancyCalculationPackage.Services;


import com.Mamacare.Backend.AppointmentPackage.Entity.Appointment;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentStatus;
import com.Mamacare.Backend.AppointmentPackage.Repo.AppointmentRepo;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.LearnPackage.Services.LearnService;
import com.Mamacare.Backend.MedicationRemiderPackage.Entity.Medication;
import com.Mamacare.Backend.MedicationRemiderPackage.Repo.MedicationRepo;
import com.Mamacare.Backend.MedicationRemiderPackage.Service.MedicationScheduleCalculator;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.HomeSummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySummaryResponse;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeService {

  private static final String DEFAULT_TIMEZONE = "Africa/Lagos";
  private static final DateTimeFormatter DISPLAY_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("h.mm a", Locale.ENGLISH);

  private final PregnancyService pregnancyService;
  private final UserRepository userRepository;
  private final AppointmentRepo appointmentRepository;
  private final MedicationRepo medicationRepository;
  private final MedicationScheduleCalculator medicationScheduleCalculator;
  private final LearnService learnService;

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
        todayReminders(user),
        learnService.getTipsOfTheDay()
            .stream()
            .map(card -> new HomeSummaryResponse.LearnCard(
                card.title(),
                (card.durationSeconds() / 60.0) + " min",
                card.language()
            ))
            .toList()
    );
  }

  private List<HomeSummaryResponse.HomeReminderItem> todayReminders(User user) {
    List<HomeSummaryResponse.HomeReminderItem> reminders = new ArrayList<>();

    medicationRepository.findByUserIdAndActiveTrueOrderByMedicationTimeAsc(user.getId())
        .stream()
        .filter(medicationScheduleCalculator::shouldShowToday)
        .limit(3)
        .map(this::toMedicationReminder)
        .forEach(reminders::add);

    OffsetDateTime now = OffsetDateTime.now(ZoneId.of(DEFAULT_TIMEZONE));
    appointmentRepository
        .findFirstByUserIdAndStatusAndScheduledStartAtGreaterThanEqualOrderByScheduledStartAtAsc(
            user.getId(),
            AppointmentStatus.SCHEDULED,
            now
        )
        .map(this::toAppointmentReminder)
        .ifPresent(reminders::add);

    return reminders;
  }

  private HomeSummaryResponse.HomeReminderItem toMedicationReminder(Medication medication) {
    return new HomeSummaryResponse.HomeReminderItem(
        "MEDICATION",
        "Take " + medication.getMedicineName(),
        DISPLAY_TIME_FORMATTER.format(medication.getMedicationTime()),
        medication.getDose()
    );
  }

  private HomeSummaryResponse.HomeReminderItem toAppointmentReminder(Appointment appointment) {
    return new HomeSummaryResponse.HomeReminderItem(
        "APPOINTMENT",
        appointment.getAppointmentType().name().replace('_', ' '),
        DISPLAY_TIME_FORMATTER.format(appointment.getScheduledStartAt().toLocalTime()),
        appointment.getLocationName()
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
