package com.Mamacare.Backend.ProfilePackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.ProfilePackage.Dto.AccountDeactivationResponse;
import com.Mamacare.Backend.ProfilePackage.Dto.ProfileResponse;
import com.Mamacare.Backend.ProfilePackage.Dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Authentication authentication) {
        return toResponse(getCurrentUser(authentication));
    }

    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);

        if (request.fullname() != null && !request.fullname().isBlank()) {
            user.setFullname(request.fullname().trim());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(normalizeText(request.phoneNumber()));
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AccountDeactivationResponse deactivateAccount(Authentication authentication) {
        User user = getCurrentUser(authentication);
        user.setEnabled(false);
        userRepository.save(user);

        return new AccountDeactivationResponse(
                true,
                "Your account has been disabled. Contact support if this was a mistake."
        );
    }

    private ProfileResponse toResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getFullname(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.isEnabled(),
                user.getRole() == null ? null : user.getRole().name()
        );
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
        return user;
    }

    private String normalizeText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
