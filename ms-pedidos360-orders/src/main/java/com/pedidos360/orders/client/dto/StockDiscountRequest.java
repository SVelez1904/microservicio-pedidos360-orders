package com.pedidos360.orders.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockDiscountRequest {
    private UUID orderId;
    private String reason;
    private List<StockDiscountItem> items;
}
