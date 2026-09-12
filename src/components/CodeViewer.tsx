import React, { useState } from 'react';
import { SOURCE_FILES } from '../data/sourceCode';
import { SourceFile } from '../types';
import { Copy, Check, Download, FileCode, Folder, Code2 } from 'lucide-react';
import JSZip from 'jszip';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SourceFile>(SOURCE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('ms-pedidos360-orders');

      SOURCE_FILES.forEach(file => {
        folder?.file(file.path, file.code);
      });

      // Add Dockerfile and README
      folder?.file('Dockerfile', `# Build Stage
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/ms-pedidos360-orders-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`);

      folder?.file('README.md', `# ms-pedidos360-orders
Microservicio de Pedidos con Spring Boot 3.3, Java 21, AWS RDS Postgres, Azure AD, RabbitMQ, Kafka y OpenFeign.`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ms-pedidos360-orders-spring-boot-21.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div id="code-viewer-container" className="flex flex-col lg:flex-row gap-4 h-[780px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* File Tree Sidebar */}
      <div className="w-full lg:w-80 bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">ms-pedidos360-orders</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Java 21
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {SOURCE_FILES.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                id={`file-btn-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="truncate">{file.path.split('/').pop()}</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                  {file.category}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <button
            id="download-zip-btn"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isZipping ? 'Generando ZIP...' : 'Descargar Proyecto Completo (.ZIP)'}
          </button>
        </div>
      </div>

      {/* Editor & Content View */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
        {/* Top Header */}
        <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-mono text-xs text-slate-300 truncate">{selectedFile.path}</span>
            <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">({selectedFile.title})</span>
          </div>

          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-950/30 leading-relaxed select-text">
          <pre className="whitespace-pre">
            {selectedFile.code.split('\n').map((line, idx) => (
              <div key={idx} className="table-row">
                <span className="table-cell text-right pr-4 select-none text-slate-600 w-10 text-[11px]">
                  {idx + 1}
                </span>
                <span className="table-cell">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
