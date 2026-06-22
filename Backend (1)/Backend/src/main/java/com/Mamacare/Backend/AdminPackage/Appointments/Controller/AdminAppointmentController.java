package com.Mamacare.Backend.AdminPackage.Appointments.Controller;

import com.Mamacare.Backend.AdminPackage.Appointments.Dto.AdminAppointmentResponse;
import com.Mamacare.Backend.AdminPackage.Appointments.Services.AdminAppointmentService;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentController {

    private final AdminAppointmentService appointmentService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(appointmentService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<AdminAppointmentResponse>> listAppointments(
            @RequestParam(required = false) AppointmentStatus status
    ) {
        return ResponseEntity.ok(appointmentService.listAppointments(status));
    }
}
