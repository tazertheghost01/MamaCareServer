package com.Mamacare.Backend.AdminPackage.Support.Controller;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Support.Dto.AdminSupportTicketResponse;
import com.Mamacare.Backend.AdminPackage.Support.Dto.UpdateSupportTicketStatusRequest;
import com.Mamacare.Backend.AdminPackage.Support.Services.AdminSupportService;
import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/support")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportController {

    private final AdminSupportService supportService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(supportService.getStats());
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<AdminSupportTicketResponse>> listTickets(
            @RequestParam(required = false) SupportTicketStatus status
    ) {
        return ResponseEntity.ok(supportService.listTickets(status));
    }

    @PatchMapping("/tickets/{ticketId}/status")
    public ResponseEntity<AdminSupportTicketResponse> updateStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateSupportTicketStatusRequest request
    ) {
        return ResponseEntity.ok(supportService.updateStatus(ticketId, request.status()));
    }
}
