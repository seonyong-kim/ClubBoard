package com.example.demo.service;

import com.example.demo.domain.Article;
import com.example.demo.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ArticleWriteService {

    private final ArticleRepository repo;

    // 글 작성
    @Transactional
    public Long create(String title, String content, String author) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("제목을 입력하세요.");
        if (content == null || content.isBlank()) throw new IllegalArgumentException("내용을 입력하세요.");

        Article article = new Article();
        article.setTitle(title.trim());
        article.setContent(content.trim());
        article.setAuthor(author);
        // created_at NOT NULL 대비
        if (article.getCreatedAt() == null) {
            article.setCreatedAt(LocalDateTime.now());
        }

        Article saved = repo.save(article);
        return saved.getId();
    }

    // 글 수정 (작성자만)
    @Transactional
    public Long update(Long id, String title, String content, String username) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("제목을 입력하세요.");
        if (content == null || content.isBlank()) throw new IllegalArgumentException("내용을 입력하세요.");

        Article a = repo.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.")
        );
        if (!a.getAuthor().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 글만 수정할 수 있습니다.");
        }

        a.setTitle(title.trim());
        a.setContent(content.trim());
        // 변경감지로 update 수행
        return a.getId();
    }

    // 글 삭제 (작성자만)
    @Transactional
    public void delete(Long id, String username) {
        Article a = repo.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.")
        );
        if (!a.getAuthor().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 글만 삭제할 수 있습니다.");
        }
        repo.delete(a);
    }
}


