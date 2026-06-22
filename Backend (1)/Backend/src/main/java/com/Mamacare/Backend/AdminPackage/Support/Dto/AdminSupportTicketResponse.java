package com.Mamacare.Backend.AdminPackage.Support.Dto;

import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketType;

import java.time.Instant;

public record AdminSupportTicketResponse(
        Long id,
        Integer userId,
        String userName,
        String userEmail,
        SupportTicketType type,
        String subject,
        String message,
        SupportTicketStatus status,
        String priority,
        Instant createdAt
) {
}
