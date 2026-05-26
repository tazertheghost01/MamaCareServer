package com.Mamacare.Backend.AuthenticationPackage.auth;

import com.Mamacare.Backend.AuthenticationPackage.user.Role;

import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

  private String fullname;
  private String phoneNumber;
  private String email;
  private String password;
  @Transient
  private String confirmPassword;
  private Role role;
}
