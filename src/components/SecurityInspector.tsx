import React, { useState } from 'react';
import { Shield, Key, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

export const SecurityInspector: React.FC = () => {
  const [selectedRolePreset, setSelectedRolePreset] = useState<'admin' | 'creator' | 'reader' | 'unauthorized'>('admin');

  const rolePresets = {
    admin: {
      name: 'Admin de Pedidos',
      roles: ['Orders.Admin', 'Orders.Create', 'Orders.Read', 'Orders.Update'],
      scp: 'Orders.Read Orders.Write',
      authorities: [
        'ROLE_Orders.Admin',
        'ROLE_Orders.Create',
        'ROLE_Orders.Read',
        'ROLE_Orders.Update',
        'SCOPE_Orders.Read',
        'SCOPE_Orders.Write'
      ]
    },
    creator: {
      name: 'Operador de Ventas',
      roles: ['Orders.Create', 'Orders.Read'],
      scp: 'Orders.Write',
      authorities: ['ROLE_Orders.Create', 'ROLE_Orders.Read', 'SCOPE_Orders.Write']
    },
    reader: {
      name: 'Consultor de Lectura',
      roles: ['Orders.Read'],
      scp: 'Orders.Read',
      authorities: ['ROLE_Orders.Read', 'SCOPE_Orders.Read']
    },
    unauthorized: {
      name: 'Usuario sin roles asignados',
      roles: [],
      scp: '',
      authorities: []
    }
  };

  const active = rolePresets[selectedRolePreset];

  const sampleJwtPayload = {
    aud: 'api://ms-pedidos360-orders',
    iss: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/v2.0',
    iat: Math.floor(Date.now() / 1000) - 300,
    nbf: Math.floor(Date.now() / 1000) - 300,
    exp: Math.floor(Date.now() / 1000) + 3300,
    sub: 'auth0|usr_94829104',
    name: 'Carlos Mendoza',
    preferred_username: 'carlos.mendoza@pedidos360.com',
    roles: active.roles,
    scp: active.scp,
    tid: '72f988bf-86f1-41af-91ab-2d7cd011db47'
  };

  return (
    <div id="security-inspector" className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Spring Security 6 &amp; Azure AD (Microsoft Entra ID) JWT Token Inspector
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demuestra cómo el <code className="text-indigo-300 font-mono">JwtAuthenticationConverter</code> mapea claims de Azure AD a <code className="text-indigo-300 font-mono">GrantedAuthority</code>.
            </p>
          </div>
        </div>

        {/* Role Preset Selector */}
        <div className="mt-5">
          <label className="text-xs text-slate-400 uppercase tracking-wider font-mono block mb-2 font-medium">
            Simular Perfil de Usuario en Azure AD:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(rolePresets) as Array<keyof typeof rolePresets>).map((key) => {
              const preset = rolePresets[key];
              const isSelected = selectedRolePreset === key;
              return (
                <button
                  key={key}
                  id={`role-preset-${key}`}
                  onClick={() => setSelectedRolePreset(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-[10px] opacity-75 font-mono mt-0.5">
                    {preset.roles.length} roles claim
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* JWT Payload and Authorities Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Decoded JWT Claims */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-indigo-400 flex items-center gap-1.5 font-semibold">
                <Key className="w-3.5 h-3.5" />
                Claims en Payload JWT (Azure AD RS256)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">iss validado con Entra ID</span>
            </div>
            <pre className="mt-3 text-[11px] font-mono text-slate-300 overflow-auto flex-1 h-56 p-2 bg-slate-900/50 rounded border border-slate-800/60">
              {JSON.stringify(sampleJwtPayload, null, 2)}
            </pre>
          </div>

          {/* Spring Security Granted Authorities Result */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GrantedAuthorities en SecurityContext
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Spring Security 6</span>
            </div>

            <div className="mt-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Autoridades generadas por <code className="text-emerald-300">azureAdJwtAuthenticationConverter()</code>:
                </p>
                {active.authorities.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {active.authorities.map((auth) => (
                      <span
                        key={auth}
                        className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs"
                      >
                        {auth}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-rose-950/30 rounded border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Sin autoridades asignadas. Todas las rutas <code className="font-mono">/api/orders/**</code> retornarán 403 Forbidden.
                  </div>
                )}
              </div>

              {/* Endpoint Access Evaluation */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="text-[11px] font-mono text-slate-500 mb-1">Evaluación de @PreAuthorize:</div>
                <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900 text-slate-300">
                  <span className="font-mono">GET /api/orders/*</span>
                  <span className={`text-[11px] font-mono font-bold ${
                    active.authorities.some(a => a === 'ROLE_Orders.Read' || a === 'ROLE_Orders.Admin' || a === 'SCOPE_Orders.Read')
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}>
                    {active.authorities.some(a => a === 'ROLE_Orders.Read' || a === 'ROLE_Orders.Admin' || a === 'SCOPE_Orders.Read')
                      ? 'PERMITIDO (200)'
                      : 'DENEGADO (403)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900 text-slate-300">
                  <span className="font-mono">POST /api/orders</span>
                  <span className={`text-[11px] font-mono font-bold ${
                    active.authorities.some(a => a === 'ROLE_Orders.Create' || a === 'ROLE_Orders.Admin')
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}>
                    {active.authorities.some(a => a === 'ROLE_Orders.Create' || a === 'ROLE_Orders.Admin')
                      ? 'PERMITIDO (201)'
                      : 'DENEGADO (403)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900 text-slate-300">
                  <span className="font-mono">PATCH /api/orders/{'{id}'}/status</span>
                  <span className={`text-[11px] font-mono font-bold ${
                    active.authorities.some(a => a === 'ROLE_Orders.Update' || a === 'ROLE_Orders.Admin')
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}>
                    {active.authorities.some(a => a === 'ROLE_Orders.Update' || a === 'ROLE_Orders.Admin')
                      ? 'PERMITIDO (200)'
                      : 'DENEGADO (403)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
