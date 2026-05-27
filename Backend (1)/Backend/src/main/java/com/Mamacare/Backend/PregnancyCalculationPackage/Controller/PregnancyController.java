package com.Mamacare.Backend.PregnancyCalculationPackage.Controller;

import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySetupRequest;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Services.PregnancyService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pregnancy")
@RequiredArgsConstructor
public class PregnancyController {

  private final PregnancyService pregnancyService;

  @PostMapping("/setup")
  public ResponseEntity<PregnancySummaryResponse> setup(
      @Valid @RequestBody PregnancySetupRequest request,
      Principal principal
  ) {
    return ResponseEntity.ok(pregnancyService.setup(request, principal.getName()));
  }

  @GetMapping("/me")
  public ResponseEntity<PregnancySummaryResponse> getMyPregnancy(Principal principal) {
    return ResponseEntity.ok(pregnancyService.getMyPregnancy(principal.getName()));
  }
}
