import React, { useState } from 'react';
import { Order, OrderStatus, RabbitEnvelope, KafkaBusinessEvent } from '../types';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Send, 
  RefreshCw, 
  Server, 
  ShieldAlert, 
  Mail, 
  Database,
  Check
} from 'lucide-react';

const INITIAL_ORDER: Order = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  clientId: 'CLI-SCL-9281',
  status: 'CREADO',
  total: 489.90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    { id: 'item-1', productId: 'SKU-LAPTOP-PRO-16', quantity: 1, unitPrice: 399.90, subtotal: 399.90 },
    { id: 'item-2', productId: 'SKU-MOUSE-WIRELESS', quantity: 2, unitPrice: 45.00, subtotal: 90.00 }
  ]
};

const ALL_STATUSES: OrderStatus[] = [
  'CREADO',
  'ACEPTADO',
  'EN_PREPARACION',
  'DESPACHADO',
  'ENTREGADO',
  'CANCELADO'
];

export const StateMachineSimulator: React.FC = () => {
  const [order, setOrder] = useState<Order>(INITIAL_ORDER);
  const [hasStockInCatalog, setHasStockInCatalog] = useState<boolean>(true);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([
    `[INFO] [OrderService] Pedido inicializado en PostgreSQL RDS: ID=${INITIAL_ORDER.id} con estado CREADO`
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feignCallDetail, setFeignCallDetail] = useState<{
    endpoint: string;
    status: number;
    payload: any;
    response: any;
  } | null>(null);
  const [lastRabbitEnvelope, setLastRabbitEnvelope] = useState<RabbitEnvelope | null>(null);
  const [lastKafkaEvent, setLastKafkaEvent] = useState<KafkaBusinessEvent | null>(null);

  const resetOrder = () => {
    setOrder({
      ...INITIAL_ORDER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setErrorMessage(null);
    setFeignCallDetail(null);
    setLastRabbitEnvelope(null);
    setLastKafkaEvent(null);
    setSimulatedLogs([
      `[INFO] [OrderService] Pedido reiniciado en BD RDS: ID=${INITIAL_ORDER.id} con estado CREADO`
    ]);
  };

  const attemptTransition = (targetStatus: OrderStatus) => {
    setErrorMessage(null);
    const prevStatus = order.status;

    // REGLA CRÍTICA 1: Un pedido NO puede cambiar a DESPACHADO si no está en estado ACEPTADO o EN_PREPARACION
    if (targetStatus === 'DESPACHADO') {
      if (prevStatus !== 'ACEPTADO' && prevStatus !== 'EN_PREPARACION') {
        const error = `[422 UNPROCESSABLE_ENTITY] Regla de negocio infringida: Un pedido NO puede cambiar a DESPACHADO si no está en estado ACEPTADO o EN_PREPARACION. Estado actual: ${prevStatus}`;
        setErrorMessage(error);
        setSimulatedLogs(prev => [
          `[ERROR] [OrderStateMachineService] ${error}`,
          ...prev
        ]);
        return;
      }
    }

    // Validación de máquina de estados general
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      CREADO: ['ACEPTADO', 'CANCELADO'],
      ACEPTADO: ['EN_PREPARACION', 'DESPACHADO', 'CANCELADO'],
      EN_PREPARACION: ['DESPACHADO', 'CANCELADO'],
      DESPACHADO: ['ENTREGADO'],
      ENTREGADO: [],
      CANCELADO: []
    };

    if (!allowedTransitions[prevStatus].includes(targetStatus)) {
      const error = `[422 UNPROCESSABLE_ENTITY] Transición no permitida en la máquina de estados: [${prevStatus}] ➔ [${targetStatus}]`;
      setErrorMessage(error);
      setSimulatedLogs(prev => [`[ERROR] [OrderStateMachineService] ${error}`, ...prev]);
      return;
    }

    // REGLA CRÍTICA 2: Al cambiar a ACEPTADO, invocar OpenFeign a ms-pedidos360-catalog para descontar stock
    if (targetStatus === 'ACEPTADO') {
      const feignReq = {
        orderId: order.id,
        reason: 'Confirmación y transición a ACEPTADO',
        items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };

      if (!hasStockInCatalog) {
        const error = `[409 CONFLICT] ms-pedidos360-catalog rechazó el descuento: Stock insuficiente para SKU-LAPTOP-PRO-16 en bodega central.`;
        setErrorMessage(error);
        setFeignCallDetail({
          endpoint: 'POST http://ms-pedidos360-catalog:8081/api/catalog/stock/discount',
          status: 409,
          payload: feignReq,
          response: { success: false, message: 'Stock insuficiente' }
        });
        setSimulatedLogs(prev => [
          `[ERROR] [FeignClient] Fallo en ms-pedidos360-catalog: 409 Conflict - Stock insuficiente. Transacción abortada.`,
          ...prev
        ]);
        return;
      } else {
        setFeignCallDetail({
          endpoint: 'POST http://ms-pedidos360-catalog:8081/api/catalog/stock/discount',
          status: 200,
          payload: feignReq,
          response: {
            success: true,
            transactionId: 'feign-tx-994821',
            message: 'Stock descontado satisfactoriamente',
            timestamp: new Date().toISOString()
          }
        });
        setSimulatedLogs(prev => [
          `[INFO] [OpenFeign] Invocación a ms-pedidos360-catalog OK (200). Stock reservado y descontado.`,
          ...prev
        ]);
      }
    }

    // Transición exitosa
    const updatedOrder: Order = {
      ...order,
      status: targetStatus,
      updatedAt: new Date().toISOString()
    };
    setOrder(updatedOrder);

    // RabbitMQ Envelope
    const envelope: RabbitEnvelope = {
      eventId: crypto.randomUUID ? crypto.randomUUID() : 'evt-' + Date.now(),
      timestamp: new Date().toISOString(),
      eventType: 'ORDER_STATUS_CHANGED_NOTIFICATION',
      source: 'ms-pedidos360-orders',
      payload: {
        orderId: order.id,
        clientId: order.clientId,
        previousStatus: prevStatus,
        currentStatus: targetStatus,
        total: order.total,
        subject: `Actualización de Pedido: ${targetStatus}`,
        message: `Su orden ha cambiado de estado [${prevStatus}] a [${targetStatus}].`
      }
    };
    setLastRabbitEnvelope(envelope);

    // Kafka Business Event
    const kafkaEvt: KafkaBusinessEvent = {
      eventId: crypto.randomUUID ? crypto.randomUUID() : 'kafka-' + Date.now(),
      eventType: `Order${targetStatus.charAt(0) + targetStatus.slice(1).toLowerCase()}`,
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      clientId: order.clientId,
      previousStatus: prevStatus,
      currentStatus: targetStatus,
      total: order.total,
      items: order.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal
      }))
    };
    setLastKafkaEvent(kafkaEvt);

    setSimulatedLogs(prev => [
      `[INFO] [OrderService] Transición persistida en PostgreSQL RDS: [${prevStatus}] ➔ [${targetStatus}]`,
      `[INFO] [RabbitMQ] Envelope publicado a Exchange 'cmd.direct' con routing key 'email.send'`,
      `[INFO] [Kafka] Evento '${kafkaEvt.eventType}' publicado en topic 'orders.events' con key='${order.id}'`,
      ...prev
    ]);
  };

  return (
    <div id="state-machine-simulator" className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Simulador de Máquina de Estados &amp; Reglas de Negocio
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba en tiempo real las reglas de transición y las integraciones con OpenFeign, RabbitMQ y Kafka.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasStockInCatalog}
                onChange={e => setHasStockInCatalog(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Catálogo tiene stock disponible</span>
            </label>

            <button
              id="reset-order-btn"
              onClick={resetOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reiniciar Pedido
            </button>
          </div>
        </div>

        {/* Current Order Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-1">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">ID Pedido</div>
            <div className="text-xs font-mono text-slate-200 truncate mt-1">{order.id}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Cliente</div>
            <div className="text-xs font-mono text-emerald-400 mt-1">{order.clientId}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Total (USD)</div>
            <div className="text-sm font-semibold text-slate-100 mt-0.5">${order.total.toFixed(2)}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Items Solicitados</div>
            <div className="text-xs text-slate-300 mt-1">{order.items.length} productos ({order.items.reduce((a,b)=>a+b.quantity,0)} un.)</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Estado Actual</div>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wide ${
                order.status === 'CREADO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                order.status === 'ACEPTADO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                order.status === 'EN_PREPARACION' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                order.status === 'DESPACHADO' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                order.status === 'ENTREGADO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 mb-3 font-medium">Ciclo de Vida del Pedido:</div>
          <div className="flex flex-wrap items-center gap-2">
            {ALL_STATUSES.map((status, idx) => {
              const isActive = order.status === status;
              return (
                <React.Fragment key={status}>
                  <button
                    id={`transition-to-${status.toLowerCase()}`}
                    onClick={() => attemptTransition(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold ring-2 ring-emerald-400/50 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{status}</span>
                  </button>
                  {idx < ALL_STATUSES.length - 2 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-rose-300">Excepción en Servidor (RFC 7807 ProblemDetail):</span>
              <p className="mt-0.5 font-mono">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Feign & Messaging Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* OpenFeign Catalog Call Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                OpenFeign: ms-pedidos360-catalog
              </span>
            </div>
            {feignCallDetail ? (
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                feignCallDetail.status === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                HTTP {feignCallDetail.status}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Sin llamadas recientes</span>
            )}
          </div>

          <div className="flex-1 mt-3 space-y-2 text-xs font-mono">
            <div className="text-slate-400">Endpoint objetivo:</div>
            <div className="p-2 rounded bg-slate-950 text-slate-300 text-[11px] break-all border border-slate-800">
              POST /api/catalog/stock/discount
            </div>

            <div className="text-slate-400 mt-2">Detalle de respuesta síncrona:</div>
            <pre className="p-2 rounded bg-slate-950 text-sky-300 text-[11px] h-36 overflow-auto border border-slate-800">
              {feignCallDetail ? JSON.stringify(feignCallDetail.response, null, 2) : '// Transición a ACEPTADO para disparar la llamada Feign'}
            </pre>
          </div>
        </div>

        {/* RabbitMQ Envelope */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                RabbitMQ: cmd.direct / email.send
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              AMQP Envelope
            </span>
          </div>

          <div className="flex-1 mt-3 space-y-2 text-xs font-mono">
            <div className="text-slate-400">Estructura del Mensaje Envelope:</div>
            <pre className="p-2 rounded bg-slate-950 text-amber-300 text-[11px] h-48 overflow-auto border border-slate-800">
              {lastRabbitEnvelope ? JSON.stringify(lastRabbitEnvelope, null, 2) : '// Realice una transición para emitir un envelope'}
            </pre>
          </div>
        </div>
      </div>

      {/* Kafka Event Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Apache Kafka: Topic "orders.events"
            </span>
          </div>
          <span className="text-[11px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            Domain Event Streaming
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1 space-y-2">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Partition Key</span>
              <span className="text-purple-300 font-mono text-[11px] break-all">{order.id}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Event Type</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                {lastKafkaEvent ? lastKafkaEvent.eventType : 'OrderCreated'}
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <pre className="p-2.5 rounded bg-slate-950 text-purple-200 text-[11px] font-mono h-32 overflow-auto border border-slate-800">
              {lastKafkaEvent ? JSON.stringify(lastKafkaEvent, null, 2) : '// Esperando evento de negocio...'}
            </pre>
          </div>
        </div>
      </div>

      {/* Execution Logs */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            Consola de Ejecución &amp; Logs de Servidor (Spring Boot 3)
          </span>
          <button
            onClick={() => setSimulatedLogs([])}
            className="text-[11px] text-slate-500 hover:text-slate-300 font-mono"
          >
            Limpiar logs
          </button>
        </div>

        <div className="h-32 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
          {simulatedLogs.map((log, idx) => (
            <div key={idx} className={`leading-relaxed ${
              log.includes('[ERROR]') ? 'text-rose-400' :
              log.includes('[WARN]') ? 'text-amber-300' :
              'text-slate-300'
            }`}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
