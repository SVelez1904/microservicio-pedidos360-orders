import { SourceFile } from '../types';

export const SOURCE_FILES: SourceFile[] = [
  {
    path: 'pom.xml',
    category: 'build',
    language: 'xml',
    title: 'pom.xml (Dependencias & Plugins Maven)',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.pedidos360</groupId>
    <artifactId>ms-pedidos360-orders</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>ms-pedidos360-orders</name>
    <description>Microservicio de Gestión de Pedidos - Arquitectura Pedidos360</description>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.3</spring-cloud.version>
        <springdoc.version>2.6.0</springdoc.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Spring Security & Azure AD (Entra ID) OAuth2 Resource Server -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>

        <!-- Spring Cloud OpenFeign (Cliente declarativo a ms-pedidos360-catalog) -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>

        <!-- Messaging & Event Streaming -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>

        <!-- Database Driver (PostgreSQL on AWS RDS) -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- OpenAPI 3 Documentation (Swagger UI) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>\${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/resources/application.yml',
    category: 'config',
    language: 'yaml',
    title: 'application.yml (PostgreSQL RDS, Azure AD, RabbitMQ, Kafka)',
    code: `server:
  port: \${PORT:8080}

spring:
  application:
    name: ms-pedidos360-orders

  # 1. Base de Datos: PostgreSQL en AWS RDS
  datasource:
    url: \${DB_URL:jdbc:postgresql://rds-orders-prod.cluster-c7k8m.us-east-1.rds.amazonaws.com:5432/orders_db}
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:secret_password}
    driver-class-name: org.postgresql.Driver
    hikari:
      pool-name: OrdersHikariPool
      maximum-pool-size: \${DB_POOL_MAX:20}
      minimum-idle: \${DB_POOL_MIN:5}
      idle-timeout: 300000
      connection-timeout: 20000
      max-lifetime: 1200000

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: \${JPA_DDL_AUTO:update}
    show-sql: \${SHOW_SQL:false}
    open-in-view: false

  # 2. Seguridad: OAuth2 Resource Server para Azure AD (Entra ID)
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: \${AZURE_AD_ISSUER_URI:https://login.microsoftonline.com/{tenant-id}/v2.0}
          jwk-set-uri: \${AZURE_AD_JWK_SET_URI:https://login.microsoftonline.com/{tenant-id}/discovery/v2.0/keys}

  # 3. RabbitMQ: Exchange "cmd.direct", Routing key "email.send"
  rabbitmq:
    host: \${RABBITMQ_HOST:localhost}
    port: \${RABBITMQ_PORT:5672}
    username: \${RABBITMQ_USERNAME:guest}
    password: \${RABBITMQ_PASSWORD:guest}

  # 4. Kafka: Topic "orders.events"
  kafka:
    bootstrap-servers: \${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true

# 5. OpenFeign: Catálogo
pedidos360:
  catalog-service:
    url: \${CATALOG_SERVICE_URL:http://ms-pedidos360-catalog:8081}
  messaging:
    rabbitmq:
      exchange: \${RABBITMQ_EXCHANGE_ORDERS:cmd.direct}
      routing-key-email: \${RABBITMQ_RK_EMAIL:email.send}
    kafka:
      topic-orders-events: \${KAFKA_TOPIC_ORDERS:orders.events}

# 6. OpenAPI 3 / Swagger UI
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html`
  },
  {
    path: 'com/pedidos360/orders/config/SecurityConfig.java',
    category: 'security',
    language: 'java',
    title: 'SecurityConfig.java (OAuth2 Resource Server & Azure AD Roles)',
    code: `package com.pedidos360.orders.config;

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

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/**").hasAnyAuthority("ROLE_Orders.Read", "ROLE_Orders.Admin", "SCOPE_Orders.Read")
                .requestMatchers(HttpMethod.POST, "/api/orders/**").hasAnyAuthority("ROLE_Orders.Create", "ROLE_Orders.Admin", "SCOPE_Orders.Write")
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").hasAnyAuthority("ROLE_Orders.Update", "ROLE_Orders.Admin", "SCOPE_Orders.Write")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(azureAdJwtAuthenticationConverter()))
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter azureAdJwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new Converter<Jwt, Collection<GrantedAuthority>>() {
            @Override
            public Collection<GrantedAuthority> convert(Jwt jwt) {
                Collection<GrantedAuthority> grantedAuthorities = new ArrayList<>();

                // 1. Extraer App Roles asignados en Azure AD ("roles" claim)
                List<String> roles = jwt.getClaimAsStringList("roles");
                if (roles != null && !roles.isEmpty()) {
                    roles.forEach(role -> grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                }

                // 2. Extraer Scopes delegados ("scp" claim)
                String scp = jwt.getClaimAsString("scp");
                if (scp != null && !scp.isBlank()) {
                    for (String scope : scp.split(" ")) {
                        grantedAuthorities.add(new SimpleGrantedAuthority("SCOPE_" + scope));
                    }
                }

                return grantedAuthorities;
            }
        });
        return converter;
    }
}`
  },
  {
    path: 'com/pedidos360/orders/model/entity/Order.java',
    category: 'entity',
    language: 'java',
    title: 'Order.java (Entidad Principal JPA)',
    code: `package com.pedidos360.orders.model.entity;

import com.pedidos360.orders.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_client_id", columnList = "client_id"),
    @Index(name = "idx_orders_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id", nullable = false, length = 64)
    private String clientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OrderStatus status;

    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = OrderStatus.CREADO;
        calculateTotal();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateTotal();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void calculateTotal() {
        if (this.items != null && !this.items.isEmpty()) {
            this.total = this.items.stream()
                    .map(item -> {
                        item.calculateSubtotal();
                        return item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else if (this.total == null) {
            this.total = BigDecimal.ZERO;
        }
    }
}`
  },
  {
    path: 'com/pedidos360/orders/service/OrderStateMachineService.java',
    category: 'service',
    language: 'java',
    title: 'OrderStateMachineService.java (Reglas de Negocio)',
    code: `package com.pedidos360.orders.service;

import com.pedidos360.orders.exception.InvalidOrderStateException;
import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public class OrderStateMachineService {

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        // CREADO -> ACEPTADO, CANCELADO
        VALID_TRANSITIONS.put(OrderStatus.CREADO, EnumSet.of(OrderStatus.ACEPTADO, OrderStatus.CANCELADO));

        // ACEPTADO -> EN_PREPARACION, DESPACHADO, CANCELADO
        VALID_TRANSITIONS.put(OrderStatus.ACEPTADO, EnumSet.of(OrderStatus.EN_PREPARACION, OrderStatus.DESPACHADO, OrderStatus.CANCELADO));

        // EN_PREPARACION -> DESPACHADO, CANCELADO
        VALID_TRANSITIONS.put(OrderStatus.EN_PREPARACION, EnumSet.of(OrderStatus.DESPACHADO, OrderStatus.CANCELADO));

        // DESPACHADO -> ENTREGADO
        VALID_TRANSITIONS.put(OrderStatus.DESPACHADO, EnumSet.of(OrderStatus.ENTREGADO));

        // Estados terminales
        VALID_TRANSITIONS.put(OrderStatus.ENTREGADO, EnumSet.noneOf(OrderStatus.class));
        VALID_TRANSITIONS.put(OrderStatus.CANCELADO, EnumSet.noneOf(OrderStatus.class));
    }

    public void validateTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) return;

        // REGLA 5: Un pedido NO puede cambiar a DESPACHADO si no está en estado ACEPTADO o EN_PREPARACION.
        if (targetStatus == OrderStatus.DESPACHADO) {
            if (currentStatus != OrderStatus.ACEPTADO && currentStatus != OrderStatus.EN_PREPARACION) {
                log.error("Violación: Transición a DESPACHADO rechazada. Estado actual: {}", currentStatus);
                throw InvalidOrderStateException.cannotTransitionToDispatched(currentStatus);
            }
        }

        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(targetStatus)) {
            throw InvalidOrderStateException.invalidTransition(currentStatus, targetStatus);
        }
    }
}`
  },
  {
    path: 'com/pedidos360/orders/client/CatalogFeignClient.java',
    category: 'client',
    language: 'java',
    title: 'CatalogFeignClient.java (Cliente OpenFeign a ms-pedidos360-catalog)',
    code: `package com.pedidos360.orders.client;

import com.pedidos360.orders.client.dto.StockDiscountRequest;
import com.pedidos360.orders.client.dto.StockDiscountResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "ms-pedidos360-catalog",
    url = "\${pedidos360.catalog-service.url:http://ms-pedidos360-catalog:8081}"
)
public interface CatalogFeignClient {

    @PostMapping("/api/catalog/stock/discount")
    ResponseEntity<StockDiscountResponse> discountStock(@RequestBody StockDiscountRequest request);
}`
  },
  {
    path: 'com/pedidos360/orders/producer/RabbitMqOrderProducer.java',
    category: 'messaging',
    language: 'java',
    title: 'RabbitMqOrderProducer.java (Envelope a cmd.direct -> email.send)',
    code: `package com.pedidos360.orders.producer;

import com.pedidos360.orders.dto.event.OrderEmailNotificationPayload;
import com.pedidos360.orders.dto.event.RabbitEnvelope;
import com.pedidos360.orders.model.entity.Order;
import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMqOrderProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("\${pedidos360.messaging.rabbitmq.exchange:cmd.direct}")
    private String directExchange;

    @Value("\${pedidos360.messaging.rabbitmq.routing-key-email:email.send}")
    private String emailRoutingKey;

    public void sendOrderNotification(Order order, OrderStatus previousStatus, String reason) {
        String eventType = (previousStatus == null) ? "ORDER_CREATED" : "ORDER_STATUS_CHANGED";

        OrderEmailNotificationPayload payload = OrderEmailNotificationPayload.builder()
                .orderId(order.getId())
                .clientId(order.getClientId())
                .clientEmail("cliente-" + order.getClientId() + "@pedidos360.com")
                .previousStatus(previousStatus)
                .currentStatus(order.getStatus())
                .total(order.getTotal())
                .itemsCount(order.getItems() != null ? order.getItems().size() : 0)
                .subject("Actualización de Pedido #" + order.getId())
                .messageBody("Estado actual: " + order.getStatus() + (reason != null ? " - " + reason : ""))
                .build();

        RabbitEnvelope<OrderEmailNotificationPayload> envelope = RabbitEnvelope.of(
                eventType,
                "ms-pedidos360-orders",
                payload
        );

        log.info("Enviando envelope a RabbitMQ [Exchange: {}, RoutingKey: {}]", directExchange, emailRoutingKey);
        rabbitTemplate.convertAndSend(directExchange, emailRoutingKey, envelope);
    }
}`
  },
  {
    path: 'com/pedidos360/orders/producer/KafkaOrderProducer.java',
    category: 'messaging',
    language: 'java',
    title: 'KafkaOrderProducer.java (Publicación de Eventos en orders.events)',
    code: `package com.pedidos360.orders.producer;

import com.pedidos360.orders.dto.event.OrderBusinessEvent;
import com.pedidos360.orders.model.entity.Order;
import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaOrderProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("\${pedidos360.messaging.kafka.topic-orders-events:orders.events}")
    private String ordersEventsTopic;

    public void publishOrderEvent(Order order, OrderStatus previousStatus, String eventTypeSuffix) {
        OrderBusinessEvent event = OrderBusinessEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType("Order" + eventTypeSuffix)
                .occurredAt(Instant.now())
                .orderId(order.getId())
                .clientId(order.getClientId())
                .previousStatus(previousStatus)
                .currentStatus(order.getStatus())
                .total(order.getTotal())
                .items(order.getItems().stream().map(i -> OrderBusinessEvent.OrderItemEventDto.builder()
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build()).collect(Collectors.toList()))
                .build();

        kafkaTemplate.send(ordersEventsTopic, order.getId().toString(), event);
        log.info("Evento Kafka publicado a '{}' con key '{}'", ordersEventsTopic, order.getId());
    }
}`
  },
  {
    path: 'com/pedidos360/orders/controller/OrderController.java',
    category: 'controller',
    language: 'java',
    title: 'OrderController.java (REST Controller con OpenAPI 3 / Swagger)',
    code: `package com.pedidos360.orders.controller;

import com.pedidos360.orders.dto.request.CreateOrderRequest;
import com.pedidos360.orders.dto.request.UpdateOrderStatusRequest;
import com.pedidos360.orders.dto.response.OrderResponse;
import com.pedidos360.orders.model.enums.OrderStatus;
import com.pedidos360.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders Management", description = "Endpoints REST del microservicio ms-pedidos360-orders")
@SecurityRequirement(name = "AzureAD_BearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Create', 'ROLE_Orders.Admin', 'SCOPE_Orders.Write')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear nuevo pedido", description = "Inicia pedido en estado CREADO y publica eventos")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Read', 'ROLE_Orders.Admin', 'SCOPE_Orders.Read')")
    @Operation(summary = "Obtener pedido por UUID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Read', 'ROLE_Orders.Admin', 'SCOPE_Orders.Read')")
    @Operation(summary = "Listar pedidos con paginación")
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.listOrders(clientId, status, pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Update', 'ROLE_Orders.Admin', 'SCOPE_Orders.Write')")
    @Operation(summary = "Transición de Estado (Valida regla de despacho y descuento Feign en catálogo)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }
}`
  },
  {
    path: 'com/pedidos360/orders/service/impl/OrderServiceImpl.java',
    category: 'service',
    language: 'java',
    title: 'OrderServiceImpl.java (Lógica de Dominio y Transaccionalidad)',
    code: `package com.pedidos360.orders.service.impl;

import com.pedidos360.orders.client.CatalogFeignClient;
import com.pedidos360.orders.client.dto.*;
import com.pedidos360.orders.dto.request.*;
import com.pedidos360.orders.dto.response.*;
import com.pedidos360.orders.exception.*;
import com.pedidos360.orders.model.entity.*;
import com.pedidos360.orders.model.enums.OrderStatus;
import com.pedidos360.orders.producer.*;
import com.pedidos360.orders.repository.OrderRepository;
import com.pedidos360.orders.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderStateMachineService stateMachineService;
    private final CatalogFeignClient catalogFeignClient;
    private final RabbitMqOrderProducer rabbitMqProducer;
    private final KafkaOrderProducer kafkaProducer;

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        OrderStatus previous = order.getStatus();
        OrderStatus target = request.getStatus();

        // 1. Validar máquina de estados (incluye regla de DESPACHADO)
        stateMachineService.validateTransition(previous, target);

        // 2. Al transitar a ACEPTADO, invocar OpenFeign a ms-pedidos360-catalog para descontar stock
        if (target == OrderStatus.ACEPTADO && previous != OrderStatus.ACEPTADO) {
            discountStockInCatalog(order);
        }

        // 3. Persistir nuevo estado
        order.setStatus(target);
        Order updated = orderRepository.save(order);

        // 4. Publicar RabbitMQ envelope & Kafka Event
        rabbitMqProducer.sendOrderNotification(updated, previous, request.getReason());
        kafkaProducer.publishOrderEvent(updated, previous, target.name());

        return mapToResponse(updated);
    }

    private void discountStockInCatalog(Order order) {
        var items = order.getItems().stream()
                .map(i -> new StockDiscountItem(i.getProductId(), i.getQuantity()))
                .collect(Collectors.toList());

        var req = StockDiscountRequest.builder()
                .orderId(order.getId())
                .reason("Transición a ACEPTADO")
                .items(items)
                .build();

        var res = catalogFeignClient.discountStock(req);
        if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null || !res.getBody().isSuccess()) {
            throw new CatalogStockException(order.getId(), "Stock insuficiente en catálogo");
        }
    }
    // ... métodos auxiliares
}`
  },
  {
    path: 'docker-compose.yml',
    category: 'config',
    language: 'yaml',
    title: 'docker-compose.yml (PostgreSQL, RabbitMQ, Kafka)',
    code: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pedidos360-postgres
    environment:
      POSTGRES_DB: orders_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    container_name: pedidos360-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"
      - "15672:15672"

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: pedidos360-kafka
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:29093'
      KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:29092,CONTROLLER://0.0.0.0:29093,PLAINTEXT_HOST://0.0.0.0:9092'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
    ports:
      - "9092:9092"

volumes:
  pgdata:`
  },
  {
    path: '.vscode/launch.json',
    category: 'config',
    language: 'xml',
    title: '.vscode/launch.json (Configuración de Ejecución en VS Code F5)',
    code: `{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot - OrdersApplication",
      "request": "launch",
      "mainClass": "com.pedidos360.orders.OrdersApplication",
      "projectName": "ms-pedidos360-orders",
      "args": "",
      "env": {
        "PORT": "8080",
        "DB_URL": "jdbc:postgresql://localhost:5432/orders_db",
        "DB_USERNAME": "postgres",
        "DB_PASSWORD": "secret_password",
        "RABBITMQ_HOST": "localhost",
        "RABBITMQ_PORT": "5672",
        "RABBITMQ_USERNAME": "guest",
        "RABBITMQ_PASSWORD": "guest",
        "KAFKA_BOOTSTRAP_SERVERS": "localhost:9092",
        "CATALOG_SERVICE_URL": "http://localhost:8081",
        "AZURE_AD_ISSUER_URI": "https://login.microsoftonline.com/common/v2.0",
        "AZURE_AD_JWK_SET_URI": "https://login.microsoftonline.com/common/discovery/v2.0/keys"
      }
    }
  ]
}`
  },
  {
    path: 'requests.http',
    category: 'config',
    language: 'yaml',
    title: 'requests.http (Pruebas REST Client en VS Code)',
    code: `### Variables de Entorno
@baseUrl = http://localhost:8080
@token = YOUR_AZURE_AD_JWT_TOKEN_HERE

### 1. Actuator Health
GET {{baseUrl}}/actuator/health

### 2. Swagger OpenAPI Docs
GET {{baseUrl}}/v3/api-docs

### 3. Crear nuevo pedido (CREADO)
POST {{baseUrl}}/api/orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "clientId": "CLI-SCL-9281",
  "items": [
    { "productId": "SKU-LAPTOP-PRO-16", "quantity": 1, "unitPrice": 399.90 },
    { "productId": "SKU-MOUSE-WIRELESS", "quantity": 2, "unitPrice": 45.00 }
  ]
}

### 4. Transición a ACEPTADO (Descuenta stock)
PATCH {{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "ACEPTADO",
  "reason": "Pago verificado y stock validado"
}

### 5. Intento a DESPACHADO (Debe fallar con 422 si no está en ACEPTADO o EN_PREPARACION)
PATCH {{baseUrl}}/api/orders/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "DESPACHADO",
  "reason": "Intento ilegal de despacho directo"
}`
  }
];
