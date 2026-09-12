package com.pedidos360.orders.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RabbitEnvelope<T> {

    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    @Builder.Default
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "UTC")
    private Instant timestamp = Instant.now();

    private String eventType;

    private String source;

    private T payload;

    public static <T> RabbitEnvelope<T> of(String eventType, String source, T payload) {
        return RabbitEnvelope.<T>builder()
                .eventId(UUID.randomUUID().toString())
                .timestamp(Instant.now())
                .eventType(eventType)
                .source(source)
                .payload(payload)
                .build();
    }
}
