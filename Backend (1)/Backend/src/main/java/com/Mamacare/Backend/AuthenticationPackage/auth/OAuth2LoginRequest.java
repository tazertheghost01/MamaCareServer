package com.Mamacare.Backend.AuthenticationPackage.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2LoginRequest {
    @NotBlank(message = "Provider is required (google or apple)")
    private String provider; // "google" or "apple"

    @NotBlank(message = "ID Token is required")
    private String idToken;

    // Optional fields for Apple (Apple only provides name on first login)
    private String firstName;
    private String lastName;
}
