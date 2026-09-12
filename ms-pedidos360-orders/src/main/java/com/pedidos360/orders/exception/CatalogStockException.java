package com.pedidos360.orders.exception;

import java.util.UUID;

public class CatalogStockException extends RuntimeException {
    public CatalogStockException(UUID orderId, String reason) {
        super(String.format("Error al descontar stock en ms-pedidos360-catalog para la orden %s: %s", orderId, reason));
    }

    public CatalogStockException(String message, Throwable cause) {
        super(message, cause);
    }
}
