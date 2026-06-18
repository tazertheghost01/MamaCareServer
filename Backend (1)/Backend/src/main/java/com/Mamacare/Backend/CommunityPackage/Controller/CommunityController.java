package com.Mamacare.Backend.CommunityPackage.Controller;

import com.Mamacare.Backend.CommunityPackage.Dto.CommunityCommentResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityEventRegistrationResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityHomeResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityJoinGroupResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunitySearchResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CreateCommunityCommentRequest;
import com.Mamacare.Backend.CommunityPackage.Dto.CreateCommunityQuestionRequest;
import com.Mamacare.Backend.CommunityPackage.Services.CommunityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
public class CommunityController {

  private final CommunityService communityService;

  @GetMapping("/home")
  public ResponseEntity<CommunityHomeResponse> getHome(Principal principal) {
    return ResponseEntity.ok(communityService.getHome(email(principal)));
  }

  @GetMapping("/search")
  public ResponseEntity<CommunitySearchResponse> search(
      @RequestParam("query") @Size(min = 2, max = 80) String query,
      Principal principal
  ) {
    return ResponseEntity.ok(communityService.search(query, email(principal)));
  }

  @PostMapping("/questions")
  @ResponseStatus(HttpStatus.CREATED)
  public CommunityHomeResponse.DiscussionCard askQuestion(
      @Valid @RequestBody CreateCommunityQuestionRequest request,
      Principal principal
  ) {
    return communityService.askQuestion(request, email(principal));
  }

  @GetMapping("/discussions/{discussionId}/comments")
  public ResponseEntity<List<CommunityCommentResponse>> getComments(@PathVariable Long discussionId) {
    return ResponseEntity.ok(communityService.getComments(discussionId));
  }

  @PostMapping("/discussions/{discussionId}/comments")
  @ResponseStatus(HttpStatus.CREATED)
  public CommunityCommentResponse addComment(
      @PathVariable Long discussionId,
      @Valid @RequestBody CreateCommunityCommentRequest request,
      Principal principal
  ) {
    return communityService.addComment(discussionId, request, email(principal));
  }

  @PostMapping("/groups/{groupId}/join")
  public ResponseEntity<CommunityJoinGroupResponse> joinGroup(
      @PathVariable Long groupId,
      Principal principal
  ) {
    return ResponseEntity.ok(communityService.joinGroup(groupId, email(principal)));
  }

  @DeleteMapping("/groups/{groupId}/join")
  public ResponseEntity<CommunityJoinGroupResponse> leaveGroup(
      @PathVariable Long groupId,
      Principal principal
  ) {
    return ResponseEntity.ok(communityService.leaveGroup(groupId, email(principal)));
  }

  @PostMapping("/events/{eventId}/register")
  public ResponseEntity<CommunityEventRegistrationResponse> registerForEvent(
      @PathVariable Long eventId,
      Principal principal
  ) {
    return ResponseEntity.ok(communityService.registerForEvent(eventId, email(principal)));
  }

  private String email(Principal principal) {
    if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }
    return principal.getName();
  }
}
