package com.example.demo.service;

import com.example.demo.domain.Article;
import com.example.demo.dto.ArticleDetailDto;
import com.example.demo.dto.ArticleLinkDto;
import com.example.demo.dto.ArticlePreviewDto;
import com.example.demo.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ArticleService {
    private final ArticleRepository repo;

    // 목록 페이지
    public ArticleService(ArticleRepository repo) {
        this.repo = repo;
    }

    public Page<ArticlePreviewDto> getPreviews(int page, int size) {
        var pageable = PageRequest.of(page, size);
        return repo.findAllByOrderByIdDesc(pageable)
                .map(a -> new ArticlePreviewDto(
                        a.getId(),
                        a.getTitle(),
                        a.getAuthor(),
                        a.getCreatedAt()
                ));
    }

    // 상세 페이지
    public ArticleDetailDto getDetail(Long id) {
        Article a = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "게시글을 찾을 수 없습니다."));
        return new ArticleDetailDto(a.getId(), a.getTitle(), a.getAuthor(), a.getCreatedAt(), a.getContent());
    }

    // 이전 이후 글
    public ArticleLinkDto getPrev(Long id) {
        Article a = repo.findFirstByIdGreaterThanOrderByIdAsc(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "이전 글이 없습니다."));
        return new ArticleLinkDto(a.getId(), a.getTitle());
    }

    public ArticleLinkDto getNext(Long id) {
        Article a = repo.findFirstByIdLessThanOrderByIdDesc(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "다음 글이 없습니다."));
        return new ArticleLinkDto(a.getId(), a.getTitle());
    }
}

