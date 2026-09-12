import React, { useState } from 'react';
import { 
  Code2, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  Network, 
  Download, 
  ExternalLink,
  Cpu,
  Database,
  Mail,
  Send
} from 'lucide-react';
import { CodeViewer } from './components/CodeViewer';
import { StateMachineSimulator } from './components/StateMachineSimulator';
import { SecurityInspector } from './components/SecurityInspector';
import { ApiPlayground } from './components/ApiPlayground';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';

export default function App() {
  const [activeTab, setActiveTab] = useState<'code' | 'simulator' | 'security' | 'api' | 'architecture'>('code');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
              360
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                  ms-pedidos360-orders
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Spring Boot 3.3 &bull; Java 21
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Microservicio Backend para Gestión de Pedidos &bull; PostgreSQL RDS &bull; Azure AD &bull; RabbitMQ &bull; Kafka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              AWS RDS PostgreSQL
            </span>
            <span className="text-xs font-mono text-slate-400 hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Azure AD OAuth2
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 border-t border-slate-800/80">
          <button
            id="tab-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition ${
              activeTab === 'code'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Código Fuente &amp; POM</span>
          </button>

          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition ${
              activeTab === 'simulator'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Simulador Máquina de Estados</span>
          </button>

          <button
            id="tab-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition ${
              activeTab === 'security'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Seguridad Azure AD (OAuth2)</span>
          </button>

          <button
            id="tab-api"
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition ${
              activeTab === 'api'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>OpenAPI 3 / Swagger Tester</span>
          </button>

          <button
            id="tab-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 whitespace-nowrap transition ${
              activeTab === 'architecture'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Diagrama de Arquitectura</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'simulator' && <StateMachineSimulator />}
        {activeTab === 'security' && <SecurityInspector />}
        {activeTab === 'api' && <ApiPlayground />}
        {activeTab === 'architecture' && <ArchitectureDiagram />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        Arquitectura de Microservicios &bull; Spring Boot 3.3.4 &bull; Java 21 LTS &bull; ms-pedidos360-orders
      </footer>
    </div>
  );
}
