package com.pedidos360.orders.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:https://login.microsoftonline.com/common/v2.0}")
    private String issuerUri;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "AzureAD_BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("ms-pedidos360-orders API")
                        .version("1.0.0")
                        .description("Microservicio central de pedidos para la plataforma Pedidos360. "
                                + "Gestiona el ciclo de vida de órdenes con máquina de estados finita, "
                                + "descuento de stock síncrono con ms-pedidos360-catalog (OpenFeign) "
                                + "y mensajería distribuida asíncrona mediante RabbitMQ y Apache Kafka.")
                        .contact(new Contact()
                                .name("Arquitectura & Backend Pedidos360")
                                .email("backend@pedidos360.com"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .servers(List.of(
                        new Server().url("/").description("Current Environment"),
                        new Server().url("https://api.pedidos360.com/orders").description("AWS Production RDS")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT emitido por Microsoft Entra ID (Azure AD). "
                                                + "Issuer esperado: " + issuerUri)));
    }
}
