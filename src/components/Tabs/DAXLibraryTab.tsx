import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { MedidaDAX, EquivalenciaItem, Evidencia } from '../../types';
import { exportToDAXScript } from '../../utils/ticExportImport';

interface DAXLibraryTabProps {
  medidasDax: MedidaDAX[];
  equivalencias: EquivalenciaItem[];
  evidencias: Evidencia[];
}

export const DAXLibraryTab: React.FC<DAXLibraryTabProps> = ({
  medidasDax,
  equivalencias,
  evidencias,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'medidas' | 'equivalencias' | 'evidencias'>('medidas');

  const handleCopyFormula = (formula: string, idx: number) => {
    navigator.clipboard.writeText(formula);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredMedidas = selectedSessionFilter === 'all'
    ? medidasDax
    : medidasDax.filter((m) => m.sesion === selectedSessionFilter);

  const filteredEquivalencias = selectedSessionFilter === 'all'
    ? equivalencias
    : equivalencias.filter((e) => e.sesion === selectedSessionFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Biblioteca Oficial DAX &amp; Reconciliación Excel ↔ Power BI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Alfredo de Jesús Pérez Méndez · SENA CTAPT 2026 · Ficha CPL_3410829
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs">
            <button
              onClick={() => setViewMode('medidas')}
              className={`px-3 py-1 font-semibold rounded ${
                viewMode === 'medidas'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Fórmulas DAX ({medidasDax.length})
            </button>
            <button
              onClick={() => setViewMode('equivalencias')}
              className={`px-3 py-1 font-semibold rounded ${
                viewMode === 'equivalencias'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Reconciliación Excel
            </button>
            <button
              onClick={() => setViewMode('evidencias')}
              className={`px-3 py-1 font-semibold rounded ${
                viewMode === 'evidencias'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Cronograma &amp; Evidencias
            </button>
          </div>

          {/* Export DAX file */}
          <button
            onClick={() => exportToDAXScript(medidasDax)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            title="Descargar script con todas las fórmulas DAX (.dax)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .DAX</span>
          </button>
        </div>
      </div>

      {/* Session Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium">Filtrar por Sesión:</span>
        {[
          { id: 'all', label: 'Todas las Sesiones' },
          { id: 1, label: 'Sesión 1: Conteo & Columnas' },
          { id: 2, label: 'Sesión 2: AVERAGE & DIVIDE' },
          { id: 3, label: 'Sesión 3: CALCULATE & Metas' },
          { id: 4, label: 'Sesión 4: DAX Avanzado & MoM' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSessionFilter(s.id as number | 'all')}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
              selectedSessionFilter === s.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: MEDIDAS DAX GRID */}
      {viewMode === 'medidas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedidas.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-600 shrink-0" />
                    {item.objeto}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Sesión {item.sesion}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  {item.paraQueSirve} · <span className="italic">{item.dondeSeCrea}</span>
                </p>

                {/* Formula Block */}
                <div className="bg-slate-900 text-emerald-400 dark:bg-slate-950 p-3 rounded font-mono text-xs overflow-x-auto leading-relaxed relative group">
                  <code>{item.formulaDax}</code>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleCopyFormula(item.formulaDax, idx)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copiada al Portapapeles</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Fórmula</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: RECONCILIACION EXCEL */}
      {viewMode === 'equivalencias' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Reconciliación Excel ↔ DAX (Control de Igualdad)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Si su medida no coincide con 'Resultado Excel', revise filtros de contexto, celdas vacías y relaciones *:1.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Sesión</th>
                  <th className="py-2.5 px-3">Concepto</th>
                  <th className="py-2.5 px-3">Fórmula Excel (Viva)</th>
                  <th className="py-2.5 px-3">Medida DAX Equivalente</th>
                  <th className="py-2.5 px-3 text-right">Resultado Excel</th>
                  <th className="py-2.5 px-3 text-center">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono tabular-nums">
                {filteredEquivalencias.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-500">S{e.sesion}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {e.concepto}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      <code>{e.formulaExcel}</code>
                    </td>
                    <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <code>{e.medidaDax}</code>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {typeof e.resultadoExcel === 'number'
                        ? e.resultadoExcel.toLocaleString('es-CO')
                        : e.resultadoExcel}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Coincide
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CRONOGRAMA & EVIDENCIAS */}
      {viewMode === 'evidencias' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Lista de Evidencias de Aprendizaje · Padlet SENA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Plazo: una semana por entrega. Enlace al Padlet del curso activo.
              </p>
            </div>

            <a
              href="https://padlet.com/alferezteacher/proyectar-requerimientos-del-cliente-g5_rap1_3410829_n-obrer-8vz7zqcx1j6ngvji"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <span>Abrir Padlet del Curso</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {evidencias.map((ev, idx) => (
              <div
                key={idx}
                className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      Sesión {ev.sesion}: {ev.tema}
                    </span>
                    <span className="text-slate-400">· Plazo: {ev.plazo}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Entregables:</strong> {ev.evidencias}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded">
                    {ev.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
