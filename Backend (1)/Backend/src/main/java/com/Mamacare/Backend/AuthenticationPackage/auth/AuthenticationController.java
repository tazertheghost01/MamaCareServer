// package com.Mamacare.Backend.AuthenticationPackage.auth;

// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import java.io.IOException;

// @RestController
// @RequestMapping("/api/v1/auth")
// @RequiredArgsConstructor
// public class AuthenticationController {

//   private final AuthenticationService service;

//   @PostMapping("/register")
//   public ResponseEntity<AuthenticationResponse> register(
//       @RequestBody RegisterRequestDto request
//   ) {
//     return ResponseEntity.ok(service.register(request));
//   }
//   @PostMapping("/authenticate")
//   public ResponseEntity<AuthenticationResponse> authenticate(
//       @RequestBody AuthenticationRequest request
//   ) {
//     return ResponseEntity.ok(service.authenticate(request));
//   }

//   @PostMapping("/refresh-token")
//   public void refreshToken(
//       HttpServletRequest request,
//       HttpServletResponse response
//   ) throws IOException {
//     service.refreshToken(request, response);
//   }


// }


package com.Mamacare.Backend.AuthenticationPackage.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Mamacare.Backend.AuthenticationPackage.auth.Otpsection.OtpVerificationRequest;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    private final OAuth2Service oAuth2Service;

    @PostMapping("/oauth2")
    public ResponseEntity<AuthenticationResponse> authenticateWithOAuth2(
            @RequestBody OAuth2LoginRequest request
    ) {
        return ResponseEntity.ok(oAuth2Service.authenticateWithOAuth2(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterInitResponse> register(
            @RequestBody RegisterRequestDto request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthenticationResponse> verifyOtp(
            @RequestBody OtpVerificationRequest request
    ) {
        return ResponseEntity.ok(service.verifyOtp(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/refresh-token")
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        service.refreshToken(request, response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<RegisterInitResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(service.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<RegisterInitResponse> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        return ResponseEntity.ok(service.resetPassword(request));
    }
}
