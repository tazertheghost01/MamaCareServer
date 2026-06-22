package com.Mamacare.Backend.SupportPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SupportHomeResponse(
        @JsonProperty("screen_title")
        String screenTitle,

        @JsonProperty("hero_message")
        String heroMessage,

        @JsonProperty("contact_email")
        String contactEmail,

        List<FaqItem> faqs,
        List<SupportAction> actions
) {
    public record FaqItem(String question, String answer) {}

    public record SupportAction(String key, String label, String description) {}
}
