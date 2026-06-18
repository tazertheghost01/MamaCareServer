package com.Mamacare.Backend.CommunityPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.CommunityPackage.Config.CommunityCopyProperties;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityCommentResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityHomeResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityJoinGroupResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CreateCommunityCommentRequest;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityComment;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityDiscussion;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityEvent;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroup;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroupMembership;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityEventStatus;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityCommentRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityDiscussionRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityEventRegistrationRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityEventRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityGroupMembershipRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityGroupRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.GroupMemberCountView;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

    private CommunityService communityService;

    @Mock
    private CommunityCopyProperties copy;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommunityGroupRepository groupRepository;

    @Mock
    private CommunityGroupMembershipRepository membershipRepository;

    @Mock
    private CommunityDiscussionRepository discussionRepository;

    @Mock
    private CommunityCommentRepository commentRepository;

    @Mock
    private CommunityEventRepository eventRepository;

    @Mock
    private CommunityEventRegistrationRepository registrationRepository;

    @BeforeEach
    void setUp() {
        communityService = new CommunityService(
                copy,
                userRepository,
                groupRepository,
                membershipRepository,
                discussionRepository,
                commentRepository,
                eventRepository,
                registrationRepository
        );
    }

    @Test
    void getHomeReturnsGroupsDiscussionsEventAndCopy() {
        User author = user();
        CommunityGroup group = group();
        CommunityDiscussion discussion = discussion(group, author);
        CommunityEvent event = event();

        when(copy.screenTitle()).thenReturn("Community");
        when(copy.heroMessage()).thenReturn("You are not alone, Mama!");
        when(copy.searchPlaceholder()).thenReturn("Search questions, topics or moms");
        when(copy.askQuestionLabel()).thenReturn("Ask a Question");
        when(copy.tabs()).thenReturn(List.of("Discussion", "Groups", "Events"));
        when(copy.footerTitle()).thenReturn("Be kind, be supportive, be you.");
        when(copy.footerBody()).thenReturn("This is safe space for every mama.");
        when(groupRepository.findTop3ByActiveTrueOrderBySortOrderAscNameAsc()).thenReturn(List.of(group));
        when(discussionRepository.findTop3ByStatusOrderByCommentCountDescCreatedAtDesc(CommunityDiscussionStatus.PUBLISHED))
                .thenReturn(List.of(discussion));
        when(eventRepository.findFirstByActiveTrueAndStatusOrderByStartsAtAsc(CommunityEventStatus.LIVE))
                .thenReturn(Optional.of(event));
        when(membershipRepository.countMembersByGroupIds(List.of(1L))).thenReturn(List.of(countView(1L, 8400)));
        when(membershipRepository.findJoinedGroupIds("mama@example.com", List.of(1L))).thenReturn(Set.of(1L));
        when(registrationRepository.countByEvent_Id(7L)).thenReturn(2100L);
        when(registrationRepository.findByEvent_IdAndUser_Email(7L, "mama@example.com")).thenReturn(Optional.empty());

        CommunityHomeResponse response = communityService.getHome("mama@example.com");

        assertThat(response.screenTitle()).isEqualTo("Community");
        assertThat(response.groups()).hasSize(1);
        assertThat(response.groups().getFirst().memberCountLabel()).isEqualTo("8.4K members");
        assertThat(response.groups().getFirst().joined()).isTrue();
        assertThat(response.popularDiscussions().getFirst().title()).isEqualTo("What helped you with morning sickness?");
        assertThat(response.popularDiscussions().getFirst().commentCount()).isEqualTo(128);
        assertThat(response.featuredEvent().statusLabel()).isEqualTo("Live");
        assertThat(response.featuredEvent().registrationCountLabel()).isEqualTo("2.1K");
        assertThat(response.featuredEvent().displayTime()).isEqualTo("Thu Jun 18, 2026 10.00 AM");
        assertThat(response.footer().title()).isEqualTo("Be kind, be supportive, be you.");
    }

    @Test
    void joinGroupCreatesMembershipWhenUserHasNotJoined() {
        User user = user();
        CommunityGroup group = group();

        when(userRepository.findByEmail("mama@example.com")).thenReturn(Optional.of(user));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(membershipRepository.findByGroup_IdAndUser_Email(1L, "mama@example.com")).thenReturn(Optional.empty());
        when(membershipRepository.save(any(CommunityGroupMembership.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(membershipRepository.countByGroup_Id(1L)).thenReturn(1L);

        CommunityJoinGroupResponse response = communityService.joinGroup(1L, "mama@example.com");

        ArgumentCaptor<CommunityGroupMembership> captor = ArgumentCaptor.forClass(CommunityGroupMembership.class);
        verify(membershipRepository).save(captor.capture());
        assertThat(captor.getValue().getGroup()).isEqualTo(group);
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        assertThat(response.joined()).isTrue();
        assertThat(response.memberCountLabel()).isEqualTo("1 members");
    }

    @Test
    void addCommentSavesCommentAndIncrementsDiscussionCount() {
        User user = user();
        CommunityGroup group = group();
        CommunityDiscussion discussion = discussion(group, user);
        discussion.setCommentCount(2);

        when(userRepository.findByEmail("mama@example.com")).thenReturn(Optional.of(user));
        when(discussionRepository.findById(9L)).thenReturn(Optional.of(discussion));
        when(commentRepository.save(any(CommunityComment.class))).thenAnswer(invocation -> {
            CommunityComment comment = invocation.getArgument(0);
            comment.setId(15L);
            return comment;
        });

        CommunityCommentResponse response = communityService.addComment(
                9L,
                new CreateCommunityCommentRequest("  This helped me too  "),
                "mama@example.com"
        );

        assertThat(response.id()).isEqualTo(15L);
        assertThat(response.body()).isEqualTo("This helped me too");
        assertThat(discussion.getCommentCount()).isEqualTo(3);
        verify(discussionRepository).save(discussion);
    }

    private User user() {
        return User.builder()
                .id(5)
                .email("mama@example.com")
                .fullname("Sarah O")
                .build();
    }

    private CommunityGroup group() {
        return CommunityGroup.builder()
                .id(1L)
                .slug("first-time-moms")
                .name("First Time Moms")
                .description("Support for first pregnancy questions.")
                .active(true)
                .build();
    }

    private CommunityDiscussion discussion(CommunityGroup group, User author) {
        return CommunityDiscussion.builder()
                .id(9L)
                .group(group)
                .author(author)
                .title("What helped you with morning sickness?")
                .body("Please share tips.")
                .status(CommunityDiscussionStatus.PUBLISHED)
                .commentCount(128)
                .createdAt(Instant.now().minus(Duration.ofHours(2)))
                .build();
    }

    private CommunityEvent event() {
        return CommunityEvent.builder()
                .id(7L)
                .title("Preparing for a Safe Delivery")
                .status(CommunityEventStatus.LIVE)
                .startsAt(Instant.parse("2026-06-18T09:00:00Z"))
                .active(true)
                .build();
    }

    private GroupMemberCountView countView(Long groupId, long memberCount) {
        return new GroupMemberCountView() {
            @Override
            public Long getGroupId() {
                return groupId;
            }

            @Override
            public long getMemberCount() {
                return memberCount;
            }
        };
    }
}
