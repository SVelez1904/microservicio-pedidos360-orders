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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders Management", description = "Endpoints REST para el ciclo de vida y máquina de estados de pedidos")
@SecurityRequirement(name = "AzureAD_BearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Create', 'ROLE_Orders.Admin', 'SCOPE_Orders.Write')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Crear nuevo pedido",
            description = "Crea un pedido en estado CREADO, calcula subtotales y total, emite notificación RabbitMQ y evento Kafka 'OrderCreated'."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
            @ApiResponse(responseCode = "401", description = "Token JWT de Azure AD ausente o inválido"),
            @ApiResponse(responseCode = "403", description = "Rol insuficiente para crear pedidos")
    })
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Read', 'ROLE_Orders.Admin', 'SCOPE_Orders.Read')")
    @Operation(summary = "Obtener pedido por UUID", description = "Recupera los datos del pedido y el detalle de sus items asociados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
            @ApiResponse(responseCode = "404", description = "Pedido no existe",
                    content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
    })
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "Identificador único UUID del pedido", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Read', 'ROLE_Orders.Admin', 'SCOPE_Orders.Read')")
    @Operation(summary = "Listar pedidos con paginación y filtros", description = "Permite filtrar por cliente o estado con paginación estándar de Spring Data.")
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @Parameter(description = "Filtrar por ID de cliente", example = "CLI-US-849201")
            @RequestParam(required = false) String clientId,
            @Parameter(description = "Filtrar por estado del pedido")
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.listOrders(clientId, status, pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Update', 'ROLE_Orders.Admin', 'SCOPE_Orders.Write')")
    @Operation(
            summary = "Actualizar estado del pedido (Máquina de Estados)",
            description = "Ejecuta la transición de estado validando reglas de negocio: "
                    + "1) No transita a DESPACHADO si no está en ACEPTADO o EN_PREPARACION. "
                    + "2) Al transitar a ACEPTADO, descuenta stock síncronamente en ms-pedidos360-catalog con OpenFeign. "
                    + "3) Publica envelope a RabbitMQ ('cmd.direct' / 'email.send') y evento Kafka a 'orders.events'."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado con éxito"),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado"),
            @ApiResponse(responseCode = "409", description = "Stock insuficiente en ms-pedidos360-catalog al intentar ACEPTAR"),
            @ApiResponse(responseCode = "422", description = "Transición inválida o regla de negocio infringida")
    })
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "UUID del pedido") @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_Orders.Update', 'ROLE_Orders.Admin', 'SCOPE_Orders.Write')")
    @Operation(summary = "Cancelar pedido", description = "Transita el pedido a estado CANCELADO si la máquina de estados lo permite.")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "Cancelación manual solicitada por el usuario") String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }
}
