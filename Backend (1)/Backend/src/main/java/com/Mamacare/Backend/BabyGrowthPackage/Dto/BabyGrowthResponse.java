package com.Mamacare.Backend.BabyGrowthPackage.Dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
    
public record BabyGrowthResponse(
    @JsonProperty("screen_title")
    String screenTitle,

    @JsonProperty("hero_message")
    String heroMessage,

    @JsonProperty("audio_update")
    AudioUpdate audioUpdate,

    @JsonProperty("pregnancy_status")
    PregnancyStatus pregnancyStatus,

    @JsonProperty("growth_this_week")
    GrowthThisWeek growthThisWeek,

    @JsonProperty("happenings")
    List<WeeklyHappening> happenings,

    String disclaimer
) {

  public record AudioUpdate(
      String language,

      String label,

      @JsonProperty("duration_seconds")
      int durationSeconds,

      @JsonProperty("audio_url")
      String audioUrl
  ) {}

  public record PregnancyStatus(
      String message,
      String trimester,

      @JsonProperty("week_label")
      String weekLabel,

      int week,

      @JsonProperty("days_to_go")
      long daysToGo
  ) {}

  public record GrowthThisWeek(
      @JsonProperty("length_label")
      String lengthLabel,

      @JsonProperty("weight_label")
      String weightLabel,

      @JsonProperty("heartbeat_label")
      String heartbeatLabel
  ) {}

  public record WeeklyHappening(String text) {}
}