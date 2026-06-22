package com.Mamacare.Backend.AdminPackage.Users.Dto;

public record AdminUserResponse(
        Integer id,
        String fullName,
        String email,
        String phoneNumber,
        String role,
        String status,
        Integer gestationalWeek,
        String trimester
) {
}
