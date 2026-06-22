package com.Mamacare.Backend.ProfilePackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 120, message = "fullname must be 120 characters or less")
        String fullname,

        @JsonProperty("phone_number")
        @Size(max = 30, message = "phone_number must be 30 characters or less")
        String phoneNumber
) {}
