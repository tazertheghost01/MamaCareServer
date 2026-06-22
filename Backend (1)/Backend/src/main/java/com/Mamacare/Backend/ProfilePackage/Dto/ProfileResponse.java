package com.Mamacare.Backend.ProfilePackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProfileResponse(
        Integer id,
        String fullname,
        String email,

        @JsonProperty("phone_number")
        String phoneNumber,

        boolean enabled,
        String role
) {}
