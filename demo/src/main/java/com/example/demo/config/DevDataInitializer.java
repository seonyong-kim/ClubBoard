package com.example.demo.config;

import com.example.demo.domain.UserAccount;
import com.example.demo.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DevDataInitializer implements CommandLineRunner {

    private final UserAccountRepository repo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (repo.findByUsername("admin").isEmpty()) {
            repo.save(UserAccount.builder()
                    .username("admin")
                    .password(encoder.encode("admin1234"))
                    .role("ROLE_ADMIN")
                    .build());
        }
        if (repo.findByUsername("user").isEmpty()) {
            repo.save(UserAccount.builder()
                    .username("user")
                    .password(encoder.encode("user1234"))
                    .role("ROLE_USER")
                    .build());
        }
    }
}
