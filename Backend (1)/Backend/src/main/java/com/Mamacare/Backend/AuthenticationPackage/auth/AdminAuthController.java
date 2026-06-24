package com.Mamacare.Backend.AuthenticationPackage.auth;

import com.Mamacare.Backend.AuthenticationPackage.auth.dto.RegisterRequestDto;
import com.Mamacare.Backend.AuthenticationPackage.auth.dto.AuthenticationRequest;
import com.Mamacare.Backend.AuthenticationPackage.auth.dto.ForgotPasswordRequest;
import com.Mamacare.Backend.AuthenticationPackage.auth.dto.ResetPasswordRequest;
import com.Mamacare.Backend.AuthenticationPackage.auth.dto.AuthenticationResponse;
import com.Mamacare.Backend.AuthenticationPackage.auth.dto.RegisterInitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/v1/auth/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<RegisterInitResponse> register(@RequestBody RegisterRequestDto request) {
        // Force ADMIN role for admin registration
        request.setRole(com.Mamacare.Backend.AuthenticationPackage.user.Role.ADMIN);
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<RegisterInitResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authenticationService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<RegisterInitResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authenticationService.resetPassword(request));
    }
}
