package com.Mamacare.Backend.AdminPackage.Reports.Controller;

import com.Mamacare.Backend.AdminPackage.Reports.Dto.AdminReportsResponse;
import com.Mamacare.Backend.AdminPackage.Reports.Services.AdminReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportsController {

    private final AdminReportsService reportsService;

    @GetMapping
    public ResponseEntity<AdminReportsResponse> getReports() {
        return ResponseEntity.ok(reportsService.getReports());
    }
}
