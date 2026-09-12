package com.pedidos360.orders.exception;

import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.Getter;

@Getter
public class InvalidOrderStateException extends RuntimeException {
    private final OrderStatus currentStatus;
    private final OrderStatus attemptedStatus;

    public InvalidOrderStateException(OrderStatus currentStatus, OrderStatus attemptedStatus, String message) {
        super(message);
        this.currentStatus = currentStatus;
        this.attemptedStatus = attemptedStatus;
    }

    public static InvalidOrderStateException cannotTransitionToDispatched(OrderStatus currentStatus) {
        return new InvalidOrderStateException(
                currentStatus,
                OrderStatus.DESPACHADO,
                String.format("Regla de negocio infringida: Un pedido NO puede cambiar a DESPACHADO si no está en estado ACEPTADO o EN_PREPARACION. Estado actual: %s", currentStatus)
        );
    }

    public static InvalidOrderStateException invalidTransition(OrderStatus currentStatus, OrderStatus attemptedStatus) {
        return new InvalidOrderStateException(
                currentStatus,
                attemptedStatus,
                String.format("Transición de estado inválida: No es posible transitar desde [%s] hacia [%s]", currentStatus, attemptedStatus)
        );
    }
}
