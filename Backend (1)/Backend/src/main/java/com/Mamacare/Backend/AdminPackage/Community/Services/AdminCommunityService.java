package com.Mamacare.Backend.AdminPackage.Community.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Community.Dto.AdminCommunityPostResponse;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityDiscussion;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityDiscussionRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityGroupMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCommunityService {

    private final CommunityDiscussionRepository discussionRepository;
    private final CommunityGroupMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        long published = discussionRepository.countByStatus(CommunityDiscussionStatus.PUBLISHED);
        long hidden = discussionRepository.countByStatus(CommunityDiscussionStatus.HIDDEN);
        long reactions = discussionRepository.findAll().stream().mapToLong(CommunityDiscussion::getReactionCount).sum();

        return List.of(
                new AdminMetricCard("total_members", "Total Members", membershipRepository.count(), "Community group memberships"),
                new AdminMetricCard("total_posts", "Total Posts", discussionRepository.count(), "All discussions"),
                new AdminMetricCard("total_reactions", "Total Reactions", reactions, "All post reactions"),
                new AdminMetricCard("hidden_posts", "Hidden Posts", hidden, "Moderated posts"),
                new AdminMetricCard("published_posts", "Published Posts", published, "Visible posts")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminCommunityPostResponse> listPosts(CommunityDiscussionStatus status) {
        return discussionRepository.findAll()
                .stream()
                .filter(post -> status == null || post.getStatus() == status)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminCommunityPostResponse updateStatus(Long postId, CommunityDiscussionStatus status) {
        CommunityDiscussion discussion = discussionRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Community post not found."));
        discussion.setStatus(status);
        return toResponse(discussionRepository.save(discussion));
    }

    private AdminCommunityPostResponse toResponse(CommunityDiscussion discussion) {
        return new AdminCommunityPostResponse(
                discussion.getId(),
                discussion.getAuthor().getId(),
                discussion.getAuthor().getFullname(),
                discussion.getTitle(),
                preview(discussion.getBody()),
                discussion.getGroup().getName(),
                discussion.getReactionCount(),
                discussion.getCommentCount(),
                discussion.getStatus(),
                discussion.getCreatedAt()
        );
    }

    private String preview(String body) {
        if (body == null || body.isBlank()) {
            return "";
        }
        return body.length() <= 120 ? body : body.substring(0, 117) + "...";
    }
}
