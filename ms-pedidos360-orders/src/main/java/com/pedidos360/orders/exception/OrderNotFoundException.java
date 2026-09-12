package com.pedidos360.orders.exception;

import java.util.UUID;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(UUID orderId) {
        super("Pedido no encontrado con ID: " + orderId);
    }
}
