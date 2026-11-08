package com.gymx.api.common.web;

import com.gymx.api.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@ConditionalOnProperty(
        name = "gymx.http-logging.enabled",
        havingValue = "true"
)
public class HttpLoggingFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public HttpLoggingFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        ContentCachingRequestWrapper wrappedRequest =
                new ContentCachingRequestWrapper(request, 65536);

        ContentCachingResponseWrapper wrappedResponse =
                new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String query = request.getQueryString();

            if (query != null) {
                uri += "?" + query;
            }

            boolean authRequest = uri.startsWith("/api/auth");
            String user = resolveUser(request);

            System.out.println("\n========== INCOMING REQUEST ==========");
            System.out.println("User   : " + user);
            System.out.println("Method : " + method);
            System.out.println("URL    : " + uri);
            System.out.println("Type   : " + request.getContentType());


                String requestBody = new String(
                        wrappedRequest.getContentAsByteArray(),
                        StandardCharsets.UTF_8
                );

                System.out.println("Body   : " +
                        (requestBody.isBlank() ? "(empty)" : requestBody));


            System.out.println("========== OUTGOING RESPONSE =========");
            System.out.println("User   : " + user);
            System.out.println("Status : " + wrappedResponse.getStatus());

            if (!authRequest) {
                String responseBody = new String(
                        wrappedResponse.getContentAsByteArray(),
                        StandardCharsets.UTF_8
                );

                System.out.println("Body   : " +
                        (responseBody.isBlank() ? "(empty)" : responseBody));
            } else {
                System.out.println("Body   : [HIDDEN: authentication response]");
            }

            System.out.println("======================================\n");

            wrappedResponse.copyBodyToResponse();
        }
    }

    private String resolveUser(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String email = jwtService.extractEmail(token);
                if (email != null && !email.isBlank()) {
                    return email;
                }
            } catch (Exception ignored) {
            }
        }

        return "Anonymous";
    }
}
