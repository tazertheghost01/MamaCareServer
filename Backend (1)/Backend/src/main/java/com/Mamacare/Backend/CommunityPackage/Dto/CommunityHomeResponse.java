package com.Mamacare.Backend.CommunityPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

public record CommunityHomeResponse(
    @JsonProperty("screen_title")
    String screenTitle,

    @JsonProperty("hero_message")
    String heroMessage,

    @JsonProperty("search_placeholder")
    String searchPlaceholder,

    @JsonProperty("ask_question_label")
    String askQuestionLabel,

    List<String> tabs,

    List<GroupCard> groups,

    @JsonProperty("popular_discussions")
    List<DiscussionCard> popularDiscussions,

    @JsonProperty("featured_event")
    EventCard featuredEvent,

    Footer footer
) {
  public record GroupCard(
      Long id,
      String name,
      String description,

      @JsonProperty("member_count")
      long memberCount,

      @JsonProperty("member_count_label")
      String memberCountLabel,

      boolean joined,

      @JsonProperty("action_label")
      String actionLabel
  ) {}

  public record DiscussionCard(
      Long id,
      String title,

      @JsonProperty("group_name")
      String groupName,

      @JsonProperty("author_name")
      String authorName,

      @JsonProperty("comment_count")
      long commentCount,

      @JsonProperty("comment_count_label")
      String commentCountLabel,

      @JsonProperty("time_ago")
      String timeAgo
  ) {}

  public record EventCard(
      Long id,
      String title,
      String status,

      @JsonProperty("status_label")
      String statusLabel,

      @JsonProperty("starts_at")
      Instant startsAt,

      @JsonProperty("display_time")
      String displayTime,

      @JsonProperty("registration_count")
      long registrationCount,

      @JsonProperty("registration_count_label")
      String registrationCountLabel,

      boolean registered,

      @JsonProperty("action_label")
      String actionLabel
  ) {}

  public record Footer(String title, String body) {}
}
