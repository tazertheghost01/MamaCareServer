package com.Mamacare.Backend.SupportPackage.Repo;

import com.Mamacare.Backend.SupportPackage.Entity.SupportTicket;
import com.Mamacare.Backend.SupportPackage.Enums.SupportTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepo extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Integer userId);

    long countByStatus(SupportTicketStatus status);

    List<SupportTicket> findTop20ByOrderByCreatedAtDesc();
}
