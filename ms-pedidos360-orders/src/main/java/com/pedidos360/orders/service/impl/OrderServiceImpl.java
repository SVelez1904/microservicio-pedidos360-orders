package com.pedidos360.orders.service.impl;

import com.pedidos360.orders.client.CatalogFeignClient;
import com.pedidos360.orders.client.dto.StockDiscountItem;
import com.pedidos360.orders.client.dto.StockDiscountRequest;
import com.pedidos360.orders.client.dto.StockDiscountResponse;
import com.pedidos360.orders.dto.request.CreateOrderRequest;
import com.pedidos360.orders.dto.request.UpdateOrderStatusRequest;
import com.pedidos360.orders.dto.response.OrderItemResponse;
import com.pedidos360.orders.dto.response.OrderResponse;
import com.pedidos360.orders.exception.CatalogStockException;
import com.pedidos360.orders.exception.OrderNotFoundException;
import com.pedidos360.orders.model.entity.Order;
import com.pedidos360.orders.model.entity.OrderItem;
import com.pedidos360.orders.model.enums.OrderStatus;
import com.pedidos360.orders.producer.KafkaOrderProducer;
import com.pedidos360.orders.producer.RabbitMqOrderProducer;
import com.pedidos360.orders.repository.OrderRepository;
import com.pedidos360.orders.service.OrderService;
import com.pedidos360.orders.service.OrderStateMachineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderStateMachineService stateMachineService;
    private final CatalogFeignClient catalogFeignClient;
    private final RabbitMqOrderProducer rabbitMqProducer;
    private final KafkaOrderProducer kafkaProducer;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creando nuevo pedido para clientId={}", request.getClientId());

        Order order = Order.builder()
                .clientId(request.getClientId())
                .status(OrderStatus.CREADO)
                .items(new ArrayList<>())
                .build();

        for (var itemReq : request.getItems()) {
            BigDecimal subtotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            OrderItem item = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .subtotal(subtotal)
                    .build();
            order.addItem(item);
        }

        order.calculateTotal();
        Order savedOrder = orderRepository.save(order);

        log.info("Pedido creado exitosamente con ID={} y Total={}", savedOrder.getId(), savedOrder.getTotal());

        // 1. Mensajería RabbitMQ: Notificación envelope a exchange cmd.direct -> email.send
        rabbitMqProducer.sendOrderNotification(savedOrder, null, "Pedido creado exitosamente");

        // 2. Event Streaming Kafka: Publicación a orders.events
        kafkaProducer.publishOrderEvent(savedOrder, null, "Created");

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> listOrders(String clientId, OrderStatus status, Pageable pageable) {
        Page<Order> page;
        if (clientId != null && status != null) {
            page = orderRepository.findByClientIdAndStatus(clientId, status, pageable);
        } else if (clientId != null) {
            page = orderRepository.findByClientId(clientId, pageable);
        } else if (status != null) {
            page = orderRepository.findByStatus(status, pageable);
        } else {
            page = orderRepository.findAll(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID id, UpdateOrderStatusRequest request) {
        log.info("Solicitud de cambio de estado para pedido ID={} -> {}", id, request.getStatus());

        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        OrderStatus previousStatus = order.getStatus();
        OrderStatus targetStatus = request.getStatus();

        // 1. Validar máquina de estados y reglas de negocio
        stateMachineService.validateTransition(previousStatus, targetStatus);

        // 2. Regla de Negocio: Al cambiar a ACEPTADO, invocar ms-pedidos360-catalog para descontar stock
        if (targetStatus == OrderStatus.ACEPTADO && previousStatus != OrderStatus.ACEPTADO) {
            discountStockInCatalog(order);
        }

        // 3. Persistir actualización
        order.setStatus(targetStatus);
        Order updatedOrder = orderRepository.save(order);

        log.info("Estado de pedido ID={} actualizado de [{}] a [{}]", id, previousStatus, targetStatus);

        // 4. Asincronía RabbitMQ: Envelope a cmd.direct -> email.send
        rabbitMqProducer.sendOrderNotification(updatedOrder, previousStatus, request.getReason());

        // 5. Asincronía Kafka: Evento de negocio en orders.events
        String eventSuffix = getKafkaEventSuffix(targetStatus);
        kafkaProducer.publishOrderEvent(updatedOrder, previousStatus, eventSuffix);

        return mapToResponse(updatedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID id, String reason) {
        UpdateOrderStatusRequest cancelRequest = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.CANCELADO)
                .reason(reason != null ? reason : "Cancelación manual solicitada")
                .build();
        return updateOrderStatus(id, cancelRequest);
    }

    /**
     * Invocación síncrona vía OpenFeign al microservicio de catálogo.
     */
    private void discountStockInCatalog(Order order) {
        log.info("Invocando ms-pedidos360-catalog vía OpenFeign para descontar stock de {} items para la orden {}",
                order.getItems().size(), order.getId());

        List<StockDiscountItem> itemsToDiscount = order.getItems().stream()
                .map(i -> StockDiscountItem.builder()
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .build())
                .collect(Collectors.toList());

        StockDiscountRequest discountRequest = StockDiscountRequest.builder()
                .orderId(order.getId())
                .reason("Confirmación de pedido y transición a estado ACEPTADO")
                .items(itemsToDiscount)
                .build();

        try {
            ResponseEntity<StockDiscountResponse> response = catalogFeignClient.discountStock(discountRequest);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null || !response.getBody().isSuccess()) {
                String errMsg = response.getBody() != null ? response.getBody().getMessage() : "Respuesta no exitosa de catálogo";
                throw new CatalogStockException(order.getId(), errMsg);
            }
            log.info("Stock descontado exitosamente en catálogo. TxID={}", response.getBody().getTransactionId());
        } catch (Exception ex) {
            log.error("Fallo al descontar stock en ms-pedidos360-catalog para orden {}: {}", order.getId(), ex.getMessage());
            if (ex instanceof CatalogStockException) {
                throw ex;
            }
            throw new CatalogStockException(order.getId(), "Error de comunicación con ms-pedidos360-catalog: " + ex.getMessage());
        }
    }

    private String getKafkaEventSuffix(OrderStatus status) {
        return switch (status) {
            case ACEPTADO -> "Accepted";
            case EN_PREPARACION -> "InPreparation";
            case DESPACHADO -> "Dispatched";
            case ENTREGADO -> "Delivered";
            case CANCELADO -> "Cancelled";
            default -> "StatusChanged";
        };
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems() != null
                ? order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .clientId(order.getClientId())
                .status(order.getStatus())
                .total(order.getTotal())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(items)
                .build();
    }
}
