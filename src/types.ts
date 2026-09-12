export type OrderStatus = 'CREADO' | 'ACEPTADO' | 'EN_PREPARACION' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  clientId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface RabbitEnvelope<T = any> {
  eventId: string;
  timestamp: string;
  eventType: string;
  source: string;
  payload: T;
}

export interface KafkaBusinessEvent {
  eventId: string;
  eventType: string;
  occurredAt: string;
  orderId: string;
  clientId: string;
  previousStatus: OrderStatus | null;
  currentStatus: OrderStatus;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export interface SourceFile {
  path: string;
  category: 'build' | 'config' | 'entity' | 'service' | 'controller' | 'messaging' | 'security' | 'client';
  language: 'xml' | 'yaml' | 'java' | 'docker' | 'markdown';
  title: string;
  code: string;
}
