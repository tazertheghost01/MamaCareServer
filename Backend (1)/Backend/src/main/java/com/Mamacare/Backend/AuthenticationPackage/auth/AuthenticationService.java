// package com.Mamacare.Backend.AuthenticationPackage.auth;

// import com.Mamacare.Backend.AuthenticationPackage.config.JwtService;
// import com.Mamacare.Backend.AuthenticationPackage.token.Token;
// import com.Mamacare.Backend.AuthenticationPackage.token.TokenRepository;
// import com.Mamacare.Backend.AuthenticationPackage.token.TokenType;
// import com.Mamacare.Backend.AuthenticationPackage.user.Role;
// import com.Mamacare.Backend.AuthenticationPackage.user.User;
// import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.HttpHeaders;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// import org.springframework.stereotype.Service;

// import java.io.IOException;

// @Service
// @RequiredArgsConstructor
// public class AuthenticationService {
//   private final UserRepository repository;
//   private final TokenRepository tokenRepository;
//   private final PasswordEncoder passwordEncoder;
//   private final JwtService jwtService;
//   private final AuthenticationManager authenticationManager;

//   public AuthenticationResponse register(RegisterRequestDto request) {
//     var user = User.builder()
//         .fullname(request.getFullname())
//         .phoneNumber(request.getPhoneNumber())
//         .email(request.getEmail())
//         .password(passwordEncoder.encode(request.getPassword()))
//         .role(request.getRole())
//         .build();
//     var savedUser = repository.save(user);
//     var jwtToken = jwtService.generateToken(user);
//     var refreshToken = jwtService.generateRefreshToken(user);
//     saveUserToken(savedUser, jwtToken);
//     return AuthenticationResponse.builder()
//         .accessToken(jwtToken)
//             .refreshToken(refreshToken)
//         .build();
//   }

//   public AuthenticationResponse authenticate(AuthenticationRequest request) {
//     authenticationManager.authenticate(
//         new UsernamePasswordAuthenticationToken(
//             request.getEmail(),
//             request.getPassword()
//         )
//     );
//     var user = repository.findByEmail(request.getEmail())
//         .orElseThrow();
//     var jwtToken = jwtService.generateToken(user);
//     var refreshToken = jwtService.generateRefreshToken(user);
//     revokeAllUserTokens(user);
//     saveUserToken(user, jwtToken);
//     return AuthenticationResponse.builder()
//         .accessToken(jwtToken)
//             .refreshToken(refreshToken)
//         .build();
//   }

//   private void saveUserToken(User user, String jwtToken) {
//     var token = Token.builder()
//         .user(user)
//         .token(jwtToken)
//         .tokenType(TokenType.BEARER)
//         .expired(false)
//         .revoked(false)
//         .build();
//     tokenRepository.save(token);
//   }

//   private void revokeAllUserTokens(User user) {
//     var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
//     if (validUserTokens.isEmpty())
//       return;
//     validUserTokens.forEach(token -> {
//       token.setExpired(true);
//       token.setRevoked(true);
//     });
//     tokenRepository.saveAll(validUserTokens);
//   }

//   public void refreshToken(
//           HttpServletRequest request,
//           HttpServletResponse response
//   ) throws IOException {
//     final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
//     final String refreshToken;
//     final String userEmail;
//     if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
//       return;
//     }
//     refreshToken = authHeader.substring(7);
//     userEmail = jwtService.extractUsername(refreshToken);
//     if (userEmail != null) {
//       var user = this.repository.findByEmail(userEmail)
//               .orElseThrow();
//       if (jwtService.isTokenValid(refreshToken, user)) {
//         var accessToken = jwtService.generateToken(user);
//         revokeAllUserTokens(user);
//         saveUserToken(user, accessToken);
//         var authResponse = AuthenticationResponse.builder()
//                 .accessToken(accessToken)
//                 .refreshToken(refreshToken)
//                 .build();
//         new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
//       }
//     }
//   }
// }



