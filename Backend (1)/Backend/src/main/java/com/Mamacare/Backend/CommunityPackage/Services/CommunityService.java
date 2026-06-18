package com.Mamacare.Backend.CommunityPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.CommunityPackage.Config.CommunityCopyProperties;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityCommentResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityEventRegistrationResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityHomeResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityJoinGroupResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunitySearchResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CreateCommunityCommentRequest;
import com.Mamacare.Backend.CommunityPackage.Dto.CreateCommunityQuestionRequest;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityComment;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityDiscussion;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityEvent;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityEventRegistration;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroup;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroupMembership;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityCommentStatus;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityEventStatus;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityCommentRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityDiscussionRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityEventRegistrationRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityEventRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityGroupMembershipRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityGroupRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.GroupMemberCountView;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

  private static final ZoneId DEFAULT_ZONE = ZoneId.of("Africa/Lagos");
  private static final DateTimeFormatter EVENT_FORMATTER =
      DateTimeFormatter.ofPattern("EEE MMM d, yyyy h.mm a", Locale.ENGLISH).withZone(DEFAULT_ZONE);

  private final CommunityCopyProperties copy;
  private final UserRepository userRepository;
  private final CommunityGroupRepository groupRepository;
  private final CommunityGroupMembershipRepository membershipRepository;
  private final CommunityDiscussionRepository discussionRepository;
  private final CommunityCommentRepository commentRepository;
  private final CommunityEventRepository eventRepository;
  private final CommunityEventRegistrationRepository registrationRepository;

  @Transactional(readOnly = true)
  public CommunityHomeResponse getHome(String userEmail) {
    List<CommunityGroup> groups = groupRepository.findTop3ByActiveTrueOrderBySortOrderAscNameAsc();
    List<CommunityDiscussion> discussions =
        discussionRepository.findTop3ByStatusOrderByCommentCountDescCreatedAtDesc(
            CommunityDiscussionStatus.PUBLISHED
        );

    CommunityEvent featuredEvent = eventRepository
        .findFirstByActiveTrueAndStatusOrderByStartsAtAsc(CommunityEventStatus.LIVE)
        .or(() -> eventRepository.findFirstByActiveTrueAndStatusAndStartsAtAfterOrderByStartsAtAsc(
            CommunityEventStatus.UPCOMING,
            Instant.now()
        ))
        .orElse(null);

    return new CommunityHomeResponse(
        copy.screenTitle(),
        copy.heroMessage(),
        copy.searchPlaceholder(),
        copy.askQuestionLabel(),
        copy.tabs(),
        toGroupCards(groups, userEmail),
        discussions.stream().map(this::toDiscussionCard).toList(),
        featuredEvent == null ? null : toEventCard(featuredEvent, userEmail),
        new CommunityHomeResponse.Footer(copy.footerTitle(), copy.footerBody())
    );
  }

  @Transactional(readOnly = true)
  public CommunitySearchResponse search(String rawQuery, String userEmail) {
    String query = normalizeSearch(rawQuery);

    List<CommunityDiscussion> discussions = discussionRepository.search(
        query,
        CommunityDiscussionStatus.PUBLISHED,
        PageRequest.of(0, 10)
    );

    List<CommunityGroup> groups = groupRepository.search(query, PageRequest.of(0, 5));

    return new CommunitySearchResponse(
        discussions.stream().map(this::toDiscussionCard).toList(),
        toGroupCards(groups, userEmail)
    );
  }

  @Transactional
  public CommunityHomeResponse.DiscussionCard askQuestion(
      CreateCommunityQuestionRequest request,
      String userEmail
  ) {
    User user = findUser(userEmail);
    CommunityGroup group = findActiveGroup(request.groupId());

    CommunityDiscussion discussion = CommunityDiscussion.builder()
        .group(group)
        .author(user)
        .title(request.title().trim())
        .body(cleanNullable(request.body()))
        .status(CommunityDiscussionStatus.PUBLISHED)
        .build();

    return toDiscussionCard(discussionRepository.save(discussion));
  }

  @Transactional
  public CommunityJoinGroupResponse joinGroup(Long groupId, String userEmail) {
    User user = findUser(userEmail);
    CommunityGroup group = findActiveGroup(groupId);

    membershipRepository.findByGroup_IdAndUser_Email(groupId, userEmail)
        .orElseGet(() -> membershipRepository.save(CommunityGroupMembership.builder()
            .group(group)
            .user(user)
            .build()));

    long memberCount = membershipRepository.countByGroup_Id(groupId);
    return new CommunityJoinGroupResponse(true, memberCount, compactCount(memberCount) + " members");
  }

  @Transactional
  public CommunityJoinGroupResponse leaveGroup(Long groupId, String userEmail) {
    CommunityGroup group = findActiveGroup(groupId);

    membershipRepository.findByGroup_IdAndUser_Email(group.getId(), userEmail)
        .ifPresent(membershipRepository::delete);

    long memberCount = membershipRepository.countByGroup_Id(groupId);
    return new CommunityJoinGroupResponse(false, memberCount, compactCount(memberCount) + " members");
  }

  @Transactional(readOnly = true)
  public List<CommunityCommentResponse> getComments(Long discussionId) {
    ensureDiscussionExists(discussionId);

    return commentRepository.findByDiscussion_IdAndStatusOrderByCreatedAtAsc(
            discussionId,
            CommunityCommentStatus.PUBLISHED,
            PageRequest.of(0, 100)
        )
        .stream()
        .map(this::toCommentResponse)
        .toList();
  }

  @Transactional
  public CommunityCommentResponse addComment(
      Long discussionId,
      CreateCommunityCommentRequest request,
      String userEmail
  ) {
    User user = findUser(userEmail);
    CommunityDiscussion discussion = ensureDiscussionExists(discussionId);

    CommunityComment comment = commentRepository.save(CommunityComment.builder()
        .discussion(discussion)
        .author(user)
        .body(request.body().trim())
        .status(CommunityCommentStatus.PUBLISHED)
        .build());

    discussion.setCommentCount(discussion.getCommentCount() + 1);
    discussionRepository.save(discussion);

    return toCommentResponse(comment);
  }

  @Transactional
  public CommunityEventRegistrationResponse registerForEvent(Long eventId, String userEmail) {
    User user = findUser(userEmail);
    CommunityEvent event = eventRepository.findById(eventId)
        .filter(CommunityEvent::isActive)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community event not found"));

    if (event.getStatus() == CommunityEventStatus.CANCELLED || event.getStatus() == CommunityEventStatus.ENDED) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event is not open for registration");
    }

    registrationRepository.findByEvent_IdAndUser_Email(eventId, userEmail)
        .orElseGet(() -> registrationRepository.save(CommunityEventRegistration.builder()
            .event(event)
            .user(user)
            .build()));

    long registrationCount = registrationRepository.countByEvent_Id(eventId);
    return new CommunityEventRegistrationResponse(
        true,
        registrationCount,
        compactCount(registrationCount)
    );
  }

  private List<CommunityHomeResponse.GroupCard> toGroupCards(List<CommunityGroup> groups, String userEmail) {
    List<Long> groupIds = groups.stream().map(CommunityGroup::getId).toList();
    Map<Long, Long> counts = memberCounts(groupIds);
    Set<Long> joinedGroupIds = groupIds.isEmpty()
        ? Set.of()
        : membershipRepository.findJoinedGroupIds(userEmail, groupIds);

    return groups.stream()
        .map(group -> {
          long memberCount = counts.getOrDefault(group.getId(), 0L);
          boolean joined = joinedGroupIds.contains(group.getId());

          return new CommunityHomeResponse.GroupCard(
              group.getId(),
              group.getName(),
              group.getDescription(),
              memberCount,
              compactCount(memberCount) + " members",
              joined,
              joined ? "Joined" : "Join"
          );
        })
        .toList();
  }

  private Map<Long, Long> memberCounts(Collection<Long> groupIds) {
    if (groupIds.isEmpty()) {
      return Map.of();
    }

    return membershipRepository.countMembersByGroupIds(groupIds)
        .stream()
        .collect(Collectors.toMap(
            GroupMemberCountView::getGroupId,
            GroupMemberCountView::getMemberCount
        ));
  }

  private CommunityHomeResponse.DiscussionCard toDiscussionCard(CommunityDiscussion discussion) {
    return new CommunityHomeResponse.DiscussionCard(
        discussion.getId(),
        discussion.getTitle(),
        discussion.getGroup().getName(),
        displayName(discussion.getAuthor()),
        discussion.getCommentCount(),
        compactCount(discussion.getCommentCount()),
        timeAgo(discussion.getCreatedAt())
    );
  }

  private CommunityCommentResponse toCommentResponse(CommunityComment comment) {
    return new CommunityCommentResponse(
        comment.getId(),
        comment.getBody(),
        displayName(comment.getAuthor()),
        comment.getCreatedAt(),
        timeAgo(comment.getCreatedAt())
    );
  }

  private CommunityHomeResponse.EventCard toEventCard(CommunityEvent event, String userEmail) {
    long registrationCount = registrationRepository.countByEvent_Id(event.getId());
    boolean registered = registrationRepository.findByEvent_IdAndUser_Email(event.getId(), userEmail).isPresent();

    return new CommunityHomeResponse.EventCard(
        event.getId(),
        event.getTitle(),
        event.getStatus().name(),
        event.getStatus() == CommunityEventStatus.LIVE ? "Live" : "Upcoming",
        event.getStartsAt(),
        EVENT_FORMATTER.format(event.getStartsAt()),
        registrationCount,
        compactCount(registrationCount),
        registered,
        registered ? "Registered" : "Register Now"
    );
  }

  private User findUser(String userEmail) {
    return userRepository.findByEmail(userEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
  }

  private CommunityGroup findActiveGroup(Long groupId) {
    return groupRepository.findById(groupId)
        .filter(CommunityGroup::isActive)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community group not found"));
  }

  private CommunityDiscussion ensureDiscussionExists(Long discussionId) {
    return discussionRepository.findById(discussionId)
        .filter(discussion -> discussion.getStatus() == CommunityDiscussionStatus.PUBLISHED)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community discussion not found"));
  }

  private String normalizeSearch(String rawQuery) {
    if (rawQuery == null || rawQuery.isBlank()) {
      throw new IllegalArgumentException("Search query is required");
    }

    String query = rawQuery.trim();
    if (query.length() < 2) {
      throw new IllegalArgumentException("Search query must be at least 2 characters");
    }

    return query;
  }

  private String cleanNullable(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }

  private String displayName(User user) {
    if (user.getFullname() != null && !user.getFullname().isBlank()) {
      return user.getFullname().trim();
    }

    String email = user.getEmail();
    int atIndex = email == null ? -1 : email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : "Mama";
  }

  private String compactCount(long value) {
    if (value < 1000) {
      return String.valueOf(value);
    }

    return BigDecimal.valueOf(value / 1000.0)
        .setScale(1, RoundingMode.HALF_UP)
        .stripTrailingZeros()
        .toPlainString() + "K";
  }

  private String timeAgo(Instant createdAt) {
    Duration duration = Duration.between(createdAt, Instant.now());

    if (duration.toMinutes() < 1) {
      return "just now";
    }
    if (duration.toHours() < 1) {
      return duration.toMinutes() + "m ago";
    }
    if (duration.toDays() < 1) {
      return duration.toHours() + "h ago";
    }

    return duration.toDays() + "d ago";
  }
}
