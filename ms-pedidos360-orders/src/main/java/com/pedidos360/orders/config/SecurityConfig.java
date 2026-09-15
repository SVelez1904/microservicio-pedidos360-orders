package com.pedidos360.orders.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // 1. Permitir PREFLIGHTS OPTIONS para evitar bloqueos de CORS
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // 2. Ruta exacta del controlador de catálogo pública
            .requestMatchers("/api/v1/catalog/**", "/catalog/**").permitAll()

            // 3. Documentación y Actuator
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()

            // 4. Endpoints de Orders protegidos por JWT
            .requestMatchers("/api/orders/**", "/orders/**").authenticated()

            .anyRequest().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(azureAdJwtAuthenticationConverter()))
        );

    return http.build();
}
    /**
     * Convertidor personalizado para extraer roles y scopes de tokens JWT de Azure AD (Entra ID).
     * Azure AD almacena roles de aplicación en el claim "roles" (array de Strings)
     * y los permisos delegados en el claim "scp" (String delimitado por espacios).
     */
    @Bean
    public JwtAuthenticationConverter azureAdJwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new Converter<Jwt, Collection<GrantedAuthority>>() {
            @Override
            public Collection<GrantedAuthority> convert(Jwt jwt) {
                Collection<GrantedAuthority> grantedAuthorities = new ArrayList<>();

                // 1. Extraer App Roles asignados en Azure AD Enterprise Application ("roles" claim)
                List<String> roles = jwt.getClaimAsStringList("roles");
                if (roles != null && !roles.isEmpty()) {
                    roles.forEach(role -> grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                }

                // 2. Extraer Scopes delegados del usuario ("scp" claim)
                String scp = jwt.getClaimAsString("scp");
                if (scp != null && !scp.isBlank()) {
                    for (String scope : scp.split(" ")) {
                        grantedAuthorities.add(new SimpleGrantedAuthority("SCOPE_" + scope));
                    }
                }

                // 3. Soporte para Azure AD Security Groups si están configurados en "groups" claim
                List<String> groups = jwt.getClaimAsStringList("groups");
                if (groups != null && !groups.isEmpty()) {
                    groups.forEach(group -> grantedAuthorities.add(new SimpleGrantedAuthority("GROUP_" + group)));
                }

                return grantedAuthorities;
            }
        });
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    // Permitir que el gateway pase los headers sin sobreescribir origin
    config.setAllowedOriginPatterns(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
    }
}