package com.Mamacare.Backend.AuthenticationPackage.auth;

import com.Mamacare.Backend.AuthenticationPackage.auth.Otpsection.OtpService;
import com.Mamacare.Backend.AuthenticationPackage.auth.Otpsection.OtpVerificationRequest;
import com.Mamacare.Backend.AuthenticationPackage.config.JwtService;
import com.Mamacare.Backend.AuthenticationPackage.token.Token;
import com.Mamacare.Backend.AuthenticationPackage.token.TokenRepository;
import com.Mamacare.Backend.AuthenticationPackage.token.TokenType;
import com.Mamacare.Backend.AuthenticationPackage.user.Role;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final JavaMailSender mailSender;

    public RegisterInitResponse register(RegisterRequestDto request) {
        if (repository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists."
            );
        }
        String otp = otpService.storePending(request);
        sendOtpEmail(request.getEmail(), request.getFirstName(), otp);
        return new RegisterInitResponse(
                "A verification code has been sent to " + request.getEmail(),
                request.getEmail()
        );
    }

    public AuthenticationResponse verifyOtp(OtpVerificationRequest request) {
        RegisterRequestDto pending = otpService
                .verify(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid or expired OTP. Please try again."
                ));

        var user = User.builder()
                .fullname(pending.getFullname())
                .phoneNumber(pending.getPhoneNumber())
                .email(pending.getEmail().toLowerCase())
                .password(passwordEncoder.encode(pending.getPassword()))
                .role(pending.getRole() != null ? pending.getRole() : Role.USER)
                .enabled(true)
                .build();

        var savedUser = repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(savedUser, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Incorrect email or password."
            );
        } catch (DisabledException e) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is disabled. Please contact support."
            );
        }
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No account found with this email address."
                ));
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    private void sendOtpEmail(String email, String firstName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom("info@mamacareng.com");
        message.setSubject("Your MamaCare Verification Code");
        message.setText(
                "Hi " + (firstName != null ? firstName : "there") + ",\n\n" +
                "Your MamaCare verification code is:\n\n" +
                "        " + otp + "\n\n" +
                "This code expires in 10 minutes.\n" +
                "Do not share it with anyone.\n\n" +
                "If you did not create a MamaCare account, ignore this email.\n\n" +
                "-- The MamaCare Team"
        );
        mailSender.send(message);
    }

    private void sendPasswordResetEmail(String email, String firstName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom("info@mamacareng.com");
        message.setSubject("Reset Your MamaCare Password");
        message.setText(
                "Hi " + (firstName != null ? firstName : "there") + ",\n\n" +
                "You requested a password reset. Your MamaCare verification code is:\n\n" +
                "        " + otp + "\n\n" +
                "This code expires in 10 minutes.\n" +
                "Do not share it with anyone.\n\n" +
                "If you did not request a password reset, please ignore this email or contact support.\n\n" +
                "-- The MamaCare Team"
        );
        mailSender.send(message);
    }

    public RegisterInitResponse forgotPassword(ForgotPasswordRequest request) {
        var user = repository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No account found with this email address."
                ));
        String otp = otpService.storePasswordResetOtp(user.getEmail());
        sendPasswordResetEmail(user.getEmail(), user.getFullname(), otp);
        return new RegisterInitResponse(
                "A password reset code has been sent to " + user.getEmail(),
                user.getEmail()
        );
    }

    public RegisterInitResponse resetPassword(ResetPasswordRequest request) {
        var user = repository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No account found with this email address."
                ));
        if (!otpService.verifyPasswordResetOtp(request.getEmail(), request.getOtp())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid or expired OTP. Please try again."
            );
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);
        return new RegisterInitResponse(
                "Your password has been successfully reset. You can now log in.",
                user.getEmail()
        );
    }

    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty()) return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return;
        final String refreshToken = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.repository.findByEmail(userEmail).orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }
}
