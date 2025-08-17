package com.example.demo.repository;

import com.example.demo.domain.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Page<Article> findAllByOrderByIdDesc(Pageable pageable);

    Optional<Article> findFirstByIdGreaterThanOrderByIdAsc(Long id);

    Optional<Article> findFirstByIdLessThanOrderByIdDesc(Long id);
}
