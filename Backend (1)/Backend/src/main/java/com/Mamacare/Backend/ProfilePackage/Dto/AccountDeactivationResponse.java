package com.Mamacare.Backend.ProfilePackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AccountDeactivationResponse(
        @JsonProperty("account_disabled")
        boolean accountDisabled,
        String message
) {}
