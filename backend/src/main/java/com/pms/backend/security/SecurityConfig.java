package com.pms.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.pms.backend.config.TokenFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private TokenFilter tokenFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults()) // Sử dụng cấu hình CORS từ CorsConfig
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .addFilterBefore(tokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(requests -> requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/auth/register", 
                        "/api/auth/check-email", 
                        "/api/auth/login",
                        "/api/auth/**",
                        "/oauth2/**",
                        "/login/oauth2/code/**",
                        "/",
                        "/api/projects/**",
                        "/api/members/**",
                        "/api/sprints/**",
                        "/api/documents/**", 
                        "/api/notifications/**"
                ).permitAll()
                .requestMatchers("/api/comments/**").authenticated() 
                .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                .loginPage("/api/auth/login/google")
                .authorizationEndpoint(authorization -> authorization
                .baseUri("/oauth2/authorization"))
                .redirectionEndpoint(redirection -> redirection
                .baseUri("/login/oauth2/code/*"))
                .defaultSuccessUrl("/api/auth/loginSuccess", true)
                .failureUrl("/api/auth/login/google?error=true"))
                .oauth2Client(Customizer.withDefaults())
                .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("http://localhost:3000/login")
                // .logoutSuccessUrl("https://quanliduan-pms.site/login")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
               
                .deleteCookies("JSESSIONID")
                .permitAll());

        return httpSecurity.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return JwtDecoders.fromIssuerLocation("https://accounts.google.com");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("GET");
        configuration.addAllowedMethod("POST");
        configuration.addAllowedMethod("PUT");
        configuration.addAllowedMethod("DELETE");
        configuration.addAllowedMethod("OPTIONS");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.addExposedHeader("Access-Control-Allow-Origin");
        configuration.addExposedHeader("Access-Control-Allow-Methods");
        configuration.addExposedHeader("Access-Control-Allow-Headers");
        configuration.addExposedHeader("Location");
        configuration.addExposedHeader("Content-Type");
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
