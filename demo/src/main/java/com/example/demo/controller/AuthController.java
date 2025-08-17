package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.domain.UserAccount;
import com.example.demo.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        // 1) 인증 시도
        Authentication auth = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(req.getUsername(), req.getPassword())
        );

        // 2) SecurityContext 생성/적용
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        // 3) ★ 세션 생성 + SecurityContext 세션 저장 (가장 중요)
        HttpSession session = request.getSession(true); // 세션 보장(JSESSIONID 발급)
        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );

        // 4) 세션 고정 방지: 새 세션 ID로 교체
        request.changeSessionId();

        // 5) 응답 DTO
        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("ROLE_USER");

        return ResponseEntity.ok(new LoginResponse(auth.getName(), role));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // 로그인 상태 확인용
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        // 인증 객체가 없거나, anonymous면 401
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        }

        // principal 안전 추출
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails ud) {
            username = ud.getUsername();
        } else if (principal instanceof String s) {
            if ("anonymousUser".equalsIgnoreCase(s)) {
                return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
            }
            username = s;
        } else {
            username = String.valueOf(principal);
        }

        var roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // 순수 DTO로 반환(직렬화 이슈 방지)
        return ResponseEntity.ok(Map.of(
                "username", username,
                "roles", roles
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest req) {
        String username = req.getUsername();
        String password = req.getPassword();

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "username_and_password_required"));
        }
        // 단순 길이 검증만 (원하면 제거 가능)
        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "password_too_short"));
        }

        // ✅ Lombok Builder로 엔티티 생성 (기본 생성자 protected 이슈 회피)
        UserAccount user = UserAccount.builder()
                .username(username.trim())
                .password(passwordEncoder.encode(password)) // BCrypt
                .role("ROLE_USER")
                .build();

        // ✅ 저장
        UserAccount saved = userAccountRepository.save(user);

        return ResponseEntity.ok(Map.of("status", "registered"));
    }

    @GetMapping("/ping")
    public String ping() { return "ok"; }
}
