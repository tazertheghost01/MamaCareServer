package com.Mamacare.Backend.SupportPackage.Dto;

import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketType;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record SupportTicketResponse(
        Long id,
        SupportTicketType type,
        String subject,
        String message,
        SupportTicketStatus status,

        @JsonProperty("created_at")
        Instant createdAt
) {}
