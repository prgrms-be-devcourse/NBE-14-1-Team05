package com.back.nbe141team5;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class Nbe141Team5Application {

    public static void main(String[] args) {
        SpringApplication.run(Nbe141Team5Application.class, args);
    }
}