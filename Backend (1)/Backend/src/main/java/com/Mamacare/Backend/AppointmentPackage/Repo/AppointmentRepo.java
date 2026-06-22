package com.Mamacare.Backend.AppointmentPackage.Repo;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.Mamacare.Backend.AppointmentPackage.Entity.Appointment;
import com.Mamacare.Backend.AppointmentPackage.Enums.AppointmentStatus;

public interface AppointmentRepo extends JpaRepository<Appointment, Long> {

    List<Appointment> findByUserIdOrderByScheduledStartAtDesc(Integer userId);

    List<Appointment> findByUserIdAndStatusOrderByScheduledStartAtDesc(
            Integer userId,
            AppointmentStatus status
    );

    List<Appointment> findByUserIdAndStatusAndScheduledStartAtGreaterThanEqualOrderByScheduledStartAtAsc(
            Integer userId,
            AppointmentStatus status,
            OffsetDateTime now
    );

    Optional<Appointment> findFirstByUserIdAndStatusAndScheduledStartAtGreaterThanEqualOrderByScheduledStartAtAsc(
            Integer userId,
            AppointmentStatus status,
            OffsetDateTime now
    );

    long countByStatus(AppointmentStatus status);

    List<Appointment> findTop20ByOrderByScheduledStartAtDesc();

    Optional<Appointment> findByIdAndUserId(Long id, Integer userId);
}
