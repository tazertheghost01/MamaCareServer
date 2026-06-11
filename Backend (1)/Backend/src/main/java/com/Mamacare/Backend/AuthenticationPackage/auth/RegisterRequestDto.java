package com.Mamacare.Backend.AuthenticationPackage.auth;

import com.Mamacare.Backend.AuthenticationPackage.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

  private String firstName;
  private String lastName;
  private String phoneNumber;
  private String email;
  private String password;
  private Role role;

  public String getFullname() {
    return (firstName != null ? firstName.trim() : "") +
        " " + (lastName != null ? lastName.trim() : "");
  }
}