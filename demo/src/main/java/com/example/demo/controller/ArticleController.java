package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.ArticleService;
import com.example.demo.service.ArticleWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService service;
    private final ArticleWriteService writeService; // ← ★ 이 줄 꼭 있어야 함

    // 목록 페이지
    @GetMapping
    public Page<ArticlePreviewDto> list(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return service.getPreviews(page, size);
    }

    // 상세
    @GetMapping("/{id}")
    public ArticleDetailDto detail(@PathVariable Long id) {
        return service.getDetail(id);
    }

    // 이전 글
    @GetMapping("/{id}/prev")
    public ArticleLinkDto prev(@PathVariable Long id) {
        return service.getPrev(id);
    }

    // 다음 글
    @GetMapping("/{id}/next")
    public ArticleLinkDto next(@PathVariable Long id) {
        return service.getNext(id);
    }

    @PostMapping
    public ArticleCreatedResponse create(@RequestBody ArticleCreateRequest req,
                                         Authentication authentication) {
        final String author = authentication.getName(); // 로그인한 사용자명
        Long id = writeService.create(req.getTitle(), req.getContent(), author);
        return new ArticleCreatedResponse(id);
    }
    // ★ 수정 (로그인 + 본인 글)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody ArticleUpdateRequest req,
                                    Authentication authentication) {
        String author = authentication.getName();
        Long updatedId = writeService.update(id, req.getTitle(), req.getContent(), author);
        return ResponseEntity.ok().body(java.util.Map.of("id", updatedId));
    }

    // ★ 삭제 (로그인 + 본인 글)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    Authentication authentication) {
        String author = authentication.getName();
        writeService.delete(id, author);
        return ResponseEntity.noContent().build(); // 204
    }
}
