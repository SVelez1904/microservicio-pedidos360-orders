import React, { useState } from 'react';
import { Send, Copy, Check, Play, BookOpen } from 'lucide-react';

export const ApiPlayground: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<'create' | 'getById' | 'updateStatus' | 'list'>('create');
  const [responseOutput, setResponseOutput] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Sample payloads
  const createPayload = JSON.stringify({
    clientId: 'CLI-SCL-9281',
    items: [
      {
        productId: 'SKU-LAPTOP-PRO-16',
        quantity: 1,
        unitPrice: 399.90
      },
      {
        productId: 'SKU-MOUSE-WIRELESS',
        quantity: 2,
        unitPrice: 45.00
      }
    ]
  }, null, 2);

  const updateStatusPayload = JSON.stringify({
    status: 'ACEPTADO',
    reason: 'Pago validado contra pasarela y stock verificado'
  }, null, 2);

  const executeRequest = () => {
    if (activeEndpoint === 'create') {
      setStatusCode(201);
      setResponseOutput(JSON.stringify({
        id: '550e8400-e29b-41d4-a716-446655440000',
        clientId: 'CLI-SCL-9281',
        status: 'CREADO',
        total: 489.90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: '992b8400-e29b-41d4-a716-446655440001',
            productId: 'SKU-LAPTOP-PRO-16',
            quantity: 1,
            unitPrice: 399.90,
            subtotal: 399.90
          },
          {
            id: '992b8400-e29b-41d4-a716-446655440002',
            productId: 'SKU-MOUSE-WIRELESS',
            quantity: 2,
            unitPrice: 45.00,
            subtotal: 90.00
          }
        ]
      }, null, 2));
    } else if (activeEndpoint === 'updateStatus') {
      setStatusCode(200);
      setResponseOutput(JSON.stringify({
        id: '550e8400-e29b-41d4-a716-446655440000',
        clientId: 'CLI-SCL-9281',
        status: 'ACEPTADO',
        total: 489.90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: '992b8400-e29b-41d4-a716-446655440001',
            productId: 'SKU-LAPTOP-PRO-16',
            quantity: 1,
            unitPrice: 399.90,
            subtotal: 399.90
          }
        ]
      }, null, 2));
    } else if (activeEndpoint === 'getById') {
      setStatusCode(200);
      setResponseOutput(JSON.stringify({
        id: '550e8400-e29b-41d4-a716-446655440000',
        clientId: 'CLI-SCL-9281',
        status: 'CREADO',
        total: 489.90,
        createdAt: '2026-09-09T16:00:00Z',
        updatedAt: '2026-09-09T16:00:00Z',
        items: [
          {
            id: '992b8400-e29b-41d4-a716-446655440001',
            productId: 'SKU-LAPTOP-PRO-16',
            quantity: 1,
            unitPrice: 399.90,
            subtotal: 399.90
          }
        ]
      }, null, 2));
    } else {
      setStatusCode(200);
      setResponseOutput(JSON.stringify({
        content: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            clientId: 'CLI-SCL-9281',
            status: 'CREADO',
            total: 489.90
          }
        ],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 1,
        totalPages: 1
      }, null, 2));
    }
  };

  const getCurlCommand = () => {
    switch (activeEndpoint) {
      case 'create':
        return `curl -X POST https://api.pedidos360.com/api/orders \\
  -H "Authorization: Bearer <AZURE_AD_JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '${createPayload.replace(/\n/g, '')}'`;
      case 'updateStatus':
        return `curl -X PATCH https://api.pedidos360.com/api/orders/550e8400-e29b-41d4-a716-446655440000/status \\
  -H "Authorization: Bearer <AZURE_AD_JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '${updateStatusPayload.replace(/\n/g, '')}'`;
      case 'getById':
        return `curl -X GET https://api.pedidos360.com/api/orders/550e8400-e29b-41d4-a716-446655440000 \\
  -H "Authorization: Bearer <AZURE_AD_JWT_TOKEN>"`;
      case 'list':
        return `curl -X GET "https://api.pedidos360.com/api/orders?page=0&size=20&status=CREADO" \\
  -H "Authorization: Bearer <AZURE_AD_JWT_TOKEN>"`;
    }
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div id="api-playground" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              OpenAPI 3 / Springdoc Swagger UI Playground
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Rutas expuestas bajo el contexto <code className="text-emerald-400 font-mono">/api/orders/*</code> con seguridad OAuth2 Bearer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              Swagger UI: /swagger-ui.html
            </span>
          </div>
        </div>

        {/* Endpoints Nav */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            id="endpoint-tab-create"
            onClick={() => { setActiveEndpoint('create'); setResponseOutput(''); setStatusCode(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition border flex items-center gap-2 ${
              activeEndpoint === 'create'
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">POST</span>
            <span>/api/orders</span>
          </button>

          <button
            id="endpoint-tab-status"
            onClick={() => { setActiveEndpoint('updateStatus'); setResponseOutput(''); setStatusCode(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition border flex items-center gap-2 ${
              activeEndpoint === 'updateStatus'
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">PATCH</span>
            <span>/api/orders/{'{id}'}/status</span>
          </button>

          <button
            id="endpoint-tab-get"
            onClick={() => { setActiveEndpoint('getById'); setResponseOutput(''); setStatusCode(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition border flex items-center gap-2 ${
              activeEndpoint === 'getById'
                ? 'bg-sky-600/20 text-sky-300 border-sky-500/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">GET</span>
            <span>/api/orders/{'{id}'}</span>
          </button>

          <button
            id="endpoint-tab-list"
            onClick={() => { setActiveEndpoint('list'); setResponseOutput(''); setStatusCode(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition border flex items-center gap-2 ${
              activeEndpoint === 'list'
                ? 'bg-sky-600/20 text-sky-300 border-sky-500/50'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">GET</span>
            <span>/api/orders</span>
          </button>
        </div>

        {/* Action Panel */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Request Config */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-300 font-semibold">Request Body (JSON)</span>
                <span className="text-[11px] text-slate-500 font-mono">Content-Type: application/json</span>
              </div>

              <div className="mt-3">
                {activeEndpoint === 'create' && (
                  <pre className="p-3 rounded bg-slate-900 text-slate-200 font-mono text-xs overflow-auto border border-slate-800 h-52">
                    {createPayload}
                  </pre>
                )}
                {activeEndpoint === 'updateStatus' && (
                  <pre className="p-3 rounded bg-slate-900 text-slate-200 font-mono text-xs overflow-auto border border-slate-800 h-52">
                    {updateStatusPayload}
                  </pre>
                )}
                {activeEndpoint === 'getById' && (
                  <div className="p-3 rounded bg-slate-900 text-slate-300 font-mono text-xs border border-slate-800 h-52 flex flex-col justify-center">
                    <span className="text-slate-500 block mb-1">Path Variable:</span>
                    <span className="text-sky-300">id = 550e8400-e29b-41d4-a716-446655440000</span>
                  </div>
                )}
                {activeEndpoint === 'list' && (
                  <div className="p-3 rounded bg-slate-900 text-slate-300 font-mono text-xs border border-slate-800 h-52 space-y-2 flex flex-col justify-center">
                    <div><span className="text-slate-500">clientId:</span> CLI-SCL-9281 (opcional)</div>
                    <div><span className="text-slate-500">status:</span> CREADO (opcional)</div>
                    <div><span className="text-slate-500">pageable:</span> page=0, size=20, sort=createdAt,desc</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                id="copy-curl-btn"
                onClick={copyCurl}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-mono transition"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'cURL copiado' : 'Copiar cURL'}</span>
              </button>

              <button
                id="send-api-request-btn"
                onClick={executeRequest}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Ejecutar Petición
              </button>
            </div>
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-300 font-semibold">Response Payload</span>
              {statusCode ? (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HTTP {statusCode}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">Sin respuesta</span>
              )}
            </div>

            <pre className="mt-3 flex-1 p-3 rounded bg-slate-900 text-emerald-300 font-mono text-xs overflow-auto border border-slate-800 h-52">
              {responseOutput || '// Presiona "Ejecutar Petición" para probar este endpoint'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
