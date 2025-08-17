package com.example.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class AuthDebugController {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;

    // 1) 비번을 서버에서 직접 갱신 (JDBC)하고, 방금 저장한 해시를 즉시 읽어 반환
    @PostMapping("/set")
    public ResponseEntity<?> set(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "user");
        String raw = body.getOrDefault("password", "");
        String hash = encoder.encode(raw);

        int updated = jdbc.update(
                "UPDATE users SET password=? WHERE username=?",
                hash, username
        );

        // read-back
        var row = jdbc.queryForMap(
                "SELECT username, LENGTH(password) AS len, password FROM users WHERE username=?",
                username
        );

        return ResponseEntity.ok(Map.of(
                "updatedRows", updated,
                "username", row.get("username"),
                "len", row.get("len"),
                "tail", ((String)row.get("password")).substring(((String)row.get("password")).length()-7),
                "hashHead", ((String)row.get("password")).substring(0, 7)
        ));
    }

    // 2) 입력 비번과 DB 해시가 정말 매칭되는지 서버에서 즉시 체크
    @PostMapping("/check")
    public ResponseEntity<?> check(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "user");
        String raw = body.getOrDefault("password", "");

        var row = jdbc.queryForMap(
                "SELECT password FROM users WHERE username=?",
                username
        );
        String dbHash = (String) row.get("password");
        boolean matches = encoder.matches(raw, dbHash);

        return ResponseEntity.ok(Map.of(
                "username", username,
                "hash_len", dbHash.length(),
                "hash_head", dbHash.substring(0, 7),
                "hash_tail", dbHash.substring(dbHash.length()-7),
                "matches", matches
        ));
    }
}
