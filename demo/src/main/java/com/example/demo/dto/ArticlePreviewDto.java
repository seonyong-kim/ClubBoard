package com.example.demo.dto;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticlePreviewDto {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime createdAt;
}