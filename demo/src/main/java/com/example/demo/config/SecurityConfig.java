package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ★ 세션 사용 (STATELESS 금지)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                // SPA + JSON 로그인: /api/** 는 CSRF 예외(쿠키-세션 사용)
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                // React에서 로그인하므로 폼로그인 비활성화
                .formLogin(AbstractHttpConfigurer::disable)

                // /api/** 에 한해서 미인증이면 401(JSON) 응답
                .exceptionHandling(e -> e
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                req -> {
                                    String uri = req.getRequestURI();
                                    return uri != null && uri.startsWith("/api/");
                                }
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        // 1) 인증/상태 조회 API (순서 중요)
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll() // ★ 회원가입 공개
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        // ★ /api/auth/me 는 인증 필요
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        // 로그아웃은 인증 필요
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        // 디버그 허용 (운영 시 제거 권장)
                        .requestMatchers(HttpMethod.POST, "/api/debug/check").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/debug/set", "/api/debug/check").permitAll()

                        // 2) 읽기 공개 API가 있다면 구체 경로만 허용 (예: 게시글)
                        // 기존에 GET /api/** 전체 permitAll 이라 /auth/me까지 풀려서 충돌났음
                        .requestMatchers(HttpMethod.GET, "/api/articles/**").permitAll()

                        // 3) 그 외 /api/** 는 인증 필요 — 반드시 위 허용 규칙 뒤에 둬야 함
                        .requestMatchers("/api/**").authenticated()

                        // 4) 정적/기타 리소스
                        .requestMatchers("/", "/health",
                                "/favicon.ico", "/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/actuator/**").hasRole("ADMIN")

                        // SSR 페이지가 사실상 없다면 널널하게:
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ★ CORS: 쿠키 허용 + 정확한 오리진 지정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:5173")); // 프론트 개발 서버 도메인/포트
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true); // ★ JSESSIONID 쿠키 전송 허용 (중요)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        // UserDetailsService + PasswordEncoder 기반으로 표준 AuthenticationManager를 노출
        return configuration.getAuthenticationManager();
    }
}
