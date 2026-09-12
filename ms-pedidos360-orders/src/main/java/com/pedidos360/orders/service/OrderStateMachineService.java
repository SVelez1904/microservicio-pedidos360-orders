package com.pedidos360.orders.service;

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
        // CREADO -> ACEPTADO o CANCELADO
        VALID_TRANSITIONS.put(OrderStatus.CREADO, EnumSet.of(OrderStatus.ACEPTADO, OrderStatus.CANCELADO));

        // ACEPTADO -> EN_PREPARACION, DESPACHADO o CANCELADO
        VALID_TRANSITIONS.put(OrderStatus.ACEPTADO, EnumSet.of(OrderStatus.EN_PREPARACION, OrderStatus.DESPACHADO, OrderStatus.CANCELADO));

        // EN_PREPARACION -> DESPACHADO o CANCELADO
        VALID_TRANSITIONS.put(OrderStatus.EN_PREPARACION, EnumSet.of(OrderStatus.DESPACHADO, OrderStatus.CANCELADO));

        // DESPACHADO -> ENTREGADO
        VALID_TRANSITIONS.put(OrderStatus.DESPACHADO, EnumSet.of(OrderStatus.ENTREGADO));

        // Estados terminales no admiten más transiciones
        VALID_TRANSITIONS.put(OrderStatus.ENTREGADO, EnumSet.noneOf(OrderStatus.class));
        VALID_TRANSITIONS.put(OrderStatus.CANCELADO, EnumSet.noneOf(OrderStatus.class));
    }

    /**
     * Valida la máquina de estados y las reglas de negocio estrictas.
     *
     * @param currentStatus Estado actual de la orden.
     * @param targetStatus  Estado solicitado.
     */
    public void validateTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) {
            log.warn("La orden ya se encuentra en estado {}", currentStatus);
            return;
        }

        // Regla explícita 5: Un pedido NO puede cambiar a DESPACHADO si no está en estado ACEPTADO o EN_PREPARACION.
        if (targetStatus == OrderStatus.DESPACHADO) {
            if (currentStatus != OrderStatus.ACEPTADO && currentStatus != OrderStatus.EN_PREPARACION) {
                log.error("Violación de regla: Intento de transición a DESPACHADO desde estado inválido: {}", currentStatus);
                throw InvalidOrderStateException.cannotTransitionToDispatched(currentStatus);
            }
        }

        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(targetStatus)) {
            log.error("Transición ilegal de máquina de estados: {} -> {}", currentStatus, targetStatus);
            throw InvalidOrderStateException.invalidTransition(currentStatus, targetStatus);
        }

        log.info("Transición de estado validada exitosamente: {} -> {}", currentStatus, targetStatus);
    }
}
