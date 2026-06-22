package com.Mamacare.Backend.AdminPackage.Support.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Support.Dto.AdminSupportTicketResponse;
import com.Mamacare.Backend.SupportPackage.Entity.SupportTicket;
import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import com.Mamacare.Backend.SupportPackage.Repo.SupportTicketRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminSupportService {

    private final SupportTicketRepo supportTicketRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        return List.of(
                new AdminMetricCard("total_requests", "Total Requests", supportTicketRepository.count(), "All support tickets"),
                new AdminMetricCard("open", "Open", supportTicketRepository.countByStatus(SupportTicketStatus.OPEN), "Waiting for response"),
                new AdminMetricCard("in_progress", "In Progress", supportTicketRepository.countByStatus(SupportTicketStatus.REVIEWING), "Being reviewed"),
                new AdminMetricCard("resolved", "Resolved", supportTicketRepository.countByStatus(SupportTicketStatus.RESOLVED), "Closed successfully")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminSupportTicketResponse> listTickets(SupportTicketStatus status) {
        return supportTicketRepository.findAll()
                .stream()
                .filter(ticket -> status == null || ticket.getStatus() == status)
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminSupportTicketResponse updateStatus(Long ticketId, SupportTicketStatus status) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Support ticket not found."));
        ticket.setStatus(status);
        return toResponse(supportTicketRepository.save(ticket));
    }

    private AdminSupportTicketResponse toResponse(SupportTicket ticket) {
        return new AdminSupportTicketResponse(
                ticket.getId(),
                ticket.getUser().getId(),
                ticket.getUser().getFullname(),
                ticket.getUser().getEmail(),
                ticket.getType(),
                ticket.getSubject(),
                ticket.getMessage(),
                ticket.getStatus(),
                priorityFor(ticket),
                ticket.getCreatedAt()
        );
    }

    private String priorityFor(SupportTicket ticket) {
        String subject = ticket.getSubject() == null ? "" : ticket.getSubject().toLowerCase();
        String message = ticket.getMessage() == null ? "" : ticket.getMessage().toLowerCase();
        if (subject.contains("urgent") || message.contains("urgent") || message.contains("emergency")) {
            return "High";
        }
        return ticket.getStatus() == SupportTicketStatus.OPEN ? "Medium" : "Low";
    }
}
