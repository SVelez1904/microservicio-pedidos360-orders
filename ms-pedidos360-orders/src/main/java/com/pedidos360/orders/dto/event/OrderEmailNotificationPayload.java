package com.pedidos360.orders.dto.event;

import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEmailNotificationPayload {
    private UUID orderId;
    private String clientId;
    private String clientEmail;
    private OrderStatus previousStatus;
    private OrderStatus currentStatus;
    private BigDecimal total;
    private int itemsCount;
    private String subject;
    private String messageBody;
}
