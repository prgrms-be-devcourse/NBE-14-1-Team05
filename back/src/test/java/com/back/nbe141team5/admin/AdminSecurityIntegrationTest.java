package com.back.nbe141team5.admin;

import com.back.nbe141team5.admin.dto.AdminLoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "admin.code=test-admin-code")
@Transactional
class AdminSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("올바른 관리자 코드로 로그인 시 200 OK와 함께 관리자 세션이 발급된다.")
    void adminLogin_success() throws Exception {
        AdminLoginRequest request = new AdminLoginRequest("test-admin-code");

        mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("관리자 인증 성공"));
    }

    @Test
    @DisplayName("잘못된 관리자 코드로 로그인 시 401 Unauthorized가 반환된다.")
    void adminLogin_invalidCode_unauthorized() throws Exception {
        AdminLoginRequest request = new AdminLoginRequest("WRONG_CODE_9999");

        mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("관리자 코드가 올바르지 않습니다."));
    }

    @Test
    @DisplayName("관리자 세션 없이 관리자 주문 API 직접 호출 시 403 Forbidden으로 차단된다.")
    void getAdminOrders_withoutSession_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("관리자 세션 없이 대시보드 통계 API 직접 호출 시 403 Forbidden으로 차단된다.")
    void getAdminStats_withoutSession_forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("관리자 세션이 있는 상태로 관리자 주문 API 호출 시 정상 200 OK로 통과된다.")
    void getAdminOrders_withAdminSession_success() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("isAdmin", true);

        mockMvc.perform(get("/api/v1/admin/orders")
                        .session(session))
                .andExpect(status().isOk());
    }
}
