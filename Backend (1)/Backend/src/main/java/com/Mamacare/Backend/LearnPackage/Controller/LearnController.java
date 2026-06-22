package com.Mamacare.Backend.LearnPackage.Controller;

import com.Mamacare.Backend.LearnPackage.Dto.LearnCardResponse;
import com.Mamacare.Backend.LearnPackage.Dto.LearnHomeResponse;
import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import com.Mamacare.Backend.LearnPackage.Services.LearnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/learn")
@RequiredArgsConstructor
public class LearnController {

    private final LearnService learnService;

    @GetMapping("/home")
    public ResponseEntity<LearnHomeResponse> getHome() {
        return ResponseEntity.ok(learnService.getHome());
    }

    @GetMapping("/tips")
    public ResponseEntity<List<LearnCardResponse>> getTips(@RequestParam(required = false) LearnCategory category) {
        return ResponseEntity.ok(learnService.getTipsByCategory(category));
    }

    @GetMapping("/tips/today")
    public ResponseEntity<List<LearnCardResponse>> getTipsOfTheDay() {
        return ResponseEntity.ok(learnService.getTipsOfTheDay());
    }
}
