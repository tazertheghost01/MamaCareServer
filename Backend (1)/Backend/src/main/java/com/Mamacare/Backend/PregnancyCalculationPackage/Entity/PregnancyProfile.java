package com.Mamacare.Backend.PregnancyCalculationPackage.Entity;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.PregnancyCalculationPackage.Enum.PregnancyDateSource;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "pregnancy_profiles", uniqueConstraints = {
    @UniqueConstraint(name = "unique_pregnancy_user", columnNames = "user_id")
    })
    
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PregnancyProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(nullable = false)
  private LocalDate dueDate;

  @Column(nullable = false)
  private LocalDate lastMenstrualPeriod;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private PregnancyDateSource source;
}