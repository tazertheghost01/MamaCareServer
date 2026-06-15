package com.Mamacare.Backend.CommunityPackage.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "community.copy")
public record CommunityCopyProperties(
    String screenTitle,
    String heroMessage,
    String searchPlaceholder,
    String askQuestionLabel,
    String footerTitle,
    String footerBody,
    List<String> tabs
) {
  public CommunityCopyProperties {
    screenTitle = defaultText(screenTitle, "Community");
    heroMessage = defaultText(heroMessage, "You are not alone, Mama!");
    searchPlaceholder = defaultText(searchPlaceholder, "Search questions, topics or moms");
    askQuestionLabel = defaultText(askQuestionLabel, "Ask a Question");
    footerTitle = defaultText(footerTitle, "Be kind, be supportive, be you.");
    footerBody = defaultText(footerBody, "This is safe space for every mama.");
    tabs = tabs == null || tabs.isEmpty()
        ? List.of("Discussion", "Groups", "Events")
        : List.copyOf(tabs);
  }

  private static String defaultText(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }
}