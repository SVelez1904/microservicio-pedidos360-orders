package com.pedidos360.orders.producer;

import com.pedidos360.orders.dto.event.OrderEmailNotificationPayload;
import com.pedidos360.orders.dto.event.RabbitEnvelope;
import com.pedidos360.orders.model.entity.Order;
import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMqOrderProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${pedidos360.messaging.rabbitmq.exchange:cmd.direct}")
    private String directExchange;

    @Value("${pedidos360.messaging.rabbitmq.routing-key-email:email.send}")
    private String emailRoutingKey;

    public void sendOrderNotification(Order order, OrderStatus previousStatus, String reason) {
        String eventType = (previousStatus == null)
                ? "ORDER_CREATED_NOTIFICATION"
                : "ORDER_STATUS_CHANGED_NOTIFICATION";

        String subject = String.format("Actualización de tu Pedido #%s: %s",
                order.getId().toString().substring(0, 8), order.getStatus());

        String messageBody = String.format("Tu pedido #%s ha cambiado de estado [%s] -> [%s]. %s",
                order.getId(),
                previousStatus != null ? previousStatus : "NUEVO",
                order.getStatus(),
                reason != null ? "Detalle: " + reason : "");

        OrderEmailNotificationPayload payload = OrderEmailNotificationPayload.builder()
                .orderId(order.getId())
                .clientId(order.getClientId())
                .clientEmail("cliente-" + order.getClientId() + "@pedidos360.com") // Extraído de identidad o perfil
                .previousStatus(previousStatus)
                .currentStatus(order.getStatus())
                .total(order.getTotal())
                .itemsCount(order.getItems() != null ? order.getItems().size() : 0)
                .subject(subject)
                .messageBody(messageBody)
                .build();

        RabbitEnvelope<OrderEmailNotificationPayload> envelope = RabbitEnvelope.of(
                eventType,
                "ms-pedidos360-orders",
                payload
        );

        log.info("Publicando envelope RabbitMQ [Exchange: '{}', RoutingKey: '{}', EventId: '{}']",
                directExchange, emailRoutingKey, envelope.getEventId());

        rabbitTemplate.convertAndSend(directExchange, emailRoutingKey, envelope);
    }
}
