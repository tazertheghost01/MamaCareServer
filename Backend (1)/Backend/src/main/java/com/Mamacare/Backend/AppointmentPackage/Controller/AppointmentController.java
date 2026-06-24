package com.Mamacare.Backend.AppointmentPackage.Controller;

import com.Mamacare.Backend.AppointmentPackage.Dtos.AppointmentChecklistItemResponse;
import com.Mamacare.Backend.AppointmentPackage.Dtos.AppointmentResponse;
import com.Mamacare.Backend.AppointmentPackage.Dtos.CreateAppointmentRequest;
import com.Mamacare.Backend.AppointmentPackage.Dtos.NextAppointmentResponse;
import com.Mamacare.Backend.AppointmentPackage.Dtos.UpdateAppointmentRequest;
import com.Mamacare.Backend.AppointmentPackage.Dtos.UpdateChecklistItemRequest;
import com.Mamacare.Backend.AppointmentPackage.Service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @RequestBody CreateAppointmentRequest request,
            Authentication authentication
    ) {
        AppointmentResponse response = appointmentService.createAppointment(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(Authentication authentication) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(authentication));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<AppointmentResponse>> getUpcomingAppointments(Authentication authentication) {
        return ResponseEntity.ok(appointmentService.getUpcomingAppointments(authentication));
    }

    @GetMapping("/completed")
    public ResponseEntity<List<AppointmentResponse>> getCompletedAppointments(Authentication authentication) {
        return ResponseEntity.ok(appointmentService.getCompletedAppointments(authentication));
    }

    @GetMapping("/upcoming/next")
    public ResponseEntity<NextAppointmentResponse> getNextAppointment(Authentication authentication) {
        return ResponseEntity.ok(appointmentService.getNextAppointment(authentication));
    }

    @PatchMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable Long appointmentId,
            @RequestBody UpdateAppointmentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, request, authentication));
    }

    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId, authentication));
    }

    @PatchMapping("/{appointmentId}/missed")
    public ResponseEntity<AppointmentResponse> missAppointment(
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(appointmentService.missAppointment(appointmentId, authentication));
    }

    @PatchMapping("/{appointmentId}/complete")
    public ResponseEntity<AppointmentResponse> completeAppointment(
            @PathVariable Long appointmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(appointmentService.completeAppointment(appointmentId, authentication));
    }

    @PatchMapping("/{appointmentId}/checklist/{itemId}")
    public ResponseEntity<AppointmentChecklistItemResponse> updateChecklistItem(
            @PathVariable Long appointmentId,
            @PathVariable Long itemId,
            @RequestBody UpdateChecklistItemRequest request,
            Authentication authentication
    ) {
        AppointmentChecklistItemResponse response = appointmentService.updateChecklistItem(
                appointmentId,
                itemId,
                request,
                authentication
        );

        return ResponseEntity.ok(response);
    }
}
