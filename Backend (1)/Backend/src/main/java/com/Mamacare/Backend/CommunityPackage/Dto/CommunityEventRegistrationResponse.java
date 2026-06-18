package com.Mamacare.Backend.CommunityPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CommunityEventRegistrationResponse(
    boolean registered,

    @JsonProperty("registration_count")
    long registrationCount,

    @JsonProperty("registration_count_label")
    String registrationCountLabel
) {}
