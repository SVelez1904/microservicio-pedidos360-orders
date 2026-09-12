import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Send, 
  Mail, 
  Server, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Cpu
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div id="architecture-diagram" className="space-y-6">
      {/* High-level summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            Arquitectura de Microservicios Pedidos360
          </span>
          <h2 className="text-xl font-bold text-white mt-3">
            ms-pedidos360-orders: Topología &amp; Componentes
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Diseñado bajo patrones de arquitectura hexagonal / limpia con desacoplamiento asíncrono
            (RabbitMQ y Kafka) y llamadas síncronas resilientes (OpenFeign) sobre infraestructura cloud AWS RDS y Microsoft Entra ID.
          </p>
        </div>

        {/* Diagram visual layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Ingress & Security */}
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Identidad &amp; Auth</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Microsoft Entra ID (Azure AD)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Emite tokens JWT RS256 con claims <code className="text-indigo-300">roles</code> y <code className="text-indigo-300">scp</code>.
              </p>
              <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-indigo-300">
                iss: https://login.microsoftonline.com/&lbrace;tenant&rbrace;/v2.0
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ExternalLink className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Ingreso REST / Clients</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Clientes &amp; API Gateway</h4>
              <p className="text-xs text-slate-400 mt-1">
                Peticiones HTTPS con header <code className="text-emerald-300">Authorization: Bearer &lt;jwt&gt;</code> hacia <code className="text-emerald-300">/api/orders/*</code>.
              </p>
              <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                Swagger UI: /swagger-ui.html<br/>
                OpenAPI 3: /v3/api-docs
              </div>
            </div>
          </div>

          {/* Column 2: Central Core Microservice */}
          <div className="bg-slate-950 border-2 border-emerald-500/40 p-5 rounded-xl shadow-2xl relative">
            <div className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              CORE SERVICE
            </div>

            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Cpu className="w-5 h-5" />
              <span className="text-xs font-bold uppercase font-mono tracking-wider">Spring Boot 3.3 / Java 21</span>
            </div>

            <h3 className="text-base font-bold text-white">ms-pedidos360-orders</h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Spring Security 6.3</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  JwtAuthenticationConverter decodifica roles <code className="text-emerald-300">ROLE_Orders.Create</code>, etc.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">OrderStateMachineService</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Valida transiciones y bloquea <code className="text-amber-300">DESPACHADO</code> si no está en <code className="text-emerald-300">ACEPTADO</code> o <code className="text-emerald-300">EN_PREPARACION</code>.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Spring Data JPA &amp; HikariCP</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Transaccionalidad ACID en PostgreSQL AWS RDS.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-200">Spring Cloud OpenFeign</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Cliente HTTP declarativo hacia <code className="text-sky-300">ms-pedidos360-catalog</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Downstream & Integrations */}
          <div className="space-y-4">
            {/* RDS Postgres */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Persistencia Cloud</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">PostgreSQL (AWS RDS)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Almacén relacional con pooling de conexiones HikariCP y esquemas relacionales <code className="text-slate-300">orders</code> y <code className="text-slate-300">order_items</code>.
              </p>
            </div>

            {/* OpenFeign */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Server className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Sync HTTP (Feign)</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">ms-pedidos360-catalog</h4>
              <p className="text-xs text-slate-400 mt-1">
                Descuento de stock en tiempo real al transitar al estado <code className="text-cyan-300">ACEPTADO</code>.
              </p>
            </div>

            {/* RabbitMQ */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Async Notifications</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">RabbitMQ Broker</h4>
              <p className="text-xs text-slate-400 mt-1">
                Exchange <code className="text-amber-300">cmd.direct</code> con routing key <code className="text-amber-300">email.send</code> bajo formato Envelope.
              </p>
            </div>

            {/* Kafka */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Send className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Event Streaming</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Apache Kafka / AWS MSK</h4>
              <p className="text-xs text-slate-400 mt-1">
                Topic <code className="text-purple-300">orders.events</code> para coreografía de eventos de negocio distribuida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
