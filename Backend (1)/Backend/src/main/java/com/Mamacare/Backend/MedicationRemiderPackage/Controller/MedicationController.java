package com.Mamacare.Backend.MedicationRemiderPackage.Controller;

import com.Mamacare.Backend.MedicationRemiderPackage.DTOs.CreateMedicationRequest;
import com.Mamacare.Backend.MedicationRemiderPackage.DTOs.MarkMedicationTakenResponse;
import com.Mamacare.Backend.MedicationRemiderPackage.DTOs.MedicationIntakeHistoryResponse;
import com.Mamacare.Backend.MedicationRemiderPackage.DTOs.MedicationHomeResponse;
import com.Mamacare.Backend.MedicationRemiderPackage.DTOs.MedicationResponse;
import com.Mamacare.Backend.MedicationRemiderPackage.DTOs.UpdateMedicationRequest;
import com.Mamacare.Backend.MedicationRemiderPackage.Service.MedicationService;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    @PostMapping
    public ResponseEntity<MedicationResponse> createMedication(
            @Valid @RequestBody CreateMedicationRequest request,
            Authentication authentication
    ) {
        MedicationResponse response = medicationService.createMedication(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/today")
    public ResponseEntity<MedicationHomeResponse> getTodayMedications(Authentication authentication) {
        return ResponseEntity.ok(medicationService.getTodayMedications(authentication));
    }

    @GetMapping
    public ResponseEntity<List<MedicationResponse>> getAllMedications(Authentication authentication) {
        return ResponseEntity.ok(medicationService.getAllMedications(authentication));
    }

    @GetMapping("/history")
    public ResponseEntity<List<MedicationIntakeHistoryResponse>> getIntakeHistory(Authentication authentication) {
        return ResponseEntity.ok(medicationService.getIntakeHistory(authentication));
    }

    @PatchMapping("/{medicationId}")
    public ResponseEntity<MedicationResponse> updateMedication(
            @PathVariable Long medicationId,
            @Valid @RequestBody UpdateMedicationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(medicationService.updateMedication(medicationId, request, authentication));
    }

    @PatchMapping("/{medicationId}/taken")
    public ResponseEntity<MarkMedicationTakenResponse> markTaken(
            @PathVariable Long medicationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(medicationService.markTaken(medicationId, authentication));
    }

    @PatchMapping("/{medicationId}/inactive")
    public ResponseEntity<Void> deactivateMedication(
            @PathVariable Long medicationId,
            Authentication authentication
    ) {
        medicationService.deactivateMedication(medicationId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{medicationId}/reminder")
    public ResponseEntity<MedicationResponse> updateReminderEnabled(
            @PathVariable Long medicationId,
            @RequestBody UpdateReminderEnabledRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(medicationService.updateReminderEnabled(
                medicationId,
                request.reminderEnabled(),
                authentication
        ));
    }

    public record UpdateReminderEnabledRequest(
            @JsonProperty("reminder_enabled")
            boolean reminderEnabled
    ) {}
}
