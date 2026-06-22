package com.Mamacare.Backend.AdminPackage.Support.Dto;

import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSupportTicketStatusRequest(
        @NotNull SupportTicketStatus status
) {
}
