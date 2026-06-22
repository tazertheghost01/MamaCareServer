package com.Mamacare.Backend.SupportPackage.Dto;

import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSupportTicketRequest(
        @NotNull(message = "type is required")
        SupportTicketType type,

        @NotBlank(message = "subject is required")
        @Size(max = 160, message = "subject must be 160 characters or less")
        String subject,

        @NotBlank(message = "message is required")
        @Size(max = 3000, message = "message must be 3000 characters or less")
        String message
) {}
