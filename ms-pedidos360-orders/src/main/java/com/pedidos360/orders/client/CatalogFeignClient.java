package com.pedidos360.orders.client;

import com.pedidos360.orders.client.dto.StockDiscountRequest;
import com.pedidos360.orders.client.dto.StockDiscountResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "ms-pedidos360-catalog",
        url = "${pedidos360.catalog-service.url:http://ms-pedidos360-catalog:8081}"
)
public interface CatalogFeignClient {

    @PostMapping("/api/catalog/stock/discount")
    ResponseEntity<StockDiscountResponse> discountStock(@RequestBody StockDiscountRequest request);
}
