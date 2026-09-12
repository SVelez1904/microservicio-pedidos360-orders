package com.pedidos360.orders.service;

import com.pedidos360.orders.dto.request.CreateOrderRequest;
import com.pedidos360.orders.dto.request.UpdateOrderStatusRequest;
import com.pedidos360.orders.dto.response.OrderResponse;
import com.pedidos360.orders.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(UUID id);

    Page<OrderResponse> listOrders(String clientId, OrderStatus status, Pageable pageable);

    OrderResponse updateOrderStatus(UUID id, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(UUID id, String reason);
}
