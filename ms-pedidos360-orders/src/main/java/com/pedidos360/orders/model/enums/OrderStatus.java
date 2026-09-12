package com.pedidos360.orders.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estados válidos en el ciclo de vida de un pedido")
public enum OrderStatus {
    @Schema(description = "Pedido registrado inicialmente en el sistema")
    CREADO,

    @Schema(description = "Pedido confirmado y validado con descuento de stock en catálogo")
    ACEPTADO,

    @Schema(description = "Pedido en fase de empaquetado o preparación en bodega")
    EN_PREPARACION,

    @Schema(description = "Pedido despachado y entregado al transportista")
    DESPACHADO,

    @Schema(description = "Pedido recibido satisfactoriamente por el cliente")
    ENTREGADO,

    @Schema(description = "Pedido anulado/cancelado")
    CANCELADO
}
