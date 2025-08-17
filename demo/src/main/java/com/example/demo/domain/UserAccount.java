package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, unique = true, length = 191)
    private String username;

    @Column(nullable=false)
    private String password; // BCrypt 해시

    @Column(nullable=false, length = 20)
    private String role;     // e.g. "ROLE_USER", "ROLE_ADMIN"
}
