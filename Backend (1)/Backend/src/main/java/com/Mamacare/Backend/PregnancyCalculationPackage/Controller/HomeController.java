package com.Mamacare.Backend.PregnancyCalculationPackage.Controller;

import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.HomeSummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Services.HomeService;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
public class HomeController {

  private final HomeService homeService;

  @GetMapping("/summary")
  public ResponseEntity<HomeSummaryResponse> summary(Principal principal) {
    return ResponseEntity.ok(homeService.summary(principal.getName()));
  }
}
