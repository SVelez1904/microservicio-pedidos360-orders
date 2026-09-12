# ms-pedidos360-orders

Microservicio de gestión de órdenes y pedidos para la arquitectura de microservicios **Pedidos360**, construido con **Spring Boot 3.3**, **Java 21**, **PostgreSQL en AWS RDS**, seguridad **OAuth2 / Azure AD (Entra ID)**, mensajería asíncrona dual (**RabbitMQ** y **Apache Kafka**) y cliente declarativo **Spring Cloud OpenFeign**.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión |
| :--- | :--- | :--- |
| Lenguaje | Java (OpenJDK Temurin) | 21 LTS |
| Framework | Spring Boot | 3.3.4 |
| Persistencia | Spring Data JPA / Hibernate | 6.5+ |
| Base de Datos | PostgreSQL (AWS RDS) | 16+ |
| Seguridad | Spring Security OAuth2 Resource Server | 6.3+ (Azure AD / Entra ID) |
| REST Client | Spring Cloud OpenFeign | 2023.0.3 |
| Broker Notificaciones | RabbitMQ (Exchange `cmd.direct` -> `email.send`) | AMQP 0-9-1 |
| Event Streaming | Apache Kafka (Topic `orders.events`) | 3.7+ |
| Documentación API | Springdoc OpenAPI 3 / Swagger UI | 2.6.0 |

---

## ⚙️ Variables de Entorno Requeridas

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `DB_URL` | JDBC URL de PostgreSQL en AWS RDS | `jdbc:postgresql://rds-orders-prod...:5432/orders_db` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `secret` |
| `AZURE_AD_ISSUER_URI` | Issuer URI de Microsoft Entra ID | `https://login.microsoftonline.com/{tenant-id}/v2.0` |
| `AZURE_AD_JWK_SET_URI` | JWKS URI para validación de firma RS256 | `https://login.microsoftonline.com/{tenant-id}/discovery/v2.0/keys` |
| `RABBITMQ_HOST` | Host del cluster RabbitMQ | `localhost` / `b-xyz.mq.us-east-1.amazonaws.com` |
| `RABBITMQ_PORT` | Puerto AMQP | `5672` |
| `RABBITMQ_USERNAME` | Usuario RabbitMQ | `guest` |
| `RABBITMQ_PASSWORD` | Password RabbitMQ | `guest` |
| `KAFKA_BOOTSTRAP_SERVERS` | Brokers de Apache Kafka / AWS MSK | `localhost:9092` |
| `CATALOG_SERVICE_URL` | URL base de ms-pedidos360-catalog | `http://ms-pedidos360-catalog:8081` |

---

## 🔄 Reglas de Negocio & Máquina de Estados

### Estados Válidos
`CREADO` ➡️ `ACEPTADO` ➡️ `EN_PREPARACION` ➡️ `DESPACHADO` ➡️ `ENTREGADO`
(y `CANCELADO` desde estados previos a `DESPACHADO` o `ENTREGADO`).

### Reglas Críticas:
1. **Transición a DESPACHADO:**
   Un pedido **NO puede** cambiar a `DESPACHADO` si no está en estado `ACEPTADO` o `EN_PREPARACION`. De lo contrario arroja `422 Unprocessable Entity` (`InvalidOrderStateException`).
2. **Descuento de Stock en Catálogo:**
   Al cambiar a estado `ACEPTADO`, el microservicio invoca vía OpenFeign:
   `POST /api/catalog/stock/discount` en `ms-pedidos360-catalog`. Si el stock es insuficiente, se aborta la transacción y se retorna `409 Conflict` (`CatalogStockException`).
3. **Notificación RabbitMQ (Envelope):**
   En cada creación y cambio de estado, se publica a `cmd.direct` con routing key `email.send`:
   ```json
   {
     "eventId": "3c90c3cc-...",
     "timestamp": "2026-09-09T16:00:00.000Z",
     "eventType": "ORDER_STATUS_CHANGED_NOTIFICATION",
     "source": "ms-pedidos360-orders",
     "payload": { ... }
   }
   ```
4. **Event Streaming Kafka:**
   Se publica un evento tipado (`OrderCreated`, `OrderAccepted`, `OrderDispatched`, etc.) en el topic `orders.events` particionado por `orderId`.

---

## 🚀 Compilación y Ejecución

```bash
# 1. Compilar con Maven
mvn clean package -DskipTests

# 2. Ejecutar localmente con perfil default o variables
export DB_URL="jdbc:postgresql://localhost:5432/orders_db"
export DB_USERNAME="postgres"
export DB_PASSWORD="password"
java -jar target/ms-pedidos360-orders-1.0.0-SNAPSHOT.jar

# 3. Acceder a Swagger UI
http://localhost:8080/swagger-ui.html
```
