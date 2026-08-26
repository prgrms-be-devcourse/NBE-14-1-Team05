package com.back.nbe141team5.product.admin.controller;

import com.back.nbe141team5.product.admin.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/product-images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ImageStorageService imageStorageService;

    @PostMapping
    public Map<String, String> uploadImage(
            @RequestParam("image") MultipartFile image
    ) {
        String imageUrl = imageStorageService.save(image);

        return Map.of(
                "imageUrl",
                imageUrl
        );
    }
}