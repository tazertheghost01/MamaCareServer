package com.Mamacare.Backend.PreferencesPackage.Controller;

import com.Mamacare.Backend.PreferencesPackage.Dto.UpdateUserPreferenceRequest;
import com.Mamacare.Backend.PreferencesPackage.Dto.UserPreferenceResponse;
import com.Mamacare.Backend.PreferencesPackage.Services.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceService preferenceService;

    @GetMapping
    public ResponseEntity<UserPreferenceResponse> getPreferences(Authentication authentication) {
        return ResponseEntity.ok(preferenceService.getPreferences(authentication));
    }

    @PatchMapping
    public ResponseEntity<UserPreferenceResponse> updatePreferences(
            @RequestBody UpdateUserPreferenceRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(preferenceService.updatePreferences(request, authentication));
    }
}
