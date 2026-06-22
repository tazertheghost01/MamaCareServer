package com.Mamacare.Backend.AdminPackage.Pregnancies.Controller;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Pregnancies.Dto.AdminPregnancyResponse;
import com.Mamacare.Backend.AdminPackage.Pregnancies.Services.AdminPregnancyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/pregnancies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPregnancyController {

    private final AdminPregnancyService pregnancyService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(pregnancyService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<AdminPregnancyResponse>> listPregnancies() {
        return ResponseEntity.ok(pregnancyService.listPregnancies());
    }
}
