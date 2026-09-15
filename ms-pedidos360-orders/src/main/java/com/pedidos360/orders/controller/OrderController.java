package com.pedidos360.orders.controller;

import com.pedidos360.orders.dto.request.CreateOrderRequest;
import com.pedidos360.orders.dto.request.UpdateOrderStatusRequest;
import com.pedidos360.orders.dto.response.OrderResponse;
import com.pedidos360.orders.model.enums.OrderStatus;
import com.pedidos360.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Tag(name = "Orders Management", description = "Endpoints REST para el ciclo de vida y máquina de estados de pedidos")
@SecurityRequirement(name = "AzureAD_BearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final JdbcTemplate jdbcTemplate;

    // --- ENDPOINTS DE CATÁLOGO (Mapea todas las variaciones posibles de ruta) ---
    @GetMapping({
        "/api/v1/catalog", 
        "/api/catalog", 
        "/catalog", 
        "/api/orders/api/v1/catalog",
        "/api/orders/catalog"
    })
    public ResponseEntity<List<Map<String, Object>>> getCatalog() {
        List<Map<String, Object>> products = jdbcTemplate.queryForList(
            "SELECT " +
            "  id AS \"id\", " +
            "  COALESCE(sku, 'SKU-GENERIC') AS \"sku\", " +
            "  name AS \"name\", " +
            "  COALESCE(description, 'Sin descripción') AS \"description\", " +
            "  price AS \"price\", " +
            "  stock AS \"stock\", " +
            "  COALESCE(min_stock, 5) AS \"minStock\", " +
            "  COALESCE(category, 'General') AS \"category\", " +
            "  true AS \"active\" " +
            "FROM products"
        );
        return ResponseEntity.ok(products);
    }

    // --- ENDPOINTS DE ORDERS (Soporta /api/orders y /api/v1/orders) ---
    @PostMapping({"/api/orders", "/api/v1/orders"})
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"/api/orders/{id}", "/api/v1/orders/{id}"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping({"/api/orders", "/api/v1/orders"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.listOrders(clientId, status, pageable));
    }

    @PatchMapping({"/api/orders/{id}/status", "/api/v1/orders/{id}/status"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    @PostMapping({"/api/orders/{id}/cancel", "/api/v1/orders/{id}/cancel"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "Cancelación manual solicitada por el usuario") String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }
}