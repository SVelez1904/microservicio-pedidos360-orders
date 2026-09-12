package com.pedidos360.orders.dto.request;

import com.pedidos360.orders.model.enums.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Petición para transición de estado en la máquina de estados del pedido")
public class UpdateOrderStatusRequest {

    @NotNull(message = "El nuevo estado (status) es obligatorio")
    @Schema(description = "Nuevo estado al que transitará el pedido", example = "ACEPTADO")
    private OrderStatus status;

    @Schema(description = "Motivo o nota explicativa del cambio de estado", example = "Confirmación de pago y stock")
    private String reason;
}
