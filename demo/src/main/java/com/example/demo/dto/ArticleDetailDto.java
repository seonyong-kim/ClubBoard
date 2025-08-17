package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDetailDto {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime createdAt;
    private String content;
}
