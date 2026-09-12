package com.pedidos360.orders.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Detalle del item solicitado en el pedido")
public class OrderItemRequest {

    @NotBlank(message = "El productId es obligatorio")
    @Schema(description = "Identificador único del producto en el catálogo", example = "PROD-SKU-9921")
    private String productId;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a 0")
    @Schema(description = "Cantidad solicitada", example = "2")
    private Integer quantity;

    @NotNull(message = "El precio unitario es obligatorio")
    @Positive(message = "El precio unitario debe ser positivo")
    @Schema(description = "Precio unitario pactado", example = "24.99")
    private BigDecimal unitPrice;
}
