package com.Mamacare.Backend.AdminPackage.Community.Controller;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Community.Dto.AdminCommunityPostResponse;
import com.Mamacare.Backend.AdminPackage.Community.Dto.UpdateCommunityPostStatusRequest;
import com.Mamacare.Backend.AdminPackage.Community.Services.AdminCommunityService;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/community")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCommunityController {

    private final AdminCommunityService communityService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(communityService.getStats());
    }

    @GetMapping("/posts")
    public ResponseEntity<List<AdminCommunityPostResponse>> listPosts(
            @RequestParam(required = false) CommunityDiscussionStatus status
    ) {
        return ResponseEntity.ok(communityService.listPosts(status));
    }

    @PatchMapping("/posts/{postId}/status")
    public ResponseEntity<AdminCommunityPostResponse> updatePostStatus(
            @PathVariable Long postId,
            @Valid @RequestBody UpdateCommunityPostStatusRequest request
    ) {
        return ResponseEntity.ok(communityService.updateStatus(postId, request.status()));
    }
}
