package com.Mamacare.Backend.PregnancyCalculationPackage.Dto;

import java.util.List;

public record HomeSummaryResponse(
    String greeting,
    PregnancyCard pregnancy,
    AudioUpdate audioUpdate,
    List<HomeReminderItem> todayReminders,
    List<LearnCard> learnCards
) {
  public record PregnancyCard(int week, String trimester, long daysToGo) {}
  public record AudioUpdate(String language, int durationSeconds) {}
  public record HomeReminderItem(String type, String title, String timeLabel, String subtitle) {}
  public record LearnCard(String title, String durationLabel, String language) {}
}
