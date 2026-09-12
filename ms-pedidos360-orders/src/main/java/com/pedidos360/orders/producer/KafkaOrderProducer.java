package com.pedidos360.orders.producer;

import com.pedidos360.orders.dto.event.OrderBusinessEvent;
import com.pedidos360.orders.model.entity.Order;
import com.pedidos360.orders.model.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaOrderProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${pedidos360.messaging.kafka.topic-orders-events:orders.events}")
    private String ordersEventsTopic;

    public void publishOrderEvent(Order order, OrderStatus previousStatus, String eventTypeSuffix) {
        String eventType = "Order" + eventTypeSuffix; // e.g. OrderCreated, OrderAccepted, OrderStatusChanged

        List<OrderBusinessEvent.OrderItemEventDto> itemsDto = order.getItems() != null
                ? order.getItems().stream()
                .map(item -> OrderBusinessEvent.OrderItemEventDto.builder()
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        OrderBusinessEvent event = OrderBusinessEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .occurredAt(Instant.now())
                .orderId(order.getId())
                .clientId(order.getClientId())
                .previousStatus(previousStatus)
                .currentStatus(order.getStatus())
                .total(order.getTotal())
                .items(itemsDto)
                .build();

        String messageKey = order.getId().toString();

        log.info("Publicando evento de dominio Kafka [Topic: '{}', Key: '{}', Type: '{}']",
                ordersEventsTopic, messageKey, eventType);

        kafkaTemplate.send(ordersEventsTopic, messageKey, event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.debug("Evento Kafka publicado exitosamente [Topic: '{}', Partition: {}, Offset: {}]",
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    } else {
                        log.error("Fallo al publicar evento en Kafka para pedido {}: {}",
                                order.getId(), ex.getMessage(), ex);
                    }
                });
    }
}
