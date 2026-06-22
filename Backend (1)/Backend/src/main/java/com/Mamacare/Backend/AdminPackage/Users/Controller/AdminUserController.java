package com.Mamacare.Backend.AdminPackage.Users.Controller;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Users.Dto.AdminUserResponse;
import com.Mamacare.Backend.AdminPackage.Users.Services.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService userService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(userService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean enabled
    ) {
        return ResponseEntity.ok(userService.listUsers(search, enabled));
    }
}
