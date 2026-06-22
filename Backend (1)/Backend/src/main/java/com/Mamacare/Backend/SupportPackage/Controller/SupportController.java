package com.Mamacare.Backend.SupportPackage.Controller;

import com.Mamacare.Backend.SupportPackage.Dto.CreateSupportTicketRequest;
import com.Mamacare.Backend.SupportPackage.Dto.SupportHomeResponse;
import com.Mamacare.Backend.SupportPackage.Dto.SupportTicketResponse;
import com.Mamacare.Backend.SupportPackage.Services.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @GetMapping("/home")
    public ResponseEntity<SupportHomeResponse> getHome() {
        return ResponseEntity.ok(supportService.getHome());
    }

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicketResponse> createTicket(
            @Valid @RequestBody CreateSupportTicketRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supportService.createTicket(request, authentication));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketResponse>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(supportService.getMyTickets(authentication));
    }
}
