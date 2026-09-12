package com.pedidos360.orders.dto.event;

import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBusinessEvent {
    private String eventId;
    private String eventType; // OrderCreated, OrderAccepted, OrderInPreparation, OrderDispatched, OrderDelivered, OrderCancelled
    private Instant occurredAt;
    private UUID orderId;
    private String clientId;
    private OrderStatus previousStatus;
    private OrderStatus currentStatus;
    private BigDecimal total;
    private List<OrderItemEventDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemEventDto {
        private String productId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
