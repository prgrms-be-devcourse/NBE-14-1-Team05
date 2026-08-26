package com.back.nbe141team5.product.admin.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path uploadPath =
            Paths.get("uploads/products");

    public String save(MultipartFile file) {

        try {
            // uploads/products 폴더 없으면 생성
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();

            // 확장자 구하기
            String extension = "";

            if (originalFilename != null
                    && originalFilename.contains(".")) {

                extension = originalFilename.substring(
                        originalFilename.lastIndexOf(".")
                );
            }

            // 중복 방지를 위해 UUID 파일명 생성
            String filename =
                    UUID.randomUUID() + extension;

            Path targetPath =
                    uploadPath.resolve(filename);

            // 실제 파일 저장
            file.transferTo(targetPath);

            // 브라우저에서 접근 가능한 URL 반환
            return ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path("/uploads/products/")
                    .path(filename)
                    .toUriString();

        } catch (IOException e) {
            throw new RuntimeException(
                    "이미지 저장에 실패했습니다.",
                    e
            );
        }
    }
}