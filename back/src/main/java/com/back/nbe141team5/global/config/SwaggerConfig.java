package com.back.nbe141team5.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NBE-14-1-Team05 API")
                        .description("NBE-14-1-Team05 프로젝트 API 명세")
                        .version("v1"));
    }
}
