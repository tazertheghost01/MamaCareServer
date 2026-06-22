package com.Mamacare.Backend.SupportPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.SupportPackage.Dto.CreateSupportTicketRequest;
import com.Mamacare.Backend.SupportPackage.Dto.SupportHomeResponse;
import com.Mamacare.Backend.SupportPackage.Dto.SupportTicketResponse;
import com.Mamacare.Backend.SupportPackage.Entity.SupportTicket;
import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import com.Mamacare.Backend.SupportPackage.Repo.SupportTicketRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepo supportTicketRepository;

    @Transactional(readOnly = true)
    public SupportHomeResponse getHome() {
        return new SupportHomeResponse(
                "Help & Support",
                "We are here for you, Mama.",
                "support@mamacareng.com",
                List.of(
                        new SupportHomeResponse.FaqItem(
                                "Can MamaCare replace my doctor?",
                                "No. MamaCare supports reminders and education, but your clinician is the source of medical advice."
                        ),
                        new SupportHomeResponse.FaqItem(
                                "Why are baby growth numbers estimates?",
                                "Every pregnancy is different. Ultrasound scans and clinical checks are more specific than app estimates."
                        ),
                        new SupportHomeResponse.FaqItem(
                                "Can I change my language?",
                                "Yes. Open Preferences and update your language."
                        )
                ),
                List.of(
                        new SupportHomeResponse.SupportAction("FAQ", "FAQ", "Find answers to common questions"),
                        new SupportHomeResponse.SupportAction("CONTACT_US", "Contact Us", "Chat or email our support team"),
                        new SupportHomeResponse.SupportAction("REPORT_ISSUE", "Report an Issue", "Let us know if something is not working"),
                        new SupportHomeResponse.SupportAction("FEEDBACK", "Feedback", "Share your feedback with us")
                )
        );
    }

    @Transactional
    public SupportTicketResponse createTicket(CreateSupportTicketRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);
        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .type(request.type())
                .subject(request.subject().trim())
                .message(request.message().trim())
                .status(SupportTicketStatus.OPEN)
                .build();

        return toResponse(supportTicketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMyTickets(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SupportTicketResponse toResponse(SupportTicket ticket) {
        return new SupportTicketResponse(
                ticket.getId(),
                ticket.getType(),
                ticket.getSubject(),
                ticket.getMessage(),
                ticket.getStatus(),
                ticket.getCreatedAt()
        );
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
        return user;
    }
}
