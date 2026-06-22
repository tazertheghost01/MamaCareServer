package com.Mamacare.Backend.ProfilePackage.Controller;

import com.Mamacare.Backend.ProfilePackage.Dto.AccountDeactivationResponse;
import com.Mamacare.Backend.ProfilePackage.Dto.ProfileResponse;
import com.Mamacare.Backend.ProfilePackage.Dto.UpdateProfileRequest;
import com.Mamacare.Backend.ProfilePackage.Services.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfile(authentication));
    }

    @PatchMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(profileService.updateProfile(request, authentication));
    }

    @DeleteMapping("/account")
    public ResponseEntity<AccountDeactivationResponse> deactivateAccount(Authentication authentication) {
        return ResponseEntity.ok(profileService.deactivateAccount(authentication));
    }
}
