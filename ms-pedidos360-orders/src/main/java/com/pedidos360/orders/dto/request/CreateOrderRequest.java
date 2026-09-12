package com.pedidos360.orders.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload para la creación de un nuevo pedido")
public class CreateOrderRequest {

    @NotBlank(message = "El clientId es obligatorio")
    @Schema(description = "Identificador único o UUID del cliente solicitante", example = "CLI-US-849201")
    private String clientId;

    @NotEmpty(message = "El pedido debe contener al menos un item")
    @Valid
    @Schema(description = "Lista de items que componen el pedido")
    private List<OrderItemRequest> items;
}
